<template>
  <div id="globalSider">
    <a-layout-sider
      width="200"
      collapsed-width="0"
      breakpoint="lg"
      :collapsed="collapsed"
      :trigger="null"
      collapsible
    >
      <a-menu
        v-model:selectedKeys="current"
        mode="inline"
        :items="menuItems"
        @click="doMenuClick"
        :inline-collapsed="collapsed"
      >
      </a-menu>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import {h, ref} from 'vue';
import {CloudOutlined,DownloadOutlined,StarOutlined} from '@ant-design/icons-vue';
import {useRouter} from "vue-router";

// 接收 props
defineProps<{
  collapsed: boolean;
}>();

// 菜单项 - 简化为三个选项
const menuItems = [
  {
    key: '/my_collections',
    label: '我的收藏',
    icon:()=> h(StarOutlined)
  },
  {
    key: '/my_downloads',
    label: '下载记录',
    icon:()=> h(DownloadOutlined)
  },
  {
    key: '/space_list',
    label: '云空间',
    icon:()=> h(CloudOutlined)
  }
]

const router = useRouter()

// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push(key)
}

//监听路由变化，更新菜单高亮项
const current = ref<string[]>([]);
router.afterEach((to,from,next)=>{
  current.value = [to.path]
})

</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}

#globalSider :deep(.ant-layout-sider-zero-width-trigger ){
  background-color: #4590d7;
}
</style>

