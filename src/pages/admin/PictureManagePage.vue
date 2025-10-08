<template>
  <div id="pictureManagePage">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <PictureOutlined />
            图片管理
          </a-typography-title>
        </a-typography>
      </a-flex>
    </div>

    <!-- 搜索区域 -->
    <div class="custom-div search-region">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="custom-form">
        <a-form-item label="关键词">
          <a-input v-model:value="searchParams.searchText" placeholder="从名称、简介、标签中搜索" allow-clear />
        </a-form-item>
        <a-form-item label="分类" name="categoryId">
          <a-select v-model:value="searchParams.categoryId" placeholder="请选择分类" allow-clear :options="categoryList"
                    style="min-width: 180px"
                    size="middle"/>
        </a-form-item>
        <a-form-item label="图片格式" name="picFormat">
          <a-select
            v-model:value="searchParams.picFormat"
            :options="PIC_FORMAT_STATUS_OPTIONS"
            placeholder="请选择图片格式"
            style="min-width: 180px"
            allow-clear
            size="middle"
          />
        </a-form-item>
        <a-form-item name="reviewStatus" label="审核状态">
          <a-select v-model:value="searchParams.reviewStatus"  placeholder="请选择审核状态" allow-clear :options="PIC_REVIEW_STATUS_OPTIONS" style="min-width: 180px"/>
        </a-form-item>
        <a-form-item>
          <a-space size="middle">
            <a-button type="primary" html-type="submit" :icon="h(SearchOutlined)" size="middle">搜索</a-button>
            <a-button
              @click="refreshResetData"
              style="color: #1890ff; border-color: #1890ff"
              :icon="h(SyncOutlined)"
              size="middle"
            >
              刷新
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

<!--    <div style="margin-bottom: 16px" />-->


    <div class="custom-div data-region">
      <!-- 表格 -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        @change="doTableChange"
        :scroll="{ x: 'max-content', y: 470 }"
        :rowKey="(record) => record.id"
        :row-selection="rowSelection"
        v-model:selectedRows="selectedRowKeys"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'id'">
            <a-tooltip placement="right">
              <template #title>
                <span>{{ record.id }}</span>
              </template>
              <a-button @click="copyToClipboard(record.id)">复制</a-button>
            </a-tooltip>
          </template>
          <!-- 图片名称 -->
          <template v-if="column.dataIndex === 'name'">
            <a-tooltip :overlay-class-name="'custom-tooltip'" placement="top">
              <template #title>{{ record.name }}</template>
              <span class="text-ellipsis">{{ record.name }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.dataIndex === 'url'">
            <a-image :src="record.url" :width="120" />
          </template>
          <!-- 分类 -->
          <template v-if="column.dataIndex === 'categoryId'">
            <a-tag v-if="record.categoryInfo" color="green">
              {{ record.categoryInfo.name }}
            </a-tag>
            <span v-else>无</span>
          </template>
          <!--        <template v-if="column.dataIndex === 'tags'">-->
          <!--          <a-space wrap>-->
          <!--            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" >-->
          <!--              {{tag}}-->
          <!--            </a-tag>-->
          <!--          </a-space>-->
          <!--        </template>-->
          <!-- 作者信息 -->
          <template v-if="column.dataIndex === 'user'">
            <div v-if="record.user" style="display: flex; align-items: center; gap: 8px">
              <!-- 左侧头像 -->
              <div>
                <a-avatar :src="record.user.userAvatar" />
              </div>
              <!-- 右侧文字信息 -->
              <div
                style="display: flex; flex-direction: column; line-height: 1.2; text-align: left"
              >
                <span>ID：{{ record.user.id }}</span>
                <span>昵称：{{ record.user.userName }}</span>
              </div>
            </div>
            <span v-else>无</span>
          </template>
          <template v-if="column.dataIndex === 'picInfo'">
            <div>格式: {{record.picFormat}}</div>
            <div>宽度: {{record.picWidth}}</div>
            <div>高度: {{record.picHeight}}</div>
            <div>大小: {{(record.picSize/1024).toFixed(2)}}KB</div>
          </template>
          <template v-if="column.dataIndex === 'reviewMessage'">
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div>审核信息：{{ record.reviewMessage }}</div>
            <div>审核人：{{ record.reviewerId }}</div>
            <div v-if="record.reviewTime">
              审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
            </div>
          </template>
          <template v-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-if="column.dataIndex === 'editTime'">
            {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="link"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
              >
                通过
              </a-button>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                type="link"
                danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
              >
                拒绝
              </a-button>
              <a-button danger @click="doDelete(record.id)">删除</a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">编辑</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost, doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/PictureController.ts'
import { message,Modal} from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_FORMAT_STATUS_OPTIONS,
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS
} from '../../constants/picture.ts'
import { copyToClipboard, formatPictureSize, toHexColor } from '@/utils'
import { PictureOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons-vue'
import { getCategoryListAsHomeUsingGet } from '@/api/categoryController.ts'
const columns = [
  {
    title: '图片 ID',
    dataIndex: 'id',
    fixed: 'left',
    align: 'center',
    width: 80,
  },
  {
    title: '名称',
    dataIndex: 'name',
    align: 'center',
    ellipsis: true, // 超出显示省略号
    width: 250, // 固定宽度（单位px）
    customCell: () => ({ style: { minWidth: '250px', maxWidth: '250px' } }), // 双重保障限制宽度
  },
  {
    title: '图片',
    dataIndex: 'url',
    align:'center',
  },
  {
    title: '分类',
    dataIndex: 'categoryId',
    align: 'center',
    width: 100,
  },
  {
    title: '数据信息',
    children: [
      {
        title: '查看数量',
        dataIndex: 'viewQuantity',
        align: 'center',
        width: 80,
        sorter: true,
      },
      {
        title: '点赞数量',
        dataIndex: 'likeQuantity',
        align: 'center',
        width: 80,
        sorter: true,
      },
      {
        title: '收藏数量',
        dataIndex: 'collectQuantity',
        align: 'center',
        width: 80,
        sorter: true,
      },
      {
        title: '下载数量',
        dataIndex: 'downloadQuantity',
        align: 'center',
        width: 80,
        sorter: true,
      },
      {
        title: '分享数量',
        dataIndex: 'shareQuantity',
        align: 'center',
        width: 80,
        sorter: true,
      },
    ],
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 'auto',
  },
  // {
  //   title: '标签',
  //   dataIndex: 'tags',
  // },
  {
    title: '作者信息',
    dataIndex: 'user',
    align: 'center',
    minWidth: 100,
    // customCell: () => ({ style: { minWidth: '100px' } }),
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
    customCell: () => ({ style: { minWidth: '250px', maxWidth: '250px' } }),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'center',
    customCell: () => ({ style: { minWidth: '80px' } }),
  },
]

/**
 * 初始化图片搜索参数
 */
const INITIAL_PICTURE_SEARCH_PARAMS: API.PictureQueryRequest = {
  current: 1,
  pageSize: 10,
  multipleSort: true,
  sorts: [
    {
      asc: false,
      field: 'createTime',
    },
    {
      asc: true,
      field: 'reviewStatus',
    },
  ],
}
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  // current: 1,
  // pageSize: 10,
  // sortField: 'createTime',
  // sortOrder: 'descend',
  ...INITIAL_PICTURE_SEARCH_PARAMS
})



