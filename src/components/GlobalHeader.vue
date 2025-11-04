<template>
  <div id="globalHeader">
    <a-row :wrap="false" align="middle">
      <a-col flex="auto">
        <div style="display: flex; align-items: center">
          <router-link to="/">
            <div class="title-bar">
              <img src="/logo.png" alt="logo" class="logo" />
<!--              <div class="title">哔哔哩哩</div>-->
            </div>
          </router-link>
          <a-menu
            v-model:selectedKeys="current"
            mode="horizontal"
            :items="items"
            @click="doMenuClick"
            style="flex: 1; border: none; margin-left: 40px"
          />
        </div>
      </a-col>
      <a-col flex="auto">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <!-- 消息通知图标 -->
            <a-badge :count="unreadCount" :overflow-count="99" class="notification-badge">
              <a-button type="text" shape="circle" size="large" @click="goToNotificationCenter">
                <template #icon>
                  <BellOutlined :style="{ fontSize: '20px' }" />
                </template>
              </a-button>
            </a-badge>

            <a-dropdown @visibleChange="handleDropdownVisibleChange">
              <a-space :size="8">
                <a-badge :dot="loginUserStore.loginUser.isVip" :offset="[-8, 32]">
                  <template #count>
                    <div
                      class="vip-badge-icon"
                      :class="{ 'non-vip': !loginUserStore.loginUser.isVip }"
                    >
                      <SketchOutlined />
                    </div>
                  </template>
                  <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="40" />
                </a-badge>
                <div class="user-info">
                  <span class="user-name-text">{{
                    loginUserStore.loginUser.userName ?? '无名'
                  }}</span>
                </div>
              </a-space>
              <template #overlay>
                <div class="user-dropdown-menu">
                  <div class="menu-header">
                    <div class="download-info">
                      <div class="download-text">
                        <CloudDownloadOutlined />
                        <span>今日免费下载次数</span>
                      </div>
                      <div class="download-count-wrapper">
                        <span class="download-count">{{ remainingDownloads }}</span>
                        <span class="download-unit">次</span>
                      </div>
                    </div>
                  </div>

                  <a-divider class="menu-divider" />

                  <div class="menu-item vip-item" @click="openPaymentModal">
                    <CrownOutlined class="vip-crown" />
                    <StarOutlined class="vip-star" />
                    <span class="vip-text">VIP充值</span>
                    <RightOutlined class="menu-arrow" />
                  </div>

                  <div class="menu-item">
                    <router-link to="/user/profile" class="menu-link">
                      <UserOutlined />
                      <span>个人信息</span>
                      <RightOutlined class="menu-arrow" />
                    </router-link>
                  </div>

                  <a-divider class="menu-divider" />

                  <div class="menu-item logout-item" @click="doLogout">
                    <LogoutOutlined />
                    <span>退出登录</span>
                    <RightOutlined class="menu-arrow" />
                  </div>
                </div>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- PaymentModal组件 -->
    <PaymentModal ref="paymentModalRef" />
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  CrownOutlined,
  StarOutlined,
  CloudDownloadOutlined,
  RightOutlined,
  SketchOutlined,
  BellOutlined,
  UnorderedListOutlined,
  TeamOutlined,
  PictureOutlined,
  AppstoreOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  GiftOutlined,
} from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'
import { getRemainingDownloadsUsingGet } from '@/api/downloadController'
import { getUnreadCountUsingGet } from '@/api/commentNotificationController'
import { commentSseService } from '@/utils/commentSse'
import PictureReleaseListPage from '@/pages/PictureReleaseListPage.vue'
import PaymentModal from './PaymentModal.vue'

const loginUserStore = useLoginUserStore()

// 剩余下载次数
const remainingDownloads = ref<number>(0)

// 未读消息数
const unreadCount = ref<number>(0)

// 获取剩余下载次数
const fetchRemainingDownloads = async () => {
  try {
    const res = await getRemainingDownloadsUsingGet()
    if (res.data.code === 0) {
      remainingDownloads.value = res.data.data
    }
  } catch (error) {
    console.error('获取剩余下载次数失败:', error)
  }
}

// 获取未读消息数
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCountUsingGet()
    if (res.data.code === 0 && res.data.data !== undefined) {
      unreadCount.value = res.data.data
    }
  } catch (error) {
    console.error('获取未读消息数失败:', error)
  }
}

// 跳转到通知中心
const goToNotificationCenter = () => {
  router.push('/notification/center')
}

// PaymentModal ref
const paymentModalRef = ref<InstanceType<typeof PaymentModal>>()

// 打开支付弹窗
const openPaymentModal = () => {
  paymentModalRef.value?.openModal()
}

// 处理下拉菜单显示/隐藏事件
const handleDropdownVisibleChange = (visible: boolean) => {
  if (visible && loginUserStore.loginUser.id) {
    // 当下拉菜单打开时，获取最新的剩余下载次数
    fetchRemainingDownloads()
  }
}

// SSE 消息处理器取消注册函数
let unregisterSseHandler: (() => void) | null = null

// 处理 SSE 消息
const handleSseMessage = (data: any) => {
  // 收到新消息时，刷新未读数
  fetchUnreadCount()
  // 可以选择显示一个通知提示
  if (data.content) {
    message.info(`收到新评论通知：${data.content}`)
  }
}

// 注册 SSE 消息处理器
const registerSseHandler = () => {
  // 如果已经注册过，先取消之前的注册
  if (unregisterSseHandler) {
    console.log('[GlobalHeader] 取消之前的 SSE 处理器注册')
    unregisterSseHandler()
  }

  console.log('[GlobalHeader] 注册 SSE 消息处理器')
  console.log('[GlobalHeader] SSE 连接状态:', commentSseService.isConnected())
  unregisterSseHandler = commentSseService.onMessage(handleSseMessage)
  console.log('[GlobalHeader] SSE 消息处理器注册完成')
}

