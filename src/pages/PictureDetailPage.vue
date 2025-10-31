<template>
  <div id="pictureDetailPage">
<!--    &lt;!&ndash; 返回按钮 &ndash;&gt;-->
<!--    <div style="margin-bottom: 16px">-->
<!--      <a-button-->
<!--        type="text"-->
<!--        :icon="h(ArrowLeftOutlined)"-->
<!--        @click="goBack"-->
<!--      >-->
<!--        返回-->
<!--      </a-button>-->
<!--    </div>-->
    <a-row :gutter="[16,16]">
<!--      图片预览-->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card  :headStyle="{ 'text-align': 'center' }" :title="picture.name">
          <template #extra>
            <a-flex>
              <div
                @click="(e) => doDownload"
              >
                <a-button type="dashed">
                  <DownloadOutlined />
                   {{ formatNumber(downloadCount) }} 人下载
                </a-button>
              </div>
            </a-flex>
          </template>
          <div class="image-detail-content">
            <a-image :src="picture.url"/>
          </div>
          <template #actions>
            <div>
              <EyeOutlined />
              {{ formatNumber(viewCount) }}
            </div>
            <div @click="(e) => doLike(picture, e)">
              <LikeFilled v-if="picture.loginUserIsLike" />
              <LikeOutlined v-else />
              {{ formatNumber(likeCount) }}
            </div>
            <div @click="(e) => doCollect(picture, e)">
              <StarFilled v-if="picture.loginUserIsCollect" />
              <StarOutlined v-else />
              {{ formatNumber(collectCount) }}
            </div>
            <div @click="(e) => doSharePicture(picture, e)">
              <ShareAltOutlined />
              {{ formatNumber(shareCount) }}
            </div>
          </template>
        </a-card>
      </a-col>
<!--      图片信息区域-->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="上传者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              <a-tag color="green">
                {{ picture.categoryInfo?.name ?? '默认' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item v-if="picture.tagList?.length" label="标签" >
              <a-tag v-for="tag in picture.tagList" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式" >
              <a-tag color="cyan" v-if="picture.picFormat">
                {{ picture.picFormat  }}
              </a-tag>
              <span v-else>-</span>
            </a-descriptions-item>
            <a-descriptions-item label="分辨率">
              {{ picture.picWidth}} × {{ picture.picHeight }}
            </a-descriptions-item>
<!--            <a-descriptions-item label="宽高比">-->
<!--              {{ picture.picScale ?? '-' }}-->
<!--            </a-descriptions-item>-->
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
<!--            <a-descriptions-item label="主色调">-->
<!--              <a-space>-->
<!--                {{ picture.picColor ?? '-' }}-->
<!--                <div-->
<!--                  v-if="picture.picColor"-->
<!--                  :style="{-->
<!--                    width: '16px',-->
<!--                    height: '16px',-->
<!--                    backgroundColor: toHexColor(picture.picColor),-->
<!--                  }"-->
<!--                />-->
<!--              </a-space>-->
<!--            </a-descriptions-item>-->
          </a-descriptions>
          <a-space wrap>
            <a-button type="primary" @click="doDownload">
              下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button  :icon="h(ShareAltOutlined)"  type="primary" ghost @click="doSharePicture(picture, e)">
              分享
            </a-button>
            <a-button v-if="canEdit" :icon="h(EditOutlined)" target="_blank" type="default" @click="doEdit">
              编辑
            </a-button>
            <a-button v-if="canDelete" :icon="h(DeleteOutlined)" target="_blank" danger @click="doDelete">
              删除
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    <ShareModal ref="shareModalRef" :link="shareLink" />
    <PaymentModal ref="paymentModalRef" />
  </div>
</template>
<script setup lang="ts">
import {computed, defineProps, h, onMounted, reactive, ref} from "vue";
import {deletePictureUsingPost, getPictureVoByIdUsingGet,
  pictureLikeOrCollectUsingPost,pictureShareUsingPost,
  } from "@/api/pictureController";
import {downloadFileUsingPost} from "@/api/downloadController.ts"
import PaymentModal from '@/components/PaymentModal.vue'
import {useRoute, useRouter} from "vue-router";
import { message, Modal } from 'ant-design-vue'
import {downloadImage, formatSize,toHexColor} from '@/utils/index'
import ShareModal from '@/components/ShareModal.vue'
import {formatNumber} from '@/utils/index'
import {
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ShareAltOutlined,EyeOutlined,LikeFilled,LikeOutlined,StarFilled,StarOutlined,ArrowLeftOutlined
} from '@ant-design/icons-vue'
import {useLoginUserStore} from "@/stores/useLoginUserStore";
import {SPACE_PERMISSION_ENUM} from "@/constants/space";
import { PIC_INTERACTION_TYPE_ENUM } from '@/constants/picture.ts'



interface Props {
  id: string | number
}

const props = defineProps<Props>()
const router = useRouter()
const picture = ref<API.PictureVO>({})
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//获取图片详情
const  fetchPictureDetail = async ()=>{

  try {
    const res = await getPictureVoByIdUsingGet({
      id:props.id
    })
    if(res.data.code === 0&& res.data.data){
      picture.value = res.data.data
    }else{
      message.error('获取图片详情失败，'+res.data.message)
    }
  }catch (e:any){
    message.error('获取图片详情失败，'+e.message)
  }

}

const  loginUserStore = useLoginUserStore()

const doEdit = ()=>{
  // router.push('/add_picture?id='+picture.value.id)
  router.push({
    path:'/add_picture',
    query:{
      id:picture.value.id,
      spaceId:picture.value.spaceId
    }
  })
}


// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

//旧版权限检测
// const canEdit= computed(()=>{
//   const  loginUser = loginUserStore.loginUser
//   //未登录不能编辑
//   if(!loginUser.id){
//     return false
//   }
//   //仅本人或管理员可编辑
//   const user = picture.value.user || {}
//   return loginUser.id === user.id || loginUser.userRole === 'admin'
//
// })

const doDelete = async ()=>{
  const id = picture.value.id
  if(!id){
    return
  }
  Modal.confirm({
    title:'删除图片',
    content: '确定要删除该图片吗？删除后不可恢复！',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      const res = await deletePictureUsingPost({ id })
      if (res.data.code === 0) {
        message.success('删除成功')

        // 标记需要刷新的页面
        const spaceId = picture.value.spaceId
        if (spaceId) {
          // 如果图片属于某个空间，返回该空间
          router.push(`/space/${spaceId}`)
        } else {
          // 返回首页
          router.push('/')
        }
      } else {
        message.error('删除失败')
      }
    }
  })

}



