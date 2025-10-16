<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader :collapsed="collapsed" @toggle-sider="toggleSider" />
      </a-layout-header>
      <a-layout>
        <GlobalSider class="sider" :collapsed="collapsed"/>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
<!--      <a-layout-footer class="footer">-->
<!--        <a href="#" target="_blank">啵哩啵哩 by 蒙古上单</a>-->
<!--      </a-layout-footer>-->
    </a-layout>
  </div>
</template>
<script setup lang="ts">

import GlobalHeader from "@/components/GlobalHeader.vue";
import GlobalSider from "@/components/GlobalSider.vue";
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
  padding-inline: 20px;
  background: white;
  color: unset;
  margin-bottom: 1px;
}

#basicLayout .sider{
  background-color: #fff;
  border-right: 0.5px solid #eee;
  padding-top: 20px;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  background: linear-gradient(to right, #fefefe, #fff);
  /* margin-bottom: 28px; */
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
</style>
