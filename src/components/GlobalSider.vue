<template>
  <a-layout-sider
    width="200"
    v-model:collapsed="localCollapsed"
    collapsible
    theme="light"
    :style="{
      overflow: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      paddingTop: '64px'
    }"
  >
    <a-menu
      v-model:selectedKeys="current"
      mode="inline"
      :items="menuItems"
      @click="doMenuClick"
      style="margin-top: 20px;"
    >
    </a-menu>
  </a-layout-sider>
</template>
<script lang="ts" setup>
import {h, ref} from 'vue';
import {CloudOutlined,DownloadOutlined,StarOutlined} from '@ant-design/icons-vue';
import {useRouter} from "vue-router";

// 使用 v-model 方式
const localCollapsed = defineModel<boolean>('collapsed', { default: false });

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
/* 设置侧边栏背景为白色 */
:deep(.ant-layout-sider) {
  background: #fff;
  border-right: 1px solid #f0f0f0;
}

/* 自定义官方触发器的样式 */
:deep(.ant-layout-sider-trigger) {
  background-color: #fff;
  color: #666;
  border-top: 1px solid #f0f0f0;
  transition: all 0.3s;
}

:deep(.ant-layout-sider-trigger:hover) {
  background-color: #e6f7ff;
  color: #1890ff;
}

:deep(.ant-layout-sider-zero-width-trigger) {
  background-color: #1890ff;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 0 6px 6px 0;
}

:deep(.ant-layout-sider-zero-width-trigger:hover) {
  background-color: #40a9ff;
}

/* 菜单背景也设置为白色 */
:deep(.ant-menu) {
  background: #fff;
}

/* 菜单项默认状态 */
:deep(.ant-menu-item) {
  color: #333;
}

:deep(.ant-menu-item:hover) {
  color: #1890ff;
}

/* 选中的菜单项 */
:deep(.ant-menu-item-selected) {
  background-color: #e6f7ff;
  color: #1890ff;
}
</style>

