<template>
  <div id="spaceDetailPage">
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} ({{SPACE_TYPE_MAP[space.spaceType]}})</h2>
      <a-space size="middle">
        <a-button type="primary" @click="goToUploadPicture" v-if="canUploadPicture"><CloudUploadOutlined/>上传图片</a-button>
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
        <a-button :icon="h(DeleteOutlined)" @click="toggleBatchDeleteMode" v-if="canDeletePicture">批量删除</a-button>
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
      <!-- 批量删除操作栏 -->
      <div v-if="isBatchDeleteMode" class="batch-delete-bar">
        <a-space>
          <a-checkbox :checked="isAllSelected" @change="(e) => toggleSelectAll(e.target.checked)">全选</a-checkbox>
          <a-button
            type="primary"
            :disabled="selectedPictureIds.length === 0"
            @click="doBatchDelete"
          >
            删除 ({{ selectedPictureIds.length }})
          </a-button>
          <a-button @click="toggleBatchDeleteMode">取消</a-button>
        </a-space>
      </div>

      <PictureList
        :dataList="dataList"
        :loading="loading"
        :showOp="true"
        :onReload="fetchData"
        :canEdit="canEditPicture"
        :canDelete="canDeletePicture"
        :batchDeleteMode="isBatchDeleteMode"
        :selectedIds="selectedPictureIds"
        :onSelect="onPictureSelect"
      />
      <!--    分页-->
      <a-pagination
        v-if="total > 0"
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        :show-total="() => `共 ${total} 条`"
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
import {listPictureVoByPageUsingPost, searchPictureByColorUsingPost, deletePictureByBatchUsingPost} from "@/api/pictureController";
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

// ---- 批量删除图片 -----
// 批量删除模式
const isBatchDeleteMode = ref(false)
// 已选中的图片ID列表
const selectedPictureIds = ref<number[]>([])
// 全选状态
const isAllSelected = ref(false)

// 切换批量删除模式
const toggleBatchDeleteMode = () => {
  isBatchDeleteMode.value = !isBatchDeleteMode.value
  // 退出批量删除模式时，清空选中状态
  if (!isBatchDeleteMode.value) {
    selectedPictureIds.value = []
    isAllSelected.value = false
  }
}

// 处理图片选中状态变化
const onPictureSelect = (pictureId: number, selected: boolean) => {
  if (selected) {
    if (!selectedPictureIds.value.includes(pictureId)) {
      selectedPictureIds.value.push(pictureId)
    }
  } else {
    selectedPictureIds.value = selectedPictureIds.value.filter(id => id !== pictureId)
  }
  // 更新全选状态
  isAllSelected.value = selectedPictureIds.value.length === dataList.value.length && dataList.value.length > 0
}

// 全选/取消全选
const toggleSelectAll = (checked: boolean) => {
  isAllSelected.value = checked
  if (checked) {
    selectedPictureIds.value = dataList.value.map(picture => picture.id!).filter(id => id !== undefined)
  } else {
    selectedPictureIds.value = []
  }
}

// 批量删除图片
const doBatchDelete = async () => {
  if (selectedPictureIds.value.length === 0) {
    message.warning('请先选择要删除的图片')
    return
  }

  Modal.confirm({
    title: '批量删除图片',
    content: `确认删除 ${selectedPictureIds.value.length} 张图片，删除后不可恢复`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '暂不删除',
    onOk: async () => {
      const res = await deletePictureByBatchUsingPost({
        ids: selectedPictureIds.value
      })
      if (res.data.code === 0) {
        message.success('删除成功')
        // 清空选中状态
        selectedPictureIds.value = []
        isAllSelected.value = false
        // 退出批量删除模式
        isBatchDeleteMode.value = false
        // 重新加载数据
        fetchData()
      } else {
        message.error('删除失败：' + res.data.message)
      }
    }
  })
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

// 跳转到上传图片页面
const goToUploadPicture = () => {
  router.push({
    path: '/add_picture',
    query: {
      spaceId: props.id
    }
  })
}
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}

.batch-delete-bar {
  background: #f5f5f5;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
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

