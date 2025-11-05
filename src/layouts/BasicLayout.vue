<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <GlobalSider v-model:collapsed="collapsed" />
        <a-layout-content class="content" :style="{ marginLeft: collapsed ? '80px' : '200px' }">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
    <!-- 回到顶部按钮 -->
    <a-back-top :visibility-height="300">
      <div class="back-top-btn">
        <UpOutlined />
      </div>
    </a-back-top>
  </div>
</template>
<script setup lang="ts">

import GlobalHeader from "@/components/GlobalHeader.vue";
import GlobalSider from "@/components/GlobalSider.vue";
import { UpOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

// 侧边栏收缩状态
const collapsed = ref(false);
</script>

<style scoped>

#basicLayout .header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding-inline: 20px;
  background: white;
  color: unset;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

#basicLayout .content {
  padding: 28px;
  padding-top: 92px; /* header高度64px + 额外间距28px */
  background: linear-gradient(to right, #fefefe, #fff);
  min-height: 100vh;
  transition: margin-left 0.3s;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

/* 回到顶部按钮样式 */
.back-top-btn {
  width: 48px;
  height: 48px;
  background-color: #1890ff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-top-btn:hover {
  background-color: #40a9ff;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.6);
  transform: translateY(-2px);
}
</style>
