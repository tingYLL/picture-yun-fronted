<template>
  <div id="picture-list">
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6 }" :data-source="dataList" :loading="loading">
      <!--      作用域插槽，item是每一张图片，这里item:picture的语法是把item改名成picture，更容易阅读-->
      <template #renderItem="{ item :picture}">
        <a-list-item style="padding:0">
          <a-card hoverable @click="doClickPicture(picture)" >
            <template #cover>
              <img :alt="picture.name" :src="picture.thumbnailUrl??picture.url" style="height: 180px;object-fit: cover"/>
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{picture.category??'默认'}}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{tag}}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template #actions v-if="showOp">
                <ShareAltOutlined @click="(e) => doShare(picture, e)" />
                <SearchOutlined @click="(e) => doSearch(picture, e)"/>
                <EditOutlined v-if="canEdit" @click="(e) => doEdit(picture, e)"/>
                <DeleteOutlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>
<script setup lang="ts">
import {useRouter} from "vue-router";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import {deletePictureUsingPost} from "@/api/pictureController";
import {message} from "ant-design-vue";
import ShareModal from "./ShareModal.vue"
import { ref } from 'vue'

interface Props {
  dataList?:API.PictureVO[],
  loading?:boolean
  //showOp这个参数控制每张图片card下面的编辑和删除按钮是否展示，私有图库会展示，公共图库不会展示
  showOp?:boolean
  onReload?:()=>void
  canEdit?:boolean
  canDelete?:boolean
}

//定义默认值
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false
})

const router = useRouter()
//跳转至图片详情页
const doClickPicture = (picture:API.PictureVO)=>{
  router.push({
    path:`/picture/${picture.id}`
  })

  // 通过路由解析生成完整路径
  // const resolved = router.resolve({
  //   path: `/picture/${picture.id}`
  // });
  //
  // // 在新标签页打开路由对应的绝对路径
  // window.open(resolved.href, '_blank');
}

const doSearch = (picture,e) =>{
  // 阻止冒泡
  e.stopPropagation()
  //打开新的页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// 编辑
const doEdit = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  // 跳转时一定要携带 spaceId
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    //删除成功，就告诉父组件重新查询图片list，再传给本组件进行展示
    // ？外层传了才执行 否则可能会报错
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

// ----- 分享操作 ----
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
</style>

