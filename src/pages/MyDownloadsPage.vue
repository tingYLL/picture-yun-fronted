<template>
  <div id="my-downloads-page">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <DownloadOutlined />
            下载记录
          </a-typography-title>
        </a-typography>
        <!-- 操作 -->
<!--        <a-space>-->
<!--          <a-button type="primary" size="middle" @click="refreshData" :loading="dataLoading">-->
<!--            <SyncOutlined />-->
<!--            刷新-->
<!--          </a-button>-->
<!--        </a-space>-->
      </a-flex>
    </div>

    <a-divider />

    <!-- 搜索区域 -->
    <div class="custom-div search-region">
      <a-form class="custom-form" layout="inline" :model="searchParams" @finish="doSearch">
<!--        <a-form-item label="图片名称" name="searchText">-->
<!--          <a-input-->
<!--            v-model:value="searchParams.searchText"-->
<!--            placeholder="从图片名称中搜索"-->
<!--            allow-clear-->
<!--            size="middle"-->
<!--          />-->
<!--        </a-form-item>-->
        <a-form-item label="下载日期" name="">
          <a-range-picker
            style="width: 300px"
            show-time
            v-model:value="dateRange"
            :placeholder="['开始日期', '结束日期']"
            format="YYYY/MM/DD"
            :presets="rangePresets"
            @change="onRangeChange"
            size="middle"
          />
        </a-form-item>
        <a-form-item>
          <a-space size="middle">
            <a-button type="primary" html-type="submit" :icon="h(SearchOutlined)" size="middle">
              搜索
            </a-button>
            <a-button
              @click="resetSearch"
              style="color: #1890ff; border-color: #1890ff"
              :icon="h(RedoOutlined)"
              size="middle"
            >
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <a-divider />

    <!-- 数据区域 -->
    <div class="custom-div data-region">
      <a-list
        :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 5 }"
        :data-source="downloadList"
        :loading="dataLoading"
      >
        <template #renderItem="{ item: downloadHistory }">
          <a-list-item style="padding: 0" v-if="downloadHistory.picture">
            <a-card hoverable @click="doClickPicture(downloadHistory.picture)">
              <template #cover>
                <img
                  style="height: 250px; object-fit: cover"
                  :alt="downloadHistory.picture?.name"
                  :src="downloadHistory.picture?.url"
                  loading="lazy"
                />
              </template>
              <a-card-meta>
<!--                <template #title>-->
<!--                  {{ downloadHistory.picture?.name || '未知图片' }}-->
<!--                </template>-->
                <template #description>
                  <div style="font-size: 12px; color: #666">
                    <div>下载时间: {{ formatDate(downloadHistory.downloadedAt) }}</div>
                    <div v-if="downloadHistory.picture?.categoryName">
                      分类: {{ downloadHistory.picture.categoryName }}
                    </div>
                  </div>
                </template>
              </a-card-meta>
              <template #actions>
                <div @click="(e) => doViewPicture(downloadHistory.picture, e)">
                  <EyeOutlined />
                  查看
                </div>
                <div @click="(e) => doDownloadAgain(downloadHistory.picture, e)">
                  <DownloadOutlined />
                  重新下载
                </div>
              </template>
            </a-card>
          </a-list-item>
        </template>
        <template #empty>
          <a-empty description="暂无下载记录" />
        </template>
      </a-list>

      <!-- 分页 -->
      <a-pagination
        v-if="total > 0"
        style="text-align: right; margin-top: 16px"
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        :show-total="() => `共 ${total} 条记录`"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  DownloadOutlined,
  SearchOutlined,
  SyncOutlined,
  RedoOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
import { h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { getDownloadHistoryUsingPost, downloadFileUsingPost } from '@/api/downloadController'
import { downloadImage } from '@/utils'

const router = useRouter()

// 搜索参数
const INITIAL_SEARCH_PARAMS: API.DownloadRequest = {
  current: 1,
  pageSize: 10,
  startTime: undefined,
  endTime: undefined,
}

const searchParams = reactive<API.DownloadRequest>({ ...INITIAL_SEARCH_PARAMS })

// 日期范围
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([])

// 日期预设
const rangePresets = ref([
  { label: '今天', value: [dayjs(), dayjs()] },
  { label: '昨天', value: [dayjs().add(-1, 'd'), dayjs().add(-1, 'd')] },
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
])

// 数据状态
const downloadList = ref<API.DownloadHistoryVO[]>([])
const total = ref(0)
const dataLoading = ref(false)

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知时间'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 日期范围变化
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    searchParams.startTime = dates[0].toDate()
    searchParams.endTime = dates[1].toDate()
  } else {
    searchParams.startTime = undefined
    searchParams.endTime = undefined
  }
}

// 获取下载历史数据
const fetchDownloadHistory = async () => {
  dataLoading.value = true
  try {
    const res = await getDownloadHistoryUsingPost({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      downloadList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      message.error('获取下载记录失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('获取下载记录失败')
    console.error('获取下载记录失败:', error)
  } finally {
    dataLoading.value = false
  }
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchDownloadHistory()
}

// 重置搜索
const resetSearch = () => {
  dateRange.value = []
  Object.assign(searchParams, INITIAL_SEARCH_PARAMS)
  fetchDownloadHistory()
}

// 刷新数据
const refreshData = () => {
  fetchDownloadHistory()
  message.success('刷新成功')
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchDownloadHistory()
}

// 点击图片
const doClickPicture = (picture: API.PictureVO) => {
  if (picture?.id) {
    // router.push(`/picture/${picture.id}`)
    window.open(`/picture/${picture.id}`)
  }
}

// 查看图片
const doViewPicture = (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  if (picture?.id) {
    // router.push(`/picture/${picture.id}`)
    window.open(`/picture/${picture.id}`)
  }
}
const isDownload = ref<boolean>(true)
// 重新下载
const doDownloadAgain = async (picture: API.PictureVO, e: Event) => {
  if (!isDownload.value) {
    message.warn('重复下载！')
    return
  }
  e.stopPropagation()
  if (!picture?.id) {
    message.warn('图片信息不完整')
    return
  }

  try {
    const res = await downloadFileUsingPost({ fileId: picture.id })
    if (res.data.code === 0) {
      await downloadImage(picture.url)
      message.success('下载成功')
      // 刷新列表
      fetchDownloadHistory()
      isDownload.value = false
      setTimeout(() => {
        isDownload.value = true
      }, 3000)
    } else {
      message.error('下载失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('下载失败')
    console.error('下载失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchDownloadHistory()
})
</script>

<style scoped>
/* 表单中输入框左边文字和右边输入框在同一水平线处理 */
.custom-form :deep(.ant-form-item-label > label) {
  height: 40px; /* 与输入框高度一致 */
  line-height: 40px; /* 垂直居中 */
  display: flex;
  align-items: center; /* 垂直对齐 */
}
</style>
