<template>
  <div class="comment-item">
    <div class="comment-main">
      <a-avatar :src="comment.user?.userAvatar" :size="40" class="comment-avatar" />

      <div class="comment-content-wrapper">
        <div class="comment-header">
          <span class="comment-username">{{ comment.user?.userName || '匿名用户' }}</span>
          <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
        </div>

        <div class="comment-content">{{ comment.content }}</div>

        <div class="comment-actions">
          <a-button type="text" size="small" @click="handleReply">
            <template #icon>
              <CommentOutlined />
            </template>
            回复
          </a-button>

          <a-button
            v-if="canDelete"
            type="text"
            size="small"
            danger
            @click="handleDelete"
          >
            <template #icon>
              <DeleteOutlined />
            </template>
            删除
          </a-button>

          <span v-if="comment.replyCount && comment.replyCount > 0" class="reply-count">
            {{ comment.replyCount }} 条回复
          </span>
        </div>
      </div>
    </div>

    <!-- 递归渲染子评论 -->
    <div v-if="comment.children && comment.children.length > 0" class="comment-children">
      <CommentItem
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :pictureId="pictureId"
        @reply="$emit('reply', $event)"
        @delete="$emit('delete', $event)"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { CommentOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { deleteCommentUsingPost } from '@/api/commentController'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface Props {
  comment: API.CommentVO
  pictureId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reply: [comment: API.CommentVO]
  delete: [commentId: number]
  refresh: []
}>()

const loginUserStore = useLoginUserStore()

// 判断是否可以删除（仅本人或管理员）
const canDelete = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) return false

  return (
    loginUser.id === props.comment.userId ||
    loginUser.userRole === 'admin'
  )
})

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return ''
  return dayjs(time).fromNow()
}

// 处理回复
const handleReply = () => {
  emit('reply', props.comment)
}

// 处理删除
const handleDelete = () => {
  Modal.confirm({
    title: '删除评论',
    content: '确定要删除这条评论吗？删除后不可恢复！',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deleteCommentUsingPost({ id: props.comment.id })
        if (res.data.code === 0) {
          message.success('删除成功')
          emit('refresh')
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (error: any) {
        message.error('删除失败：' + error.message)
      }
    },
  })
}
</script>

<style scoped>
.comment-item {
  margin-bottom: 16px;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content-wrapper {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-username {
  font-weight: 600;
  color: #262626;
  font-size: 14px;
}

.comment-time {
  color: #8c8c8c;
  font-size: 12px;
}

.comment-content {
  color: #262626;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-actions :deep(.ant-btn) {
  padding: 0 8px;
  height: 24px;
}

.reply-count {
  color: #8c8c8c;
  font-size: 12px;
  margin-left: auto;
}

.comment-children {
  margin-left: 52px;
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-children {
    margin-left: 32px;
    padding-left: 12px;
  }
}
</style>