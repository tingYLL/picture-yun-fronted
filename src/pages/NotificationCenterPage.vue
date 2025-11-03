<template>
  <div id="notificationCenterPage">
    <a-card title="通知中心">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <!-- 收到的评论通知 -->
        <a-tab-pane key="received" tab="收到的通知">
          <div class="tab-actions">
            <a-space>
              <a-button
                type="primary"
                :disabled="selectedRowKeys.length === 0"
                @click="batchMarkAsRead"
              >
                批量标记已读
              </a-button>
              <a-button
                danger
                :disabled="selectedRowKeys.length === 0"
                @click="batchDelete"
              >
                批量删除
              </a-button>
              <a-button @click="markAllAsRead">全部标记已读</a-button>
              <a-button danger @click="clearReadNotifications">清空已读</a-button>
            </a-space>
          </div>

          <a-table
            :row-selection="{
              selectedRowKeys,
              onChange: onSelectChange,
            }"
            :columns="notificationColumns"
            :data-source="notifications"
            :loading="loading"
            :pagination="pagination"
            @change="handleTableChange"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'content'">
                <div
                  class="notification-content"
                  :class="{ 'unread': record.isRead === 0 }"
                  @click="handleNotificationClick(record)"
                >
                  <div class="notification-title">
                    <a-badge :dot="record.isRead === 0">
                      <span class="title-text">{{ record.title }}</span>
                    </a-badge>
                  </div>
                  <div class="notification-text">{{ record.content }}</div>
                  <div class="notification-meta">
                    <a-space>
                      <span>来自: {{ record.triggerUser?.userName }}</span>
                      <span>{{ formatTime(record.createTime) }}</span>
                    </a-space>
                  </div>
                </div>
              </template>

              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button
                    type="link"
                    size="small"
                    @click="viewPicture(record.pictureId)"
                  >
                    查看图片
                  </a-button>
                  <a-button
                    v-if="record.isRead === 0"
                    type="link"
                    size="small"
                    @click="markAsRead(record.id)"
                  >
                    标记已读
                  </a-button>
                  <a-button
                    type="link"
                    size="small"
                    danger
                    @click="deleteNotification(record.id)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  getUserNotificationsUsingGet,
  markAsReadUsingPost,
  markAllAsReadUsingPost,
  batchMarkAsReadUsingPost,
  deleteNotificationUsingPost,
  batchDeleteNotificationsUsingPost,
  clearReadNotificationsUsingPost,
} from '@/api/commentNotificationController'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()

const activeTab = ref('received')
const loading = ref(false)
const notifications = ref<API.CommentNotificationVO[]>([])
const selectedRowKeys = ref<number[]>([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total: number) => `共 ${total} 条`,
})

// 表格列配置
const notificationColumns = [
  {
    title: '通知内容',
    key: 'content',
    width: '60%',
  },
  {
    title: '操作',
    key: 'action',
    width: '200px',
  },
]

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return ''
  return dayjs(time).fromNow()
}

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await getUserNotificationsUsingGet({
      current: pagination.current,
      pageSize: pagination.pageSize,
    })

    if (res.data.code === 0 && res.data.data) {
      notifications.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
    } else {
      message.error('获取通知失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('获取通知失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 表格变化处理
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchNotifications()
}

// Tab 切换处理
const handleTabChange = (key: string) => {
  activeTab.value = key
  pagination.current = 1
  selectedRowKeys.value = []
  fetchNotifications()
}

// 选择变化
const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 点击通知
const handleNotificationClick = async (notification: API.CommentNotificationVO) => {
  // 标记为已读
  if (notification.isRead === 0 && notification.id) {
    await markAsRead(notification.id)
  }
  // 跳转到图片详情页
  if (notification.pictureId) {
    router.push(`/picture/${notification.pictureId}`)
  }
}

// 查看图片
const viewPicture = (pictureId?: number) => {
  if (pictureId) {
    router.push(`/picture/${pictureId}`)
  }
}

// 标记单个为已读
const markAsRead = async (id?: number) => {
  if (!id) return

  try {
    const res = await markAsReadUsingPost({ id })
    if (res.data.code === 0) {
      message.success('已标记为已读')
      fetchNotifications()
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('操作失败：' + error.message)
  }
}

// 批量标记已读
const batchMarkAsRead = async () => {
  if (selectedRowKeys.value.length === 0) return

  try {
    const res = await batchMarkAsReadUsingPost(selectedRowKeys.value)
    if (res.data.code === 0) {
      message.success('批量标记已读成功')
      selectedRowKeys.value = []
      fetchNotifications()
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('操作失败：' + error.message)
  }
}

// 全部标记已读
const markAllAsRead = async () => {
  Modal.confirm({
    title: '确认操作',
    content: '确定要将所有通知标记为已读吗？',
    onOk: async () => {
      try {
        const res = await markAllAsReadUsingPost()
        if (res.data.code === 0) {
          message.success('全部标记已读成功')
          fetchNotifications()
        } else {
          message.error('操作失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('操作失败：' + error.message)
      }
    },
  })
}

// 删除单个通知
const deleteNotification = async (id?: number) => {
  if (!id) return

  Modal.confirm({
    title: '删除通知',
    content: '确定要删除这条通知吗？',
    onOk: async () => {
      try {
        const res = await deleteNotificationUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          fetchNotifications()
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败：' + error.message)
      }
    },
  })
}

// 批量删除
const batchDelete = async () => {
  if (selectedRowKeys.value.length === 0) return

  Modal.confirm({
    title: '批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条通知吗？`,
    onOk: async () => {
      try {
        const res = await batchDeleteNotificationsUsingPost(selectedRowKeys.value)
        if (res.data.code === 0) {
          message.success('批量删除成功')
          selectedRowKeys.value = []
          fetchNotifications()
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败：' + error.message)
      }
    },
  })
}

// 清空已读
const clearReadNotifications = async () => {
  Modal.confirm({
    title: '清空已读通知',
    content: '确定要清空所有已读通知吗？此操作不可恢复！',
    onOk: async () => {
      try {
        const res = await clearReadNotificationsUsingPost()
        if (res.data.code === 0) {
          message.success('清空成功')
          fetchNotifications()
        } else {
          message.error('操作失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('操作失败：' + error.message)
      }
    },
  })
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
#notificationCenterPage {
  padding: 24px;
}

.tab-actions {
  margin-bottom: 16px;
}

.notification-content {
  cursor: pointer;
  padding: 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.notification-content:hover {
  background-color: #f5f5f5;
}

.notification-content.unread {
  background-color: #e6f7ff;
}

.notification-content.unread:hover {
  background-color: #d1ecff;
}

.notification-title {
  margin-bottom: 8px;
}

.title-text {
  font-weight: 600;
  font-size: 15px;
  color: #262626;
}

.notification-text {
  color: #595959;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.6;
}

.notification-meta {
  font-size: 12px;
  color: #8c8c8c;
}
</style>