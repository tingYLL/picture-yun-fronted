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

    <!-- 展开按钮（当侧边栏收缩时显示在外部） -->
    <div v-if="collapsed" class="sider-toggle-btn sider-expand-btn" :style="{ left: siderWidth + 'px' }" @click="$emit('toggle-sider')">
      <MenuUnfoldOutlined />
    </div>

    <!-- 收缩按钮（当侧边栏展开时显示在外部） -->
    <div v-if="!collapsed" class="sider-toggle-btn sider-collapse-btn-external" :style="{ left: siderWidth + 'px' }" @click="$emit('toggle-sider')">
      <MenuFoldOutlined />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {h, ref, computed} from 'vue';
import {CloudOutlined,DownloadOutlined,StarOutlined,MenuFoldOutlined,MenuUnfoldOutlined} from '@ant-design/icons-vue';
import {useRouter} from "vue-router";

// 接收 props 和定义 emits
const props = defineProps<{
  collapsed: boolean;
}>();

defineEmits<{
  (e: 'toggle-sider'): void;
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

// 侧边栏宽度，用于按钮位置计算
const siderWidth = computed(() => {
  return props.collapsed ? 0 : 200;
})

</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
  display: flex;
  flex-direction: column;
}

#globalSider :deep(.ant-layout-sider-zero-width-trigger ){
  background-color: #4590d7;
}

#globalSider :deep(.ant-menu) {
  flex: 1;
}

.sider-collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  transition: all 0.3s;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.sider-collapse-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.sider-expand-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  transition: all 0.3s, left 0.3s;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-left: none;
  border-radius: 0 6px 6px 0;
  z-index: 1000;
}

.sider-expand-btn:hover {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #1890ff;
}

.sider-collapse-btn-external {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  transition: all 0.3s, left 0.3s;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 0 6px 6px 0;
  z-index: 1001; /* 比侧边栏容器更高的z-index */
}

.sider-collapse-btn-external:hover {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #1890ff;
}
</style>

