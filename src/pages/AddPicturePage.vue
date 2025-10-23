<template>
  <div id="addPicturePage">
    <div style="display: flex; align-items: center; margin-bottom: 16px">
      <a-button
        type="text"
        :icon="h(ArrowLeftOutlined)"
        @click="goBack"
        style="margin-right: 8px"
      />
      <h2 style="margin: 0">
        {{route.query?.id?'修改图片':'创建图片'}}
      </h2>
    </div>
    <a-typography-paragraph v-if="spaceId && spaceName" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`">{{ spaceName }}</a>
    </a-typography-paragraph>
<!--    选择上传方式-->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="单图上传">
        <!--    图片上传组件-->
        <PictureUpload :onSuccess="onSuccess" :picture="picture" :spaceId="spaceId" />
      </a-tab-pane>
      <a-tab-pane key="batch" tab="批量上传" force-render>
        <PictureBatchUpload :onSuccess="onBatchSuccess" :spaceId="spaceId"/>
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
      <a-form-item name="categoryId" label="分类">
<!--        <a-auto-complete v-model:value="pictureForm.category" placeholder="请输入分类" allow-clear :options="categoryOptions"/>-->
        <a-select v-model:value="pictureForm.categoryId" placeholder="请输入分类" allow-clear :options="categoryOptions" />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select v-model:value="pictureForm.tags" mode="tags" placeholder="请输入标签" allow-clear :options="tagOptions" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">创建</a-button>
      </a-form-item>
    </a-form>

<!--    批量编辑表单-->
    <a-form v-if="batchPictureList.length > 0" name="batchPictureForm" layout="vertical" :model="batchPictureForm" @finish="handleBatchSubmit">
      <a-divider>批量设置图片信息</a-divider>
      <a-alert
        message="提示"
        :description="`将为 ${batchPictureList.length} 张图片统一设置以下信息`"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-form-item name="categoryId" label="分类">
        <a-select v-model:value="batchPictureForm.categoryId" placeholder="请选择分类（选填）" allow-clear :options="categoryOptions" />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select v-model:value="batchPictureForm.tags" mode="tags" placeholder="请输入标签（选填）" allow-clear :options="tagOptions" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" size="large">批量保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from "@/components/PictureUpload.vue";
import PictureBatchUpload from "@/components/PictureBatchUpload.vue";
import {computed, onMounted, reactive, ref,h} from "vue";
import {userLoginUsingPost} from "@/api/userController";
// import router from "@/router";
import {message} from "ant-design-vue";
import {editPictureUsingPost, getPictureVoByIdUsingGet, editPictureByBatchUsingPost} from "@/api/pictureController";
import {getCategoryListAsHomeUsingGet} from '@/api/categoryController.ts'
import {useRoute,useRouter} from "vue-router";
import { EditOutlined, FullscreenOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import ImageOutPainting from "@/components/ImageOutPainting.vue";
import {getSpaceVoByIdUsingGet} from "@/api/spaceController";
const picture = ref<API.PictureVO>()
const pictureForm =reactive<API.PictureEditRequest>({})
const uploadType = ref<'file'|'batch'>('file')
// 批量上传的图片列表
const batchPictureList = ref<API.PictureVO[]>([])
// 批量编辑表单
const batchPictureForm = reactive<API.PictureEditByBatchRequest>({
  pictureIdList: [],
  categoryId: undefined,
  tags: []
})
const route = useRoute()
const router = useRouter()
const categoryOptions = ref<API.CategoryVO[]>([])
const tagOptions = ref<string[]>([])
const spaceName = ref<string>('')
const spaceId = computed(()=>{
  return route.query?.spaceId;
})


const onSuccess = (newPicture:API.PictureVO)=>{
  picture.value = newPicture;
  pictureForm.name=newPicture.name
}

// 批量上传成功回调
const onBatchSuccess = (pictureList: API.PictureVO[]) => {
  batchPictureList.value = pictureList;
  // 提取所有图片ID
  batchPictureForm.pictureIdList = pictureList.map(pic => pic.id);
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

// 批量提交表单
const handleBatchSubmit = async (values: any) => {
  if (!batchPictureForm.pictureIdList || batchPictureForm.pictureIdList.length === 0) {
    message.error('没有可保存的图片')
    return
  }

  // 如果没有填写任何信息，给出提示
  if (!values.categoryId && (!values.tags || values.tags.length === 0)) {
    message.warning('请至少设置分类或标签')
    return
  }

  const res = await editPictureByBatchUsingPost({
    pictureIdList: batchPictureForm.pictureIdList,
    spaceId: spaceId.value,
    categoryId: values.categoryId,
    tags: values.tags || []
  })

  if (res.data.code === 0 && res.data.data) {
    message.success(`成功保存 ${batchPictureForm.pictureIdList.length} 张图片`)

    // 跳转到空间页面或图片列表
    if (spaceId.value) {
      router.push({
        path: `/space/${spaceId.value}`
      })
    } else {
      router.push({
        path: '/'
      })
    }
  } else {
    message.error('批量保存失败：' + res.data.message)
  }
};

const getCategoryOptions  = async () =>{
  const res=  await getCategoryListAsHomeUsingGet()
  if(res.data.code === 0 && res.data.data){
    categoryOptions.value = (res.data.data?? []).map((data:API.CategoryVO)=>{
      return {
        value:data.id,
        label:data.name
      }
    })
  }else{
    message.error('获取标签分页列表失败'+res.data.message)
  }
}

onMounted(()=>{
  getCategoryOptions()
  getOldPicture()
  fetchSpaceInfo()
})

// 获取空间信息
const fetchSpaceInfo = async () => {
  if (!spaceId.value) {
    return
  }
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: spaceId.value
    })
    if (res.data.code === 0 && res.data.data) {
      spaceName.value = res.data.data.spaceName || ''
    }
  } catch (e: any) {
    console.error('获取空间信息失败', e)
  }
}

// 返回按钮处理
const goBack = () => {
  router.back()
}

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
      pictureForm.categoryId = data.categoryId
      pictureForm.tags = data.tagList
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
