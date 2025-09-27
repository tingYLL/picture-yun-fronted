<template>
  <div id="app">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: '#f97198', // 主题色
          borderRadius: 10, // 圆角
        },
      }"
    >
    </a-config-provider>
    <BasicLayout />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
// import {healthUsingGet} from "@/api/mainController";
// import {useLoginUserStore} from "@/stores/useLoginUserStore";
//
// healthUsingGet().then(res=>{
//   console.log(res);
// })
//
// const loginUserStore = useLoginUserStore();
// loginUserStore.fetchLoginUser();
</script>

<style scoped></style>
