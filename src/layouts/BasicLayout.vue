<template>
  <div id="basicLayout" :class="{ collapsed: collapsed }">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout>
        <!-- 侧边栏容器 -->
        <div class="sider-container" :class="{ collapsed: collapsed }">
          <GlobalSider class="sider" :collapsed="collapsed" @toggle-sider="toggleSider" />
        </div>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
<!--      <a-layout-footer class="footer">-->
<!--        <a href="#" target="_blank">哔哔哩哩 by 蒙古上单</a>-->
<!--      </a-layout-footer>-->
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

// 切换侧边栏
const toggleSider = () => {
  collapsed.value = !collapsed.value;
};
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
  margin-bottom: 1px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

#basicLayout .sider-container {
  position: fixed;
  left: 0;
  top: 64px; /* header高度 */
  height: calc(100vh - 64px);
  z-index: 999;
  background: #fff;
  border-right: 0.5px solid #eee;
  transition: all 0.3s ease;
}

#basicLayout .sider{
  background-color: #fff;
  padding-top: 20px;
  height: 100%;
  overflow-y: auto;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  padding-top: 92px; /* header高度64px + 额外间距28px */
  padding-left: 228px; /* 侧边栏宽度 + 额外间距 */
  background: linear-gradient(to right, #fefefe, #fff);
  min-height: calc(100vh - 64px);
  transition: padding-left 0.3s ease;
}

/* 当侧边栏收缩时的样式 */
#basicLayout .sider-container.collapsed {
  left: -200px;
}

#basicLayout.collapsed .content {
  padding-left: 28px;
}

#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
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
