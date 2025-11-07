<template>
  <div id="app">
    <a-config-provider
      :locale="zhCN"
      :theme="{
        token: {
          colorPrimary: '#f97198', // 主题色
          borderRadius: 10, // 圆角
        },
      }"
    >
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { commentSseService } from '@/utils/commentSse'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const loginUserStore = useLoginUserStore()

// 管理 SSE 连接
const manageSseConnection = () => {
  const userId = loginUserStore.loginUser.id

  console.log('[App] manageSseConnection 被调用，用户ID:', userId)

  if (userId) {
    // 用户已登录，建立 SSE 连接
    if (!commentSseService.isConnected()) {
      console.log('[App] 用户已登录，建立 SSE 连接')
      commentSseService.connect()
    } else {
      console.log('[App] SSE 连接已存在，无需重复建立')
    }
  } else {
    // 用户未登录，断开 SSE 连接
    if (commentSseService.isConnected()) {
      console.log('[App] 用户未登录，断开 SSE 连接')
      commentSseService.disconnect()
    } else {
      console.log('[App] 用户未登录，且无连接，无需操作')
    }
  }
}

// 组件挂载时
onMounted(async () => {
  console.log('[App] 组件挂载，开始初始化')

  // 获取登录用户信息
  await loginUserStore.fetchLoginUser()

  // 获取完成后，立即尝试建立连接（确保每次刷新都会执行）
  console.log('[App] 用户信息获取完成，当前用户ID:', loginUserStore.loginUser.id)
  manageSseConnection()

  // 然后监听后续的登录状态变化（使用 immediate: false 避免立即触发）
  watch(
    () => loginUserStore.loginUser.id,
    (newId, oldId) => {
      console.log('[App] 登录状态变化:', { oldId, newId })
      // 只在真正的登录/登出切换时才管理连接
      if ((newId && !oldId) || (!newId && oldId)) {
        console.log('[App] 检测到登录状态切换，管理 SSE 连接')
        manageSseConnection()
      }
    },
    { immediate: false } // 明确指定不立即执行
  )

  // 监听页面卸载事件，确保在页面关闭或刷新时主动断开 SSE 连接
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 页面卸载前的处理
const handleBeforeUnload = () => {
  console.log('[App] 页面即将卸载，主动断开 SSE 连接')
  commentSseService.disconnect()
}

// 组件卸载时
onBeforeUnmount(() => {
  console.log('[App] 应用卸载，断开 SSE 连接')
  commentSseService.disconnect()
  // 移除事件监听
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped></style>
