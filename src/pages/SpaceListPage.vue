<template>
  <div id="spaceListPage">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <CloudOutlined/>
            云空间
          </a-typography-title>
        </a-typography>
      </a-flex>
    </div>

    <a-divider />

    <div class="space-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <a-spin size="large" />
      </div>

      <!-- 空间列表 -->
      <div v-else-if="allSpaces.length > 0" class="space-list">
        <a-row :gutter="[16, 16]">
          <a-col
            v-for="space in allSpaces"
            :key="space.spaceId"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <a-card
              hoverable
              class="space-card"
              @click="enterSpace(space.spaceId)"
            >
              <!-- 私有空间标识 -->
              <template v-if="space.isPrivate">
                <a-badge-ribbon text="个人空间" color="blue" />
              </template>

              <a-card-meta>
                <template #title>
                  <div class="space-title">
                    <UserOutlined v-if="space.isPrivate" class="title-icon" />
                    <TeamOutlined v-else class="title-icon" />
                    <span>{{ space.spaceName }}</span>
                  </div>
                </template>
                <template #description>
                  <div class="space-info">
                    <div class="info-item" v-if="space.isPrivate">
                      <span class="label">角色：</span>
                      <a-tag >
                        创建者
                      </a-tag>
                    </div>
                    <div class="info-item" v-if="!space.isPrivate">
                      <span class="label">角色：</span>
                      <a-tag :color="getSpaceRoleColor(space.spaceRole)">
                        {{ getSpaceRoleText(space.spaceRole) }}
                      </a-tag>
                    </div>
                    <div class="info-item">
                      <span class="label">图片数量：</span>
                      <span>{{ space.size || 0 }}</span>
                    </div>
                    <div class="info-item" >
                      <span class="label">创建时间：</span>
                      <span>{{ formatTime(space.createTime) }}</span>
                    </div>
                    <div class="enter-hint">
                      <span class="hint-text">进入空间</span>
                      <RightOutlined class="hint-icon" />
                    </div>
                  </div>
                </template>
              </a-card-meta>
            </a-card>
          </a-col>

          <!-- 创建空间卡片 -->
          <a-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <a-card
              hoverable
              class="space-card add-space-card"
              @click="goToAddSpace"
            >
              <template #cover>
                <div class="add-space-cover">
                  <PlusOutlined class="add-space-icon" />
                </div>
              </template>

              <a-card-meta>
                <template #description>
                  <div class="add-space-info">
                    <div class="add-space-text">创建空间</div>
                    <div class="add-space-desc">创建个人或团队空间</div>
                  </div>
                </template>
              </a-card-meta>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-container">
        <a-empty description="暂无空间">
          <a-button type="primary" @click="goToAddSpace">
            创建第一个空间
          </a-button>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'
