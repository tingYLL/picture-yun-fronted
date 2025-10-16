<template>
  <div id="spaceDetailPage">
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} ({{SPACE_TYPE_MAP[space.spaceType]}})</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank" v-if="canUploadPicture"><CloudUploadOutlined/>上传图片</a-button>
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
<!--        <a-tooltip :title="`占用空间${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`">-->
<!--          <a-progress-->
<!--            type="circle"-->
<!--            :size="42"-->
<!--            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"-->
<!--          />-->
<!--        </a-tooltip>-->
      </a-space>
    </a-flex>
    <!-- 空间使用区域 -->
    <div class="usage-section">
      <a-collapse v-model:activeKey="useActiveKey" collapsible="header" :bordered="false">
        <a-collapse-panel key="1" class="usage-panel">
          <template #header>
            <div class="panel-header">
              <a-typography-title :level="5" class="usage-title">
                <FolderOpenOutlined class="usage-icon" />
                空间使用情况
              </a-typography-title>
              <CaretDownOutlined class="collapse-icon" />
            </div>
          </template>
          <div class="usage-content">
            <div class="usage-item">
              <span class="usage-label">存储空间:</span>
              <span class="usage-value">{{formatSize(space.totalSize) }} / {{formatSize(space.maxSize)}}</span>
              <a-progress
                :percent="((space.totalSize / space.maxSize) * 100).toFixed(1)"
                :stroke-color="getProgressColor(space.totalSize / space.maxSize)"
                status="active"
                :show-info="false"
                class="usage-progress"
              />
            </div>
            <div class="usage-item">
              <span class="usage-label">图片数量:</span>
              <span class="usage-value">{{ space.totalCount }} / {{ space.maxCount }} 张</span>
              <a-progress
                :percent="((space.totalCount / space.maxCount) * 100).toFixed(1)"
                :stroke-color="getProgressColor(space.totalCount / space.maxCount)"
                status="active"
                :show-info="false"
                class="usage-progress"
              />
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <a-divider style="margin: 12px 0" />
    <!--    搜索表单-->
    <PictureSearchForm :onSearch="onSearch"/>
    <div style="margin-bottom: 16px"></div>
    <!--    按颜色搜索，跟其他搜索条件独立-->
<!--    <a-form-item label="按颜色搜索">-->
<!--      <a-space>-->
<!--        <color-picker format="hex" @pureColorChange="onColorChange"/>-->
<!--      </a-space>-->
<!--    </a-form-item>-->
    <!--    图片列表-->
    <div v-if="!loading && dataList.length === 0">
      <a-empty description="您还没有上传任何图片" />
    </div>
    <template v-else>
      <PictureList :dataList="dataList" :loading="loading" :showOp="true" :onReload="fetchData"
                   :canEdit="canEditPicture" :canDelete="canDeletePicture"/>
      <!--    分页-->
      <a-pagination
        v-if="total > 0"
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        @change="onPageChange"
        style="text-align: right; margin-top: 16px"
      />
    </template>
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
  BlockOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  ShareAltOutlined,
  SyncOutlined, CaretDownOutlined, FolderOpenOutlined, KeyOutlined
} from '@ant-design/icons-vue'
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
/**
 * 空间使用情况选中的 KEY
 */
const useActiveKey = ref([])
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

// 辅助函数：获取进度条颜色
const getProgressColor = (ratio: number) => {
  if (ratio < 0.5) return '#06D6A0'
  if (ratio < 0.8) return '#FFD166'
  return '#D90429'
}
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}
.usage-section {
  margin-top: 10px;
  margin-bottom: 0;

  .usage-panel {
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #f0f0f0;

    :deep(.ant-collapse-header) {
      padding: 12px 16px !important;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .usage-title {
        margin: 0;
        display: flex;
        align-items: center;

        .usage-icon {
          margin-right: 8px;
          color: #ff9a2e;
        }
      }

      .collapse-icon {
        transition: transform 0.3s;
      }
    }

    :deep(.ant-collapse-content-box) {
      padding: 16px !important;
    }
  }

  .usage-content {
    .usage-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .usage-label {
        font-weight: 500;
        margin-right: 8px;
        color: #555;
      }

      .usage-value {
        color: #333;
        font-weight: 500;
      }

      .usage-progress {
        margin-top: 8px;

        :deep(.ant-progress-bg) {
          height: 10px !important;
        }
      }
    }
  }
}

</style>

