<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{route.query?.id?'修改图片':'创建图片'}}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
<!--    选择上传方式-->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <!--    图片上传组件-->
        <PictureUpload :onSuccess="onSuccess" :picture="picture" :spaceId="spaceId" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传" force-render>
        <UrlPictureUpload :onSuccess="onSuccess" :picture="picture" :spaceId="spaceId"/>
      </a-tab-pane>
    </a-tabs>
<!--    图片编辑-->
    <div v-if="picture" class="edit-bar">
      <a-space size="middle">
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-button type="primary" :icon="h(FullscreenOutlined)" @click="doImagePainting">AI扩图</a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <ImageOutPainting ref="imageOutPaintingRef"
        :picture="picture"
                        :spaceId="spaceId"
                        :onSuccess="onImageOutPaintingSuccess"
      />
    </div>

<!--    图片信息表单-->
    <a-form v-if="picture" name="pictureForm" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="输入名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea v-model:value="pictureForm.introduction" placeholder="输入简介" :autoSize="{maxRows:5,minRows:2}" allow-clear />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete v-model:value="pictureForm.category" placeholder="请输入分类" allow-clear :options="categoryOptions"/>
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select v-model:value="pictureForm.tags" mode="tags" placeholder="请输入标签" allow-clear :options="tagOptions" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from "@/components/PictureUpload.vue";
import {computed, onMounted, reactive, ref,h} from "vue";
import {userLoginUsingPost} from "@/api/userController";
// import router from "@/router";
import {message} from "ant-design-vue";
import {editPictureUsingPost, getPictureVoByIdUsingGet, listPictureTagCategoryUsingGet} from "@/api/pictureController";
import {useRoute,useRouter} from "vue-router";
import UrlPictureUpload from "@/components/UrlPictureUpload.vue";
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPainting from "@/components/ImageOutPainting.vue";

const picture = ref<API.PictureVO>()
const pictureForm =reactive<API.PictureEditRequest>({})
const uploadType = ref<'file'|'url'>('file')
const route = useRoute()
const router = useRouter()
const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
const spaceId = computed(()=>{
  return route.query?.spaceId;
})

const onSuccess = (newPicture:API.PictureVO)=>{
  picture.value = newPicture;
  pictureForm.name=newPicture.name
}

//提交表单。此时相当于编辑图片信息
const handleSubmit = async (values: any) => {
  const pictureId = picture.value.id
  if(!pictureId){
    return
  }
//图片id、...values相当于展开各项，包括名称、简介、分类、标签
  const res = await editPictureUsingPost({
    id:pictureId,
    spaceId:spaceId.value,
    ...values
  })
  if(res.data.code === 0 && res.data.data){
    message.success('创建成功')
    router.push({
      path:`/picture/${pictureId}`
    })
  }else{
    message.error('创建失败'+res.data.message)
  }
};

const getTagCategoryOptions  = async () =>{
  const res=  await listPictureTagCategoryUsingGet()
  if(res.data.code === 0 && res.data.data){
    tagOptions.value = (res.data.data.tagList ?? []).map((data:string) =>{
      return {
        value:data,
        label:data
      }
    })

    categoryOptions.value = (res.data.data.categoryList?? []).map((data:string)=>{
      return {
        value:data,
        label:data
      }
    })
  }else{
    message.error('获取标签分页列表失败'+res.data.message)
  }
}

onMounted(()=>{
  getTagCategoryOptions()
  getOldPicture()
})

//获取老数据
const  getOldPicture = async ()=>{
  //获取到id
  const id = route.query?.id
  if(id){
    const res = await getPictureVoByIdUsingGet({
      id
    })
    if(res.data.code === 0&& res.data.data){
      const data =  res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

//图片编辑器引用
const imageCropperRef = ref()
// ----- AI 扩图引用 -----
const imageOutPaintingRef = ref()

const onCropSuccess = (newPicture:API.PictureVO) =>{
  picture.value = newPicture
}

// AI 扩图保存事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}
const doEditPicture = async ()=>{
  imageCropperRef.value?.openModal()
}

// 打开 AI 扩图弹窗
const doImagePainting = async () => {
  imageOutPaintingRef.value?.openModal()
}
</script>

<style scoped>
#addPicturePage{
max-width: 720px;
  margin: 0 auto ;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>
