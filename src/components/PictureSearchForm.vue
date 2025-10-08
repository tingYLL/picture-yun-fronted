<template>
  <div class="picture-search-form">
<!--{{searchParams}}-->
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch"  name="searchForm">
      <a-form-item label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称、简介、标签中搜索" allow-clear />
      </a-form-item>
      <a-form-item label="分类" name="categoryId">
        <a-select v-model:value="searchParams.categoryId" placeholder="请选择分类"
                  allow-clear :options="categoryOptions" style="min-width: 180px"
                  size="middle"/>
      </a-form-item>
      <a-form-item label="日期" name="dataRange">
        <a-range-picker
          style="width: 400px"
          show-time
          v-model:value="dateRange"
          :placeholder="['编辑开始时间', '编辑结束时间']"
          format="YYYY/MM/DD HH:mm:ss"
          :presets="rangePresets"
          @change="onRangeChange"
        />
      </a-form-item>
      <a-form-item label="格式" name="picFormat">
        <a-select
          v-model:value="searchParams.picFormat"
          :options="PIC_FORMAT_STATUS_OPTIONS"
          placeholder="请选择图片格式"
          style="min-width: 180px"
          allow-clear
          size="middle"
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" style="width: 96px">搜索</a-button>
<!--          <a-button html-type="reset" @click="doClear">重置</a-button>-->
          <a-button
            @click="doClear"
            style="color: #1890ff; border-color: #1890ff"
            :icon="h(SyncOutlined)"
            size="middle"
          >
            刷新
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>

  </div>
</template>
<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'

import {
  PIC_FORMAT_STATUS_OPTIONS,
  PIC_REVIEW_STATUS_OPTIONS
} from '../constants/picture.ts'

import {getCategoryListAsHomeUsingGet} from "@/api/categoryController.ts"
import {message} from "ant-design-vue";
import { SyncOutlined } from '@ant-design/icons-vue'
const categoryOptions = ref<API.CategoryVO[]>([])
const tagOptions = ref<string[]>([])
interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
}

const props = defineProps<Props>()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({})

// 搜索数据
const doSearch = () => {
  props.onSearch?.(searchParams)
}

const dateRange = ref<[]>([])
/**
 * 日期范围更改时触发
 * @param dates
 * @param dateStrings
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    searchParams.startEditTime = dates[0].toDate()
    searchParams.endEditTime = dates[1].toDate()
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 时间范围预设
const rangePresets = ref([
  { label: '过去 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: '过去 14 天', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: '过去 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: '过去 90 天', value: [dayjs().add(-90, 'd'), dayjs()] },
])

const getCategoryOptions  = async () =>{
  const res=  await getCategoryListAsHomeUsingGet()
  if(res.data.code === 0 && res.data.data){
    categoryOptions.value = (res.data.data ?? []).map((data: API.CategoryVO) => {
      return {
        value: data.id,
        label: data.name,
      }
    })
  }else{
    message.error('获取标签分页列表失败'+res.data.message)
  }
}
// 清理
const doClear = () => {
  // 取消所有对象的值
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  // 日期筛选项单独清空，必须定义为空数组
  dateRange.value = []
  // 清空后重新搜索
  props.onSearch?.(searchParams)
}


onMounted(()=>{
  getCategoryOptions()
})
</script>
<style scoped>
.picture-search-form .ant-form-item {
  margin-top: 16px;
}
</style>
