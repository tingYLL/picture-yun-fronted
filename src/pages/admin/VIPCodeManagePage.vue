<template>
  <div id="vipCodeManagePage">
    <!-- 标题区域 -->
    <div class="custom-div title-region">
      <a-flex justify="space-between">
        <!-- 顶部标题 -->
        <a-typography>
          <a-typography-title :level="3">
            <GiftOutlined />
            VIP兑换码管理
          </a-typography-title>
        </a-typography>
      </a-flex>
    </div>

    <!-- 生成兑换码区域 -->
    <a-card title="生成兑换码" style="margin-bottom: 16px">
      <a-form layout="inline" :model="generateForm" @finish="handleGenerateCode">
        <a-form-item label="VIP类型" name="type" :rules="[{ required: true, message: '请选择VIP类型' }]">
          <a-select v-model:value="generateForm.type" placeholder="请选择VIP类型" style="width: 150px">
            <a-select-option value="MONTHLY">包月VIP</a-select-option>
            <a-select-option value="QUARTERLY">包季VIP</a-select-option>
            <a-select-option value="YEARLY">包年VIP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="生成数量" name="count" :rules="[{ required: true, message: '请输入生成数量' }]">
          <a-input-number
            v-model:value="generateForm.count"
            placeholder="请输入生成数量"
            :min="1"
            :max="100"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="generating">
              <PlusOutlined />
              生成兑换码
            </a-button>
            <a-button @click="resetGenerateForm">
              <RedoOutlined />
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作区域 -->
    <div style="margin-bottom: 16px">
      <a-space>
        <a-button type="primary" @click="fetchData" :icon="h(SyncOutlined)">
          刷新数据
        </a-button>
        <a-button @click="exportCodes" :icon="h(DownloadOutlined)">
          导出兑换码
        </a-button>
      </a-space>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
      :scroll="{ x: 'max-content', y: 600 }"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'code'">
          <a-typography-text code>{{ record.code }}</a-typography-text>
        </template>
        <template v-else-if="column.dataIndex === 'isUsed'">
          <a-tag :color="record.isUsed ? 'red' : 'green'">
            {{ record.isUsed ? '已使用' : '未使用' }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'createdAt'">
          {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'usedAt'">
          {{ record.usedAt ? dayjs(record.usedAt).format('YYYY-MM-DD HH:mm:ss') : '-' }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button
              v-if="!record.isUsed"
              type="link"
              danger
              size="small"
              @click="doDelete(record)"
            >
              删除
            </a-button>
            <a-typography-text v-else type="secondary" disabled>
              已使用不可删除
            </a-typography-text>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  GiftOutlined,
  PlusOutlined,
  RedoOutlined,
  SyncOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import {
  deleteUsingDelete,
  generateCodeUsingPost,
  listAllUsingGet
} from '@/api/vipRedemptionCodeController.ts'

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
    align: 'center'
  },
  {
    title: '兑换码',
    dataIndex: 'code',
    width: 200,
    align: 'center'
  },
  {
    title: '使用状态',
    dataIndex: 'isUsed',
    width: 120,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    align: 'center'
  },
  {
    title: '使用时间',
    dataIndex: 'usedAt',
    width: 180,
    align: 'center'
  },
  {
    title: '使用用户ID',
    dataIndex: 'userId',
    width: 120,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
    align: 'center'
  }
]

// 数据状态
const dataList = ref<API.VIPRedemptionCode[]>([])
const loading = ref<boolean>(false)
const generating = ref<boolean>(false)

// 生成表单
const generateForm = reactive({
  type: 'MONTHLY',
  count: 1
})

// 重置生成表单
const resetGenerateForm = () => {
  generateForm.type = 'MONTHLY'
  generateForm.count = 1
}

// 获取兑换码列表
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listAllUsingGet()
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data
    } else {
      message.error('获取兑换码列表失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('获取兑换码列表失败')
    console.error('获取兑换码列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成兑换码
const handleGenerateCode = async () => {
  generating.value = true
  try {
    const res = await generateCodeUsingPost({
      type: generateForm.type,
      count: generateForm.count
    })

    if (res.data.code === 0 && res.data.data) {
      message.success(`成功生成 ${generateForm.count} 个${getVipTypeName(generateForm.type)}兑换码`)
      // 刷新列表
      await fetchData()
      // 重置表单
      resetGenerateForm()

      // 显示生成的兑换码
      if (res.data.data.codes) {
        showGeneratedCodes(res.data.data.codes)
      }
    } else {
      message.error('生成兑换码失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('生成兑换码失败')
    console.error('生成兑换码失败:', error)
  } finally {
    generating.value = false
  }
}

// 获取VIP类型名称
const getVipTypeName = (type: string) => {
  const typeMap = {
    'MONTHLY': '包月',
    'QUARTERLY': '包季',
    'YEARLY': '包年'
  }
  return typeMap[type] || type
}

// 显示生成的兑换码
const showGeneratedCodes = (codes: string[]) => {
  Modal.info({
    title: '兑换码生成成功',
    width: 600,
    content: h('div', {}, [
      h('p', { style: { marginBottom: '16px' } }, `成功生成 ${codes.length} 个兑换码：`),
      h('div', {
        style: {
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #d9d9d9',
          padding: '8px',
          borderRadius: '4px',
          backgroundColor: '#fafafa'
        }
      }, codes.map(code =>
        h('div', {
          key: code,
          style: {
            padding: '4px 0',
            fontFamily: 'monospace',
            fontSize: '14px'
          }
        }, code)
      ))
    ]),
    okText: '确定'
  })
}

// 删除兑换码
const doDelete = (record: API.VIPRedemptionCode) => {
  if (!record.id) {
    return
  }

  Modal.confirm({
    title: '删除兑换码',
    content: `确定要删除兑换码 ${record.code} 吗？删除后不可恢复！`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await deleteUsingDelete({ id: record.id })
        if (res.data.code === 0) {
          message.success('删除成功')
          await fetchData()
        } else {
          message.error('删除失败：' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        message.error('删除失败')
        console.error('删除兑换码失败:', error)
      }
    }
  })
}

// 导出兑换码
const exportCodes = () => {
  const unusedCodes = dataList.value.filter(code => !code.isUsed)
  if (unusedCodes.length === 0) {
    message.warning('没有可导出的未使用兑换码')
    return
  }

  const csvContent = generateCSV(unusedCodes)
  downloadCSV(csvContent, 'vip_redemption_codes.csv')
  message.success(`导出成功，共 ${unusedCodes.length} 个未使用兑换码`)
}

// 生成CSV内容
const generateCSV = (codes: API.VIPRedemptionCode[]) => {
  const headers = ['ID', '兑换码', 'VIP类型', '创建时间', '使用状态']
  const rows = codes.map(code => [
    code.id,
    code.code,
    'VIP', // 这里可以根据需要显示具体的VIP类型
    code.createdAt,
    code.isUsed ? '已使用' : '未使用'
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

// 下载CSV文件
const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 分页配置
const pagination = computed(() => {
  return {
    current: 1,
    pageSize: dataList.value.length,
    total: dataList.value.length,
    showSizeChanger: false,
    showTotal: (total) => `共 ${total} 条`
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  // 当前不需要分页处理，因为获取的是全部数据
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#vipCodeManagePage {
  padding: 0;
}

.custom-div.title-region {
  margin-bottom: 16px;
}

/* 表单样式 */
.ant-form-item {
  margin-bottom: 16px;
}

/* 表格操作列样式 */
.ant-btn-link {
  padding: 0;
  height: auto;
}
</style>