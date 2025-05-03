<template>
  <div id="globalSider">
    <a-layout-sider width="200" v-if="loginUserStore.loginUser.id" collapsed-width="0" breakpoint="lg">
      <a-menu
        v-model:selectedKeys="current"
        mode="inline" :items="menuItems"
        @click="doMenuClick"
      >
      </a-menu>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import {computed, h, ref} from 'vue';
import {PictureOutlined,UserOutlined} from '@ant-design/icons-vue';
import { message} from 'ant-design-vue';
import {useRouter} from "vue-router";
import {useLoginUserStore} from "@/stores/useLoginUserStore";
import {userLogoutUsingPost} from "@/api/userController";

const loginUserStore = useLoginUserStore()
// 菜单项
const menuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库'
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon:()=> h(UserOutlined)
  }
]


const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
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

