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

  if (userId) {
    // 用户已登录，建立 SSE 连接
    if (!commentSseService.isConnected()) {
      console.log('[App] 用户已登录，建立 SSE 连接')
      commentSseService.connect()
    }
  } else {
    // 用户未登录，断开 SSE 连接
    if (commentSseService.isConnected()) {
      console.log('[App] 用户未登录，断开 SSE 连接')
      commentSseService.disconnect()
    }
  }
}

// 组件挂载时
onMounted(() => {
  // 获取登录用户信息
  loginUserStore.fetchLoginUser().then(() => {
    // 根据登录状态管理 SSE 连接
    manageSseConnection()
  })

  // 监听登录状态变化
  watch(
    () => loginUserStore.loginUser.id,
    (newId, oldId) => {
      console.log('[App] 登录状态变化:', { oldId, newId })
      manageSseConnection()
    }
  )
})

// 组件卸载时
onBeforeUnmount(() => {
  console.log('[App] 应用卸载，断开 SSE 连接')
  commentSseService.disconnect()
})
</script>

<style scoped></style>