import { SPACE_TYPE_ENUM, SPACE_LEVEL_MAP, SPACE_LEVEL_ENUM, SPACE_ROLE_MAP } from '@/constants/space.ts'
import {
  PlusOutlined,
  CloudOutlined,
  TeamOutlined,UserOutlined,
  RightOutlined, StarOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const loading = ref(false)
const privateSpaces = ref<API.SpaceVO[]>([])
const teamSpaces = ref<API.SpaceUserVO[]>([])

// 计算所有空间列表，私有空间排在前面
const allSpaces = computed(() => {
  const privateSpaceItem = privateSpaces.value.map(space => ({
    ...space,
    isPrivate: true,
    spaceId: space.id,
    spaceName: space.spaceName,
    spaceLevel: space.spaceLevel,
    size: space.totalCount,
    createTime: space.createTime
  }))

  const teamSpaceItem = teamSpaces.value.map(spaceUser => ({
    ...spaceUser,
    isPrivate: false,
    spaceId: spaceUser.spaceId,
    spaceName: spaceUser.space.spaceName,
    spaceLevel: spaceUser.spaceLevel,
    size: spaceUser.space.totalCount,
    spaceRole: spaceUser.spaceRole,
    createTime: spaceUser.space.createTime
  }))

  return [...privateSpaceItem, ...teamSpaceItem]
})

// 获取用户空间列表
const loadUserSpaces = async () => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser?.id) {
    router.replace('/user/login')
    return
  }

  loading.value = true
  try {
    // 并行查询个人空间和团队空间
    const [privateSpaceRes, teamSpaceRes] = await Promise.all([
      // 查询个人空间
      listSpaceVoByPageUsingPost({
        userId: loginUser.id,
        current: 1,
        pageSize: 10, // 获取所有个人空间
        spaceType: SPACE_TYPE_ENUM.PRIVATE
      }),
      // 查询团队空间
      listMyTeamSpaceUsingPost()
    ])

    // 处理个人空间数据
    if (privateSpaceRes.data.code === 0) {
      privateSpaces.value = privateSpaceRes.data.data?.records || []
    } else {
      message.error('获取个人空间失败')
    }

    // 处理团队空间数据
    if (teamSpaceRes.data.code === 0) {
      teamSpaces.value = teamSpaceRes.data.data || []
    } else {
      message.error('获取团队空间失败')
    }
  } catch (error) {
    console.error('获取空间列表失败:', error)
    message.error('获取空间列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 进入空间
const enterSpace = (spaceId: number) => {
  router.push(`/space/${spaceId}`)
}

// 跳转到创建空间页面
const goToAddSpace = () => {
  router.push('/add_space')
}

// 获取空间级别文本
const getSpaceLevelText = (level: number) => {
  return SPACE_LEVEL_MAP[level] || '未知'
}

// 获取空间级别颜色
const getSpaceLevelColor = (level: number) => {
  const colors = {
    [SPACE_LEVEL_ENUM.COMMON]: 'blue',
    [SPACE_LEVEL_ENUM.PROFESSIONAL]: 'green',
    [SPACE_LEVEL_ENUM.FLAGSHIP]: 'gold'
  }
  return colors[level] || 'default'
}

// 获取空间角色文本
const getSpaceRoleText = (role: string) => {
  return SPACE_ROLE_MAP[role] || '未知'
}

// 获取空间角色颜色
const getSpaceRoleColor = (role: string) => {
  const colors = {
    admin: 'red',
    editor: 'orange',
    viewer: 'blue'
  }
  return colors[role] || 'default'
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadUserSpaces()
})
</script>

<style scoped>
#spaceListPage {
  /* 移除 padding，让标题紧贴顶部 */
}

.space-actions {
  margin-bottom: 24px;
  text-align: right;
}

.space-content {
  min-height: 400px;
  padding: 0 24px 24px 24px; /* 给内容区域添加内边距 */
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.space-section {
  margin-bottom: 32px;
}

.section-title {
  margin-bottom: 16px;
  color: #262626;
  font-weight: 600;
}

.space-list {
  width: 100%;
}

.space-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 280px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f8ff 100%);
  border: 1px solid #d6e9f8;
}

.space-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
  border-color: #91d5ff;
}

.space-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.title-icon {
  font-size: 18px;
  color: #1890ff;
}

.space-info {
  padding: 8px 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  font-weight: 500;
  margin-right: 8px;
  min-width: 70px;
  color: #666;
}

.enter-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #d9d9d9;
  gap: 6px;
  color: #1890ff;
  font-size: 13px;
}

.hint-text {
  font-weight: 500;
}

.hint-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.space-card:hover .hint-icon {
  transform: translateX(4px);
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

/* 创建空间卡片样式 */
.add-space-card {
  border: 2px dashed #d9d9d9;
  background: #fafafa;
}

.add-space-card:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.add-space-cover {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.add-space-icon {
  font-size: 48px;
  color: #8c8c8c;
}

.add-space-info {
  padding: 8px 0;
  text-align: center;
}

.add-space-text {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.add-space-desc {
  font-size: 12px;
  color: #8c8c8c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .space-content {
    padding: 0 16px 16px 16px; /* 移动端减小内边距 */
  }

  .space-card {
    height: 240px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 4px;
  }

  .label {
    min-width: auto;
    margin-right: 0;
    margin-bottom: 2px;
  }
}
</style>
