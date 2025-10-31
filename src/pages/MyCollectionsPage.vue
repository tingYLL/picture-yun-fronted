<template>
  <div id="my-collections-page">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <StarOutlined />
            我的收藏
          </a-typography-title>
        </a-typography>
      </a-flex>
    </div>

    <a-divider />

    <!-- 搜索区域 -->
    <div class="custom-div search-region">
      <a-form class="custom-form" layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="收藏日期" name="">
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
        :data-source="collectionList"
        :loading="dataLoading"
      >
        <template #renderItem="{ item: picture }">
          <a-list-item style="padding: 0">
            <a-card hoverable @click="doClickPicture(picture)">
              <template #cover>
                <img
                  style="height: 250px; object-fit: cover"
                  :alt="picture.name"
                  :src="picture.url"
                  loading="lazy"
                />
              </template>
              <a-card-meta>
                <template #title>
                  {{ picture.name || '未命名图片' }}
                </template>
                <template #description>
                  <div style="font-size: 12px; color: #666">
                    <div v-if="picture.categoryName">分类: {{ picture.categoryName }}</div>
                  </div>
                </template>
              </a-card-meta>
              <template #actions>
                <div @click="(e) => doViewPicture(picture, e)">
                  <EyeOutlined />
                  查看
                </div>
                <div @click="(e) => doUncollect(picture, e)">
                  <StarFilled />
                  取消收藏
                </div>
                <div @click="(e) => doDownload(picture, e)">
                  <DownloadOutlined />
                  下载
                </div>
              </template>
            </a-card>
          </a-list-item>
        </template>
        <template #empty>
          <a-empty description="暂无收藏图片" />
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
  StarOutlined,
  StarFilled,
  DownloadOutlined,
  SearchOutlined,
  RedoOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
import { computed, h, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { getMyCollectPictureListUsingPost, pictureLikeOrCollectUsingPost } from '@/api/pictureController'
import { downloadFileUsingPost } from '@/api/downloadController'
import { downloadImage } from '@/utils'
import { PIC_INTERACTION_TYPE_ENUM } from '@/constants/picture.ts'

const router = useRouter()

// 搜索参数
const INITIAL_SEARCH_PARAMS: API.PictureQueryRequest = {
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
}

const searchParams = reactive<API.PictureQueryRequest>({ ...INITIAL_SEARCH_PARAMS })

// 日期范围
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([])

// 日期预设（使用 computed 确保每次都获取最新时间）
const rangePresets = computed(() => [
  { label: '今天', value: [dayjs(), dayjs()] },
  { label: '昨天', value: [dayjs().add(-1, 'd'), dayjs().add(-1, 'd')] },
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
])

// 数据状态
const collectionList = ref<API.PictureVO[]>([])
const total = ref(0)
const dataLoading = ref(false)

// 日期范围变化
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    // 设置为当天 00:00:00 和 23:59:59（本地时区）
    searchParams.startEditTime = dates[0].startOf('day').format()
    searchParams.endEditTime = dates[1].endOf('day').format()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 获取收藏列表数据
const fetchCollections = async () => {
  dataLoading.value = true
  try {
    const res = await getMyCollectPictureListUsingPost({
      ...searchParams,
    })
    if (res.data.code === 0 && res.data.data) {
      collectionList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      message.error('获取收藏列表失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('获取收藏列表失败')
    console.error('获取收藏列表失败:', error)
  } finally {
    dataLoading.value = false
  }
}

// 搜索
const doSearch = () => {
  searchParams.current = 1
  fetchCollections()
}

// 重置搜索
const resetSearch = () => {
  dateRange.value = []
  Object.assign(searchParams, INITIAL_SEARCH_PARAMS)
  fetchCollections()
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchCollections()
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

// 取消收藏
const doUncollect = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  if (!picture?.id) {
    message.warn('图片信息不完整')
    return
  }

  try {
    const res = await pictureLikeOrCollectUsingPost({
      pictureId: picture.id,
      interactionType: PIC_INTERACTION_TYPE_ENUM.COLLECT,
      interactionStatus: picture.loginUserIsCollect ? 1 : 0,
    })
    if (res.data.code === 0) {
      message.success('已取消收藏')
      // 从列表中移除该图片
      collectionList.value = collectionList.value.filter((item) => item.id !== picture.id)
      total.value = Math.max(0, total.value - 1)

      // 如果当前页没有数据了，且不是第一页，则跳转到上一页
      if (collectionList.value.length === 0 && searchParams.current && searchParams.current > 1) {
        searchParams.current = searchParams.current - 1
        fetchCollections()
      }
    } else {
      message.error('取消收藏失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('取消收藏失败')
    console.error('取消收藏失败:', error)
  }
}

const isDownload = ref<boolean>(true)
// 下载图片
const doDownload = async (picture: API.PictureVO, e: Event) => {
  e.stopPropagation()
  if (!isDownload.value) {
    message.warn('下载中，请稍候...')
    return
  }
  if (!picture?.id) {
    message.warn('图片信息不完整')
    return
  }

  try {
    isDownload.value = false
    // 先调用后端接口记录下载
    const res = await downloadFileUsingPost({ fileId: picture.id })
    if (res.data.code === 0) {
      // 然后下载图片
      await downloadImage(picture.url)
      message.success('下载成功')
    } else {
      message.error('下载失败: ' + res.data.message)
    }
  } catch (error) {
    message.error('下载失败')
    console.error('下载失败:', error)
  } finally {
    setTimeout(() => {
      isDownload.value = true
    }, 3000)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchCollections()
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
