<!--瀑布流展示组件-->
<template>
<!--  {{dataList}}-->
  <div id="picture-list">
    <Waterfall v-if="dataList.length > 0" :list="dataList" :width="300" :breakpoints="breakpoints">
      <template #default="{ item: picture }">
          <a-card class="picture-card">
            <template #cover>
              <!-- 批量删除模式下显示勾选框 -->
<!--              <div class="picture-cover-wrapper" @dragstart="handleDragStart" @click="handlePictureClick(picture, $event)">-->
              <div class="picture-cover-wrapper"  @click="handlePictureClick(picture, $event)">
                <LazyImg :url="picture.thumbnailUrl??picture.url" />
                <div v-if="batchDeleteMode" class="checkbox-overlay" @click.stop>
                  <a-checkbox
                    :checked="isSelected(picture.id)"
                    @change="(e) => handleCheckboxChange(picture.id, e.target.checked)"
                  />
                </div>
                <!-- 浏览量显示在图片左下角 -->
                <div class="view-count-overlay">
                  <EyeOutlined />
                  {{ formatNumber(picture.viewQuantity) }}
                </div>
              </div>
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
  EyeOutlined,LikeFilled,LikeOutlined,StarFilled,StarOutlined
} from '@ant-design/icons-vue'
import { deletePictureUsingPost, pictureLikeOrCollectUsingPost,pictureShareUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import ShareModal from './ShareModal.vue'
import { ref,onMounted,onUnmounted } from 'vue'
import { handleDragStart,formatNumber } from '@/utils'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { PIC_INTERACTION_TYPE_ENUM } from '@/constants/picture.ts'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  //showOp这个参数控制每张图片card下面的编辑和删除按钮是否展示，私有图库会展示，公共图库不会展示
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
  // 批量删除模式
  batchDeleteMode?: boolean
  // 已选中的图片ID列表
  selectedIds?: number[]
  // 选中状态变化回调
  onSelect?: (pictureId: number, selected: boolean) => void
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
/**
 * 点赞状态
 */
const isLike = ref<boolean>(true)
/**
 * 处理点赞
 */
const doLike = async (picture: API.PictureVO) => {
  // useLoginUserStore().checkLogin()
  if (!isLike.value) {
    message.warn('点太快啦！')
    return
  }
  const res = await pictureLikeOrCollectUsingPost({
    pictureId: picture.id,
    interactionType: PIC_INTERACTION_TYPE_ENUM.LIKE,
    interactionStatus: picture.loginUserIsLike ? 1 : 0,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`${picture.loginUserIsLike ? '取消点赞！' : '点赞成功！'}`)
    picture.loginUserIsLike ? picture.likeQuantity-- : picture.likeQuantity++
    picture.loginUserIsLike = !picture.loginUserIsLike
    isLike.value = false
    setTimeout(() => {
      isLike.value = true
    }, 2000)
  } else {
    message.error(res.data.message)
  }
}

/**
 * 收藏状态
 */
const isCollect = ref<boolean>(true)
/**
 * 处理收藏
 */
const doCollect = async (picture: API.PictureVO) => {
  // useLoginUserStore().checkLogin()
  if (!isCollect.value) {
    message.warn('点太快啦！')
    return
  }
  const res = await pictureLikeOrCollectUsingPost({
    pictureId: picture.id,
    interactionType: PIC_INTERACTION_TYPE_ENUM.COLLECT,
    interactionStatus: picture.loginUserIsCollect ? 1 : 0,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`${picture.loginUserIsCollect ? '取消收藏！' : '收藏成功！'}`)
    picture.loginUserIsCollect ? picture.collectQuantity-- : picture.collectQuantity++
    picture.loginUserIsCollect = !picture.loginUserIsCollect
    isCollect.value = false
    setTimeout(() => {
      isCollect.value = true
    }, 2000)
  } else {
    message.error(res.data.message)
  }
}

/**
 * 分享状态
 */
const isShare = ref<boolean>(true)
/**
 * 处理分享
 * @param picture
 * @param e
 */

const doSharePicture = async (picture: API.PictureVO, e: Event) => {
  // useLoginUserStore().checkLogin()
  if (!isShare.value) {
    message.warn('已分享！')
    return
  }
  const pictureId = picture.id
  const res = await pictureShareUsingPost({ pictureId })
  if (res.data.code === 0 && res.data.data) {
    shareLink.value = `${window.location.protocol}//${window.location.host}/picture/detail/${pictureId}`
    if (shareModalRef.value) {
      shareModalRef.value.openModal()
    }
    setTimeout(() => {
      isShare.value = true
    }, 3000)
  } else {
    message.error(res.data.message)
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

// ---- 批量删除相关 ----
// 判断图片是否被选中
const isSelected = (pictureId: number | undefined) => {
  if (!pictureId || !props.selectedIds) return false
  return props.selectedIds.includes(pictureId)
}

// 处理勾选框变化
const handleCheckboxChange = (pictureId: number | undefined, checked: boolean) => {
  if (!pictureId) return
  props.onSelect?.(pictureId, checked)
}

// 处理图片点击
const handlePictureClick = (picture: API.PictureVO, event: MouseEvent) => {
  // 批量删除模式下，点击图片等同于切换勾选状态
  if (props.batchDeleteMode) {
    event.preventDefault()
    if (picture.id) {
      const currentSelected = isSelected(picture.id)
      handleCheckboxChange(picture.id, !currentSelected)
    }
  } else {
    // 非批量删除模式，正常跳转到详情页
    doClickPicture(picture)
  }
}
</script>

<style scoped>
.picture-card {
  position: relative;
}

.picture-cover-wrapper {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.picture-cover-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.picture-cover-wrapper:hover img {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

.picture-cover-wrapper .lazy-image {
  transition: transform 0.3s ease;
  border-radius: 8px;
}

.checkbox-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.checkbox-overlay :deep(.ant-checkbox-wrapper) {
  display: flex;
  align-items: center;
}

.view-count-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 35px;
  z-index: 10;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0) 100%);
  color: #fff;
  padding: 12px 12px 8px 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
  opacity: 1;
  transform: translateY(0);
}

</style>