const dataList = ref<API.Picture[]>([])
const total = ref(0)
// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
    nullSpaceId:true//加上这个查询条件，避免管理员查出用户私有空间中的图片
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  getCategoryListData()
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 表格变化之后，重新获取数据
const doTableChange = (page: any, filters: any, sorter: any) => {
  // searchParams.current = page.current
  // searchParams.pageSize = page.pageSize
  // fetchData()
  // 排序参数
  if (sorter.field === 'viewQuantity' && sorter.order) {
    searchParams.sorts = [
      {
        asc: sorter.order === 'ascend',
        field: 'viewQuantity',
      },
    ]
  } else if (sorter.field === 'likeQuantity' && sorter.order) {
    searchParams.sorts = [
      {
        asc: sorter.order === 'ascend',
        field: 'likeQuantity',
      },
    ]
  } else if (sorter.field === 'collectQuantity' && sorter.order) {
    searchParams.sorts = [
      {
        asc: sorter.order === 'ascend',
        field: 'collectQuantity',
      },
    ]
  } else if (sorter.field === 'downloadQuantity' && sorter.order) {
    searchParams.sorts = [
      {
        asc: sorter.order === 'ascend',
        field: 'downloadQuantity',
      },
    ]
  } else if (sorter.field === 'shareQuantity' && sorter.order) {
    searchParams.sorts = [
      {
        asc: sorter.order === 'ascend',
        field: 'shareQuantity',
      },
    ]
  } else {
    resetPictureSearchParams()
  }
  // 分页参数
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

/**
 * 清理图片搜索条件
 */
const clearPictureParams = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
}
/**
 * 重置图片搜索条件
 */
const resetPictureSearchParams = () => {
  clearPictureParams()
  Object.assign(searchParams, INITIAL_PICTURE_SEARCH_PARAMS)
}


/**
 * 分类列表
 */
const categoryList = ref<API.CategoryVO[]>([])
/**
 * 获取分类列表数据
 */
const getCategoryListData = async () => {
  const res = await getCategoryListAsHomeUsingGet()
  if (res.data.code === 0 && res.data.data) {
    categoryList.value = (res.data.data ?? []).map((data: API.CategoryVO) => {
      return {
        value: data.id,
        label: data.name,
      }
    })
  } else {
    message.error('分类加载失败!')
  }
}


// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除数据
const doDelete = async (id: string) => {
  if (!id) {
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
        // 刷新数据
        fetchData()
      } else {
        message.error('删除失败')
      }
    }
  })
}

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表数据
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}

// 选项选中的 key 数组，存放 图片 ID
const selectedRowKeys = ref<string[]>([])
// 选项操作配置
const rowSelection = reactive({
  selectedRowKeys: [] as string[],
  onChange: (keys: string[]) => {
    rowSelection.selectedRowKeys = keys
  },
  // 可选：添加选择框列配置
  columnWidth: 50,
  fixed: true,
})

/**
 * 刷新重置数据
 */
const refreshResetData = () => {
  resetPictureSearchParams()
  fetchData()
  message.success('刷新成功')
}
</script>

<style scoped>
/* 表单中输入框左边文字和右边输入框在同一水平线处理 */
.custom-form :deep(.ant-form-item-label > label) {
  height: 40px; /* 与输入框高度一致 */
  line-height: 40px; /* 垂直居中 */
  display: flex;
  align-items: center; /* 垂直对齐 */
}

/* 表格单元格样式 */
.text-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 自定义tooltip样式 */
.custom-tooltip .ant-tooltip-inner {
  max-width: 400px;
  word-break: break-all;
  white-space: pre-line;
}










</style>