const paymentModalRef = ref()
/**
 * 下载状态
 */
const isDownload = ref<boolean>(true)
const doDownload = async () => {
  if (!isDownload.value) {
    message.warn('重复下载！')
    return
  }
  try {
    const res = await downloadFileUsingPost({fileId: picture.value.id})
    if (res.data.code === 0 && res.data.data) {
      await downloadImage(picture.value.url)
      message.success('下载成功！')
      fetchPictureDetail()
      isDownload.value = false
      setTimeout(() => {
        isDownload.value = true
      }, 3000)
    } else {
      message.error(res.data.message)
      // 下载失败时弹出支付框
      paymentModalRef.value.openModal()
    }
  }catch (e:any){
    message.error('下载失败：' + e.message)
    // 下载失败时弹出支付框
    paymentModalRef.value.visible = true
  }
}

onMounted(()=>{
  fetchPictureDetail()
})

/**
 * 查看数量
 */
const viewCount = computed(() => {
  return `${picture.value.viewQuantity ?? 0}`
})
/**
 * 点赞数量
 */
const likeCount = computed(() => {
  return `${picture.value.likeQuantity ?? 0}`
})
/**
 * 收藏数量
 */
const collectCount = computed(() => {
  return `${picture.value.collectQuantity ?? 0}`
})
/**
 * 分享数量
 */
const shareCount = computed(() => {
  return `${picture.value.shareQuantity ?? 0}`
})
/**
 * 下载数量
 */
const downloadCount = computed(() => {
  return `${picture.value.downloadQuantity ?? 0}`
})

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
    shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${pictureId}`
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
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

// 返回按钮处理
const goBack = () => {
  router.back()
}
</script>

<style scoped>
#pictureDetailPage{
  margin-bottom: 16px;
}

#pictureDetailPage .image-detail-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 600px; /* 固定高度 */
  overflow: hidden; /* 确保不会溢出 */
}

/* 图片样式：固定容器尺寸内居中显示 */
.image-detail-content :deep(.ant-image) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.image-detail-content :deep(.ant-image .ant-image-img) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保持图片比例，完整显示在容器内 */
  margin: auto;
}
</style>

