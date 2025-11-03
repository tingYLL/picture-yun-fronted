<template>
  <div class="comment-input">
    <div v-if="!loginUserStore.loginUser.id" class="login-tip">
      <a-alert
        message="请先登录后再发表评论"
        type="info"
        show-icon
      >
        <template #action>
          <a-button size="small" type="primary" @click="goToLogin">
            去登录
          </a-button>
        </template>
      </a-alert>
    </div>

    <div v-else class="input-area">
      <div v-if="replyTo" class="reply-info">
        <span>回复 @{{ replyTo.user?.userName }}：</span>
        <a-button type="text" size="small" @click="cancelReply">
          <template #icon>
            <CloseOutlined />
          </template>
          取消
        </a-button>
      </div>

      <div class="input-wrapper">
        <a-avatar
          :src="loginUserStore.loginUser.userAvatar"
          :size="40"
          class="user-avatar"
        />

        <a-textarea
          v-model:value="content"
          :placeholder="placeholder"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :maxlength="500"
          show-count
          class="comment-textarea"
          @keydown.ctrl.enter="handleSubmit"
        />
      </div>

      <div class="input-actions">
        <span class="tip-text">Ctrl + Enter 快速发送</span>
        <a-button
          type="primary"
          :loading="submitting"
          :disabled="!content.trim()"
          @click="handleSubmit"
        >
          {{ replyTo ? '回复' : '发表评论' }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { addCommentUsingPost } from '@/api/commentController'

interface Props {
  pictureId: number
  spaceId?: number
  replyTo?: API.CommentVO
}

const props = defineProps<Props>()
const emit = defineEmits<{
  success: []
  cancel: []
}>()

const router = useRouter()
const loginUserStore = useLoginUserStore()

const content = ref('')
const submitting = ref(false)

// 输入框占位符
const placeholder = computed(() => {
  if (props.replyTo) {
    return `回复 @${props.replyTo.user?.userName}...`
  }
  return '发表你的评论...'
})

// 去登录
const goToLogin = () => {
  router.push('/user/login')
}

// 取消回复
const cancelReply = () => {
  emit('cancel')
}

// 提交评论
const handleSubmit = async () => {
  if (!content.value.trim()) {
    message.warning('评论内容不能为空')
    return
  }

  if (submitting.value) {
    return
  }

  submitting.value = true

  try {
    const params: API.CommentAddRequest = {
      content: content.value.trim(),
      pictureId: props.pictureId,
    }

    // 如果是回复评论
    if (props.replyTo) {
      params.parentId = props.replyTo.id
    }

    // 如果属于空间
    if (props.spaceId) {
      params.spaceId = props.spaceId
    }

    const res = await addCommentUsingPost(params)

    if (res.data.code === 0) {
      message.success(props.replyTo ? '回复成功' : '评论成功')
      content.value = ''
      emit('success')
    } else {
      message.error('操作失败：' + res.data.message)
    }
  } catch (error: any) {
    message.error('操作失败：' + error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.comment-input {
  width: 100%;
}

.login-tip {
  margin-bottom: 16px;
}

.input-area {
  width: 100%;
}

.reply-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  color: #595959;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.comment-textarea {
  flex: 1;
}

.input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 52px;
}

.tip-text {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-wrapper {
    flex-direction: column;
    gap: 8px;
  }

  .input-actions {
    padding-left: 0;
  }

  .tip-text {
    display: none;
  }
}
</style>