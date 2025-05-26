<template>
  <div id="spaceDetailPage">
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} ({{SPACE_TYPE_MAP[space.spaceType]}})</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank" v-if="canUploadPicture">+ 创建图片</a-button>
        <a-button
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${id}`"
          target="_blank"
          v-if="canManageSpaceUser && space.spaceType === SPACE_TYPE_ENUM.TEAM"
        >
          成员管理
        </a-button>
        <a-button
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          target="_blank"
          v-if="canManageSpaceUser"
        >
          空间分析
        </a-button>
        <a-button :icon="h(EditOutlined)" @click="doBatchEdit" v-if="canEditPicture">批量编辑</a-button>
        <a-tooltip :title="`占用空间${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">
          <a-progress
            type="circle"
            :size="42"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"></div>
    <!--    搜索表单-->
    <PictureSearchForm :onSearch="onSearch"/>
    <div style="margin-bottom: 16px"></div>
    <!--    按颜色搜索，跟其他搜索条件独立-->
    <a-form-item label="按颜色搜索">
      <a-space>
        <color-picker format="hex" @pureColorChange="onColorChange"/>
      </a-space>
    </a-form-item>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" :showOp="true" :onReload="fetchData"
                 :canEdit="canEditPicture" :canDelete="canDeletePicture"/>
    <!--    分页-->
    <a-pagination
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
      style="text-align: right"
    />
    <BatchEditPictureModal ref="batchEditPictureModalRef" :spaceId="id" :pictureList="dataList"
                           :onSuccess="onBatchEditPictureSuccess"/>
  </div>
</template>
<script setup lang="ts">
import {computed, h, onMounted, reactive, ref, watch} from "vue";
import {deleteSpaceUsingPost, getSpaceVoByIdUsingGet} from "@/api/spaceController";
import {useRoute, useRouter} from "vue-router";
import {message} from "ant-design-vue";
import {downloadImage, formatSize} from '@/utils/index'
import {
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  TeamOutlined,
  BarChartOutlined
} from '@ant-design/icons-vue'
import {useLoginUserStore} from "@/stores/useLoginUserStore";
import {listPictureVoByPageUsingPost, searchPictureByColorUsingPost} from "@/api/pictureController";
import PictureList from '@/components/PictuerList.vue'
import PictureSearchForm from "@/components/PictureSearchForm.vue";
import {ColorPicker} from 'vue3-colorpicker';
import "vue3-colorpicker/style.css"
import BatchEditPictureModal from "@/components/BatchEditPictureModal.vue";
import {SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP} from "@/constants/space"
import {SPACE_TYPE_ENUM} from "@/constants/space";

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const router = useRouter()
const space = ref<API.SpaceVO>({})
const loading = ref(true)
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
// 搜索条件
const searchParams = ref<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//获取空间详情
const fetchSpaceDetail = async () => {

  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败' + e.message)
  }
}

// 获取该空间下对应的图片数据
const fetchData = async () => {
  loading.value = true
  //转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

//当页面改变的时候会调用这个函数，来更改当前的页号和页面大小
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page;
  searchParams.value.pageSize = pageSize
  fetchData()
}
onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})

// 搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  console.log('new', newSearchParams)

  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  console.log('searchparams', searchParams.value)
  fetchData()
}
const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost(
    {
      picColor: color,
      spaceId: props.id
    }
  )
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败' + res.data.message)
  }
  loading.value = false
}

// ---- 批量编辑图片 -----
const batchEditPictureModalRef = ref()

// 批量编辑图片成功
const onBatchEditPictureSuccess = () => {
  fetchData()
}

//打开编辑弹窗
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}

//如果当前页面接收的id发生变化，就会及时地触发数据重新加载
watch(
  ()=>props.id,
  ()=>{
    fetchSpaceDetail()
    fetchData()
  }
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}

</style>

