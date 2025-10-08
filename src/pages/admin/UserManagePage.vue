<template>
  <div id="userManagePage">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <TeamOutlined />
            用户管理
          </a-typography-title>
        </a-typography>
      </a-flex>
    </div>

    <!-- 搜索栏 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear />
      </a-form-item>
      <a-form-item label="昵称">
        <a-input v-model:value="searchParams.userName" placeholder="输入昵称" allow-clear />
      </a-form-item>
      <a-form-item label="邮箱">
        <a-input
          v-model:value="searchParams.userEmail"
          placeholder="请输入邮箱"
          allow-clear
          size="middle"
        />
      </a-form-item>
      <a-form-item label="手机号">
        <a-input
          v-model:value="searchParams.userPhone"
          placeholder="请输入手机号"
          allow-clear
          size="middle"
        />
      </a-form-item>
      <a-form-item>
        <a-space size="middle">
          <a-button type="primary" html-type="submit" :icon="h(SearchOutlined)">搜索</a-button>
          <a-button
            @click="refreshResetData"
            style="color: #1890ff; border-color: #1890ff"
            :icon="h(SyncOutlined)"
            size="middle"
          >
            刷新数据
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />


    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      :scroll="{ x: 'max-content', y: 800 }"
      :loading="userListLoading"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="80" />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <!-- 会员信息 -->
        <template v-if="column.dataIndex === 'vipInfo'">
          <div v-if="record.vipNumber">
            <p>会员编号：{{ record.vipNumber }}</p>
            <p>会员类型：{{ record.vipSign }}</p>
            <p>到期时间：{{ dayjs(record.vipExpireTime).format('YYYY-MM-DD HH:mm:ss') }}</p>
          </div>
          <div v-else>未开通</div>
        </template>
        <!-- 其他信息 -->
        <template v-if="column.dataIndex === 'otherInfo'">
          <div>
            <p>手机号码：{{ record.userPhone }}</p>
            <p>
              出生日期：{{ record.birthday ? dayjs(record.birthday).format('YYYY-MM-DD') : '' }}
            </p>
          </div>
        </template>
<!--        注册时间-->
        <template v-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!-- 是否禁用 -->
        <template v-if="column.dataIndex === 'isDisabled'">
          <a-switch
            :checked="record.isDisabled === 0"
            checked-children="正常"
            un-checked-children="禁用"
            :class="{
                'active-switch': record.isDisabled === 0,
                'disabled-switch': record.isDisabled === 1,
              }"
            @change="(checked) => handleDisabled(record.id, checked)"
          />
        </template>
<!--        操作-->
        <template v-else-if="column.key === 'action'">
          <a-space>
<!--            <a-button type="link" @click="handleResetPassword(record.id)">密码重置</a-button>-->
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { computed,h, onMounted, reactive, ref } from 'vue'
import {
  deleteUserUsingPost,
  disabledUserUsingPost,
  listUserVoByPageUsingPost,
  // resetPasswordUsingPost
} from '@/api/userController.ts'
import dayjs from 'dayjs'
import { ContactsOutlined, SearchOutlined, SyncOutlined ,TeamOutlined} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
const columns = [
  {
    title: '用户ID',
    dataIndex: 'id',
    fixed: 'left',
    align: 'center',
    width: 80,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    align: 'center',
    width: 150,
    customCell: () => ({ style: { minWidth: '150px', maxWidth: '150px' } }),
  },
  {
    title: '邮箱',
    dataIndex: 'userEmail',
    align: 'center',
    width: 180,
    customCell: () => ({ style: { minWidth: '150px', maxWidth: '180px' } }),
  },
  {
    title: '昵称',
    dataIndex: 'userName',
    align: 'center',
    width: 250,
    customCell: () => ({ style: { minWidth: '250px', maxWidth: '250px' } }),
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    align: 'center',
    width: 100,
    customCell: () => ({ style: { minWidth: '100px', maxWidth: '100px' } }),
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    align: 'center',
    width: 100,
    customCell: () => ({ style: { minWidth: '100px', maxWidth: '100px' } }),
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    align: 'center',
    ellipsis: true,
    customCell: () => ({ style: { minWidth: '250px', maxWidth: '250px' } }),
  },
  {
    title: '注册时间',
    dataIndex: 'createTime',
  },
  {
    title: '是否禁用',
    dataIndex: 'isDisabled',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'center',
    minWidth: 80,
    customCell: () => ({ style: { minWidth: '80px' } }),
  },
]


