<template>
  <div id="globalSider">
<!--    <a-layout-sider width="200" v-if="loginUserStore.loginUser.id" collapsed-width="0" breakpoint="lg">-->
    <a-layout-sider width="200"  collapsed-width="0" breakpoint="lg">
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
import {computed, h, ref, watchEffect} from 'vue';
import {PictureOutlined,UserOutlined,TeamOutlined} from '@ant-design/icons-vue';
import { message} from 'ant-design-vue';
import {useRouter} from "vue-router";
import {useLoginUserStore} from "@/stores/useLoginUserStore";
import {userLogoutUsingPost} from "@/api/userController";
import {SPACE_TYPE_ENUM} from "@/constants/space";
import {listMyTeamSpaceUsingPost} from "@/api/spaceUserController";

// 菜单项
const fixedMenuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库'
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon:()=> h(UserOutlined)
  },
  {
    key: '/add_space?type='+SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon:()=> h(TeamOutlined)
  }
]

const loginUserStore = useLoginUserStore()
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 如果用户没有团队空间，则只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 如果用户有团队空间，则展示固定菜单和团队空间菜单
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})
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

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

//如果之前用户没有登录，后来登录了也会及时在侧边栏加载出来
watchEffect(()=>{
  if(loginUserStore.loginUser.id){
    fetchTeamSpaceList()
  }
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