// 组件挂载时
onMounted(() => {
  if (loginUserStore.loginUser.id) {
    fetchRemainingDownloads()
    fetchUnreadCount()
    // 延迟注册，确保 SSE 连接已建立
    setTimeout(() => {
      registerSseHandler()
    }, 1000)
  }
})

// 监听登录状态变化
watch(
  () => loginUserStore.loginUser.id,
  (newId, oldId) => {
    console.log('[GlobalHeader] 登录状态变化:', { oldId, newId })
    if (newId && !oldId) {
      // 用户刚登录，初始化数据
      fetchRemainingDownloads()
      fetchUnreadCount()
      // 监听 SSE 消息
      registerSseHandler()
    } else if (!newId && oldId) {
      // 用户登出，取消注册
      if (unregisterSseHandler) {
        console.log('[GlobalHeader] 用户登出，取消 SSE 处理器注册')
        unregisterSseHandler()
        unregisterSseHandler = null
      }
    }
  },
)

// 组件卸载时
onBeforeUnmount(() => {
  // 取消注册 SSE 处理器
  if (unregisterSseHandler) {
    console.log('[GlobalHeader] 组件卸载，取消 SSE 处理器注册')
    unregisterSseHandler()
    unregisterSseHandler = null
  }
})
// 未经过滤的菜单项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '首页',
    title: '首页',
  },
  // {
  //   key:'/add_picture',
  //   label: '创建图片',
  //   title: '创建图片'
  // },
  {
    key: '/picture/list',
    icon: () => h(UnorderedListOutlined),
    label: '发布列表',
    title: '发布列表',
  },
  {
    key: '/admin/userManage',
    icon: () => h(TeamOutlined),
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    icon: () => h(PictureOutlined),
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/categoryManage',
    icon: () => h(AppstoreOutlined),
    label: '分类管理',
    title: '分类管理',
  },
  {
    key: '/admin/spaceManage',
    icon: () => h(FolderOutlined),
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/admin/scheduledTask',
    icon: () => h(ClockCircleOutlined),
    label: '定时任务',
    title: '定时任务',
  },
  {
    key: '/admin/vipCodeManage',
    icon: () => h(GiftOutlined),
    label: '兑换码管理',
    title: '兑换码管理',
  },
]

// 根据权限过滤菜单项，比如普通用户是看不到用户管理这个菜单的，而管理员可以看到
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    // 管理员才能看到 /admin 开头的菜单
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed(() => filterMenus(originItems))

const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}
//监听路由变化，更新菜单高亮项
const current = ref<string[]>([])
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({ username: '未登录' })
    message.success('已退出登录')
    await router.push({
      path: '/user/login',
    })
  } else {
    message.error('退出登录失败' + res.data.message)
  }
}
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 8px;
}

.logo {
  height: 60px;
  margin: 0 4px;
}

/* 用户登录状态容器样式 */
.user-login-status {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 24px;
  gap: 8px;
}

/* 消息通知图标样式 */
.notification-badge {
  margin-right: 8px;
}

.notification-badge :deep(.ant-badge-count) {
  box-shadow: 0 0 0 1px #fff;
}

/* 下拉菜单整体样式 */
.user-dropdown-menu {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  min-width: 280px;
  overflow: hidden;
}

/* 菜单头部样式 */
.menu-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #fb7299 0%, #fc9dce 100%);
  color: white;
}

.download-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.download-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.download-count-wrapper {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.download-count {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-unit {
  font-size: 14px;
  opacity: 0.8;
}

/* 分割线样式 */
.menu-divider {
  margin: 0;
  border-color: rgba(0, 0, 0, 0.06);
}

/* 菜单项通用样式 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  gap: 12px;
}

.menu-item:hover {
  background: linear-gradient(90deg, rgba(251, 114, 153, 0.08) 0%, rgba(252, 157, 206, 0.08) 100%);
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  width: 100%;
}

.menu-link:hover {
  color: inherit;
  text-decoration: none;
}

/* VIP充值特殊样式 */
.vip-item {
  background: linear-gradient(135deg, #e8f4fd 0%, #d6ecff 100%);
  position: relative;
  overflow: hidden;
}

.vip-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(251, 114, 153, 0.2), transparent);
  transition: left 0.5s ease;
}

.vip-item:hover::before {
  left: 100%;
}

.vip-crown {
  color: #fb7299;
  font-size: 18px;
}

.vip-star {
  color: #00a1d6;
  font-size: 16px;
  animation: sparkle 2s ease-in-out infinite;
}

.vip-text {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
}

/* 退出登录样式 */
.logout-item {
  color: #e74c3c;
}

.logout-item:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* 通用箭头样式 */
.menu-arrow {
  margin-left: auto;
  color: #bdc3c7;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.menu-item:hover .menu-arrow {
  transform: translateX(4px);
}

/* 图标通用样式 */
.menu-item .anticon {
  font-size: 16px;
}

/* VIP认证徽章 - 使用 a-badge 实现 */
.vip-badge-icon {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #fb7299 0%, #fc9dce 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(251, 114, 153, 0.5);
  font-size: 10px;
  color: #ffffff;
  transition: all 0.3s ease;
}

/* 非会员徽章样式 - 纯灰色 */
.vip-badge-icon.non-vip {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  box-shadow: 0 2px 8px rgba(149, 165, 166, 0.3);
}

/* 移除 hover 效果，保持图标固定 */
/* .vip-badge-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(251, 114, 153, 0.6);
} */

/* 用户名容器样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.user-name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
</style>