/**
 * 用户列表加载状态
 */
const userListLoading = ref<boolean>(true)
// 定义数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)



/**
 * 初始化用户搜索参数
 */
const INITIAL_USER_SEARCH_PARAMS: API.UserQueryRequest = {
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'ascend',
}

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  ...INITIAL_USER_SEARCH_PARAMS
})

// 获取数据
const fetchData = async () => {
  userListLoading.value = true
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取用户列表失败，' + res.data.message)
  }
  userListLoading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 表格变化之后，重新获取数据
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除用户
const doDelete = async (id: string) => {
  if (!id) {
    return
  }
  Modal.confirm({
    title: '删除用户',
    content: '确定要删除该用户吗？删除后不可恢复！',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deleteUserUsingPost({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 刷新数据
          fetchData()
        } else {
          message.error('删除失败')
        }
      }catch (e){
        message.error('删除失败！')
      }finally {
        fetchData()
      }
    },
    onCancel: () => {
      message.info('取消删除！')
    },
  })

}

/**
 * 清理用户搜索条件
 */
const clearUserParams = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
}

/**
 * 重置用户搜索条件
 */
const resetUserSearchParams = () => {
  clearUserParams()
  Object.assign(searchParams, INITIAL_USER_SEARCH_PARAMS)
}
/**
 * 刷新重置数据
 */
const refreshResetData = () => {
  resetUserSearchParams()
  fetchData()
  message.success('刷新成功')
}

/**
 * 处理用户禁用
 */
const handleDisabled = async (userId: string, checked: boolean) => {
  if (!userId) {
    return
  }
  // 确认弹窗
  Modal.confirm({
    title: `${checked ? '启用' : '禁用'}用户`,
    content: `确定要${checked ? '启用' : '禁用'}该用户吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await disabledUserUsingPost({ id: userId, isDisabled: checked ? 0 : 1 })
        if (res.data.code === 0) {
          message.success(`${checked ? '启用' : '禁用'}成功！`)
        } else {
          message.error(`${checked ? '启用' : '禁用'}失败！`)
          // 回滚状态
          record.isDisabled = checked ? 1 : 0
        }
      } catch (e) {
        message.error(`${checked ? '启用' : '禁用'}失败！`)
      } finally {
        await fetchData()
      }
    },
    onCancel: () => {
      message.info(`取消${checked ? '启用' : '禁用'}该用户！`)
    },
  })
}

/**
 * 处理密码重置
 * @param userId
 */
const handleResetPassword = async (id: string) => {
  if (!id) {
    return
  }
  // 确认弹窗
  Modal.confirm({
    title: '确认重置密码',
    content: '确定要重置该用户的密码吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await resetPasswordUsingPost({ id })
        if (res.data.code === 0) {
          message.success('重置成功！')
          resetPasswordSuccess(res.data.data) // 处理重置成功后的逻辑
        } else {
          message.error('重置失败！')
        }
      } catch (e) {
        message.error('重置失败！')
      } finally {
      }
    },
    onCancel: () => {
      // 用户点击取消
      message.info('取消重置密码！')
    },
  })
}

/**
 * 重置密码成功弹窗
 * @param password
 */
const resetPasswordSuccess = (password) => {
  Modal.success({
    title: '密码重置成功!',
    content: h('div', {}, [
      h(
        'p',
        {
          style: {
            paddingTop: '20px',
            fontSize: '16px',
            fontWeight: 'bold',
          },
        },
        password,
      ),
    ]),
    bodyStyle: {},
  })
}

</script>
<style scoped>
/* 表单中输入框左边文字和右边输入框在同一水平线处理 */
.custom-form :deep(.ant-form-item-label > label) {
  height: 40px; /* 与输入框高度一致 */
  line-height: 40px; /* 垂直居中 */
  display: flex;
  align-items: center; /* 垂直对齐 */
}
/* 添加自定义开关样式 */
.active-switch {
  background-color: green;
}

.disabled-switch {
  background-color: red;
}
</style>
