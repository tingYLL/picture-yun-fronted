<!--瀑布流展示组件-->
<template>
<!--  {{dataList}}-->
  <div id="picture-list">
    <Waterfall v-if="dataList.length > 0" :list="dataList" :width="300" :breakpoints="breakpoints">
      <template #default="{ item: picture }">
          <a-card>
            <template #cover>
              <!-- @dragstart="handleDragStart" 禁止拖拽 -->
              <div @dragstart="handleDragStart" @click="doClickPicture(picture)">
                <LazyImg :url="picture.thumbnailUrl??picture.url" />
              </div>
            </template>
<!--            <a-card-meta :title="picture.name" >-->
            <a-card-meta>
              <template #description>
<!--                可选择展示或不展示-->
                <a-flex justify="center">
<!--                  <a-tag color="green">-->
<!--                    {{ picture.category ?? '默认' }}-->
<!--                  </a-tag>-->
                  <a-tag v-for="tag in picture.tagList" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template #actions v-if="showOp">
              <ShareAltOutlined @click="(e) => doShare(picture, e)" />
              <SearchOutlined @click="(e) => doSearch(picture, e)" />
              <EditOutlined v-if="canEdit" @click="(e) => doEdit(picture, e)" />
              <DeleteOutlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />
            </template>
          </a-card>
      </template>
    </Waterfall>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import 'vue-waterfall-plugin-next/dist/style.css'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import ShareModal from './ShareModal.vue'
import { ref,onMounted,onUnmounted } from 'vue'
import { handleDragStart } from '@/utils'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  //showOp这个参数控制每张图片card下面的编辑和删除按钮是否展示，私有图库会展示，公共图库不会展示
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
}

//定义默认值
const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
})

const router = useRouter()
//跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })

  // 通过路由解析生成完整路径
  // const resolved = router.resolve({
  //   path: `/picture/${picture.id}`
  // });
  //
  // // 在新标签页打开路由对应的绝对路径
  // window.open(resolved.href, '_blank');
}

const doSearch = (picture, e) => {
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

/**
 * 瀑布流布局
 */
const breakpoints = ref({
  3000: {
    //当屏幕宽度小于等于3000
    rowPerView: 7, // 一行8图
  },
  1800: {
    rowPerView: 6,
  },
  1500: {
    rowPerView: 5,
  },
  1200: {
    rowPerView: 4,
  },
  1000: {
    rowPerView: 3,
  },
  800: {
    rowPerView: 2,
  },
  700: {
    rowPerView: 2,
  },
  500: {
    rowPerView: 1,
  },
  300: {
    rowPerView: 1,
  },
})
</script>

<style scoped></style>
