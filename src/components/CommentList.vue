<template>
  <div class="comment-list">
    <div v-if="comments.length === 0" class="empty-comments">
      <a-empty description="暂无评论，快来发表第一条评论吧！" />
    </div>
    <div v-else>
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :pictureId="pictureId"
        @reply="handleReply"
        @delete="handleDelete"
        @refresh="$emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import CommentItem from './CommentItem.vue'

interface Props {
  comments: API.CommentVO[]
  pictureId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reply: [comment: API.CommentVO]
  delete: [commentId: number]
  refresh: []
}>()

const handleReply = (comment: API.CommentVO) => {
  emit('reply', comment)
}

const handleDelete = (commentId: number) => {
  emit('delete', commentId)
}
</script>

<style scoped>
.comment-list {
  width: 100%;
}

.empty-comments {
  padding: 40px 0;
  text-align: center;
}
</style>