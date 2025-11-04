<!--以瀑布流的形式展示-->
<template>
  <div id="homePage">
    <!-- 吸顶搜索容器 -->
    <div :class="['sticky-header', { sticky: isSticky }]">
      <div class="search-bar">
        <a-input-search
          v-model:value="searchParams.searchText"
          placeholder="从本站中搜索"
          enter-button="搜索"
          size="large"
          @search="doSearch"
          allow-clear
        />
      </div>
    </div>

    <!--    分类和标签筛选-->
    <div class="category-tabs-wrapper">
      <a-tabs
        v-model:active-key="selectedCategory"
        @change="doSearch"
        :tabBarStyle="{ marginBottom: 0 }"
      >
        <a-tab-pane tab="全部" key="all"></a-tab-pane>
        <a-tab-pane :tab="category.name" :key="category.id" v-for="category in categoryList"></a-tab-pane>
      </a-tabs>
    </div>

    <div v-if="homeLoading" class="loading-spinner">
      <a-spin size="large" tip="加载中..." />
    </div>
    <div v-else>
      <!--    图片列表-->
      <PictureList :dataList="dataList" :loading="homeLoading"/>

      <div class="loadingInfo">
        <a-spin v-if="homeLoading" size="large" />
        <div v-if="showBottomLine">
          <a-divider v-if="dataList.length > 0" style="color: #666666">
            🐮🐮🐮 这是我的底线~
          </a-divider>
          <a-empty description="暂无数据" v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </div>
      </div>
    </div>


  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, onActivated, reactive, ref} from "vue";
import { listPictureVoByPageUsingPost} from "@/api/pictureController";
import { getCategoryListAsHomeUsingGet } from '@/api/categoryController.ts'
import { Empty, message } from 'ant-design-vue'
import {useRouter} from "vue-router";
import PictureList from '@/components/PictuerList.vue'

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const categoryList = ref<API.CategoryVO[]>([])
const selectedCategory = ref<string>('all')

//加载中..
const homeLoading = ref(true)
const loadingFinish = ref(false)
const loadingLock = ref(false)
// 新增吸顶状态
const isSticky = ref(false)
/**
 * 控制底线显示
 */
const showBottomLine = ref(false)

// 滚动监听
const checkSticky = () => {
  isSticky.value = window.scrollY > 100
}

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const getHomePictureList = async () => {
  if (loadingFinish.value || loadingLock.value) return // 如果已经加载完毕，直接返回
  loadingLock.value = true
  //转换搜索参数
  const params = {
    ...searchParams,
  }
  //
  if(selectedCategory.value !== 'all'){
    params.categoryId = selectedCategory.value
  }else {
    params.categoryId = undefined
  }

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    const resp = res.data.data.records ?? []
    dataList.value = [...dataList.value,...resp]

    // 判断还有没有更多数据
    if (resp.length < searchParams.pageSize){
      loadingFinish.value = true // 没有更多数据了
      window.removeEventListener('scroll', handleScroll) // 移除滚动监听
      // 延迟 1 秒后显示底线
      setTimeout(() => {
        showBottomLine.value = true
      }, 1000)
    }else {
      // 检查页面高度是否小于屏幕高度
      checkPageHeight()
    }
  } else {
    message.error(res.data.message)
  }
  homeLoading.value = false
  loadingLock.value = false
}

/**
 * 初始化页面
 */
onMounted(() => {
  window.addEventListener('scroll', checkSticky)
  getCategoryOptions()
  // 延迟执行初始图片加载，确保DOM已准备好
  setTimeout(() => {
    getHomePictureList()
  }, 100)
  window.addEventListener('scroll', handleScrollDebounced)
})

const doSearch = ()=>{
  homeLoading.value = true
  searchParams.current = 1
  if (selectedCategory.value !== 'all') {
    searchParams.categoryId = selectedCategory.value
  } else {
    searchParams.categoryId = undefined
  }
  loadingFinish.value = false
  showBottomLine.value = false
  dataList.value = []
  getHomePictureList()
}


const getCategoryOptions  = async () =>{
  const res=  await getCategoryListAsHomeUsingGet()
  //操作成功
  if(res.data.code === 0 && res.data.data){
    categoryList.value = (res.data.data?? [])
  }else{
    message.error('获取标签分页列表失败'+res.data.message)
  }
}

/**
 * 检查页面高度是否小于屏幕高度
 */
const checkPageHeight = () => {
  // 延迟检查，确保DOM更新完成
  setTimeout(() => {
    const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    const clientHeight =
      window.innerHeight ||
      Math.min(document.documentElement.clientHeight, document.body.clientHeight)

    if (scrollHeight <= clientHeight && !loadingFinish.value) {
      searchParams.current++
      getHomePictureList()
    }
  }, 300)
}

/**
 * 滚动加载
 */
const handleScroll = () => {
  if (loadingFinish.value || homeLoading.value) return
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const scrollTop =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  const clientHeight =
    window.innerHeight ||
    Math.min(document.documentElement.clientHeight, document.body.clientHeight)

  // 增加更严格的判断条件
  if (scrollHeight - (clientHeight + scrollTop) < 500) {
    searchParams.current++
    getHomePictureList()
  }
}

/**
 * 防抖函数
 */
const debounce = (fn, delay) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 在setup外部定义防抖函数
const handleScrollDebounced = debounce(handleScroll, 200)
</script>

<style scoped>
/* 吸顶容器 */
.sticky-header {
  background: white;
  transition: all 0.3s ease;
  padding: 0 20px;
}

/* 吸顶状态 */
.sticky-header.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px 20px; /* 固定后减小内边距 */
  background: rgba(255, 255, 255, 0.98); /* 轻微透明 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 - 提升质感 */
  -webkit-backdrop-filter: blur(10px); /* Safari 支持 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05); /* 细边框增强层次 */
  /* 细微缩放动画 */
  transform: translateY(0);
  animation: stickySlideIn 0.3s ease-out;
}
#homePage{
  margin-bottom: 16px;
}

#homePage .search-bar{
  max-width: 640px;
  margin: 0 auto 16px;
}

#homePage .tag-bar{
  margin-bottom: 16px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
/* 调整后的搜索框 */
.logo-search {
  flex: 1;
  max-width: 700px;
}

/* 分类标签容器 */
.category-tabs-wrapper {
  position: relative;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 12px 20px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 标签栏横向滚动 */
.category-tabs-wrapper :deep(.ant-tabs-nav) {
  margin-bottom: 0 !important;
  max-width: 600px; /* 限制宽度，大约能显示5个标签 */
  margin-left: auto;
  margin-right: auto;
}

.category-tabs-wrapper :deep(.ant-tabs-nav-wrap) {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 0;
  /* 隐藏滚动条，但保留滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

/* Webkit浏览器隐藏滚动条 */
.category-tabs-wrapper :deep(.ant-tabs-nav-wrap::-webkit-scrollbar) {
  display: none;
}

/* 隐藏默认的下划线 */
.category-tabs-wrapper :deep(.ant-tabs-ink-bar) {
  display: none;
}

/* 标签项样式 - 胶囊形状，更小更紧凑 */
.category-tabs-wrapper :deep(.ant-tabs-tab) {
  padding: 6px 16px;
  margin: 0 4px;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1.5px solid transparent;
  font-weight: 400;
  font-size: 14px;
  color: #5a6c7d;
  backdrop-filter: blur(10px);
}

.category-tabs-wrapper :deep(.ant-tabs-tab:hover) {
  background: rgba(255, 255, 255, 0.85);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #1890ff;
}

/* 选中的标签 - 简洁白色背景 */
.category-tabs-wrapper :deep(.ant-tabs-tab-active) {
  background: white;
  color: #1890ff !important;
  border-color: #1890ff;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(24, 144, 255, 0.2);
}

.category-tabs-wrapper :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1890ff !important;
}

/* 边缘渐变遮罩效果 - 更柔和 */
.category-tabs-wrapper::before,
.category-tabs-wrapper::after {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  width: 50px;
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.3s;
}

.category-tabs-wrapper::before {
  left: 0;
  background: linear-gradient(to right, #f5f7fa, transparent);
}

.category-tabs-wrapper::after {
  right: 0;
  background: linear-gradient(to left, #c3cfe2, transparent);
}

/* 平滑滚动 */
.category-tabs-wrapper :deep(.ant-tabs-nav-wrap) {
  scroll-behavior: smooth;
}

/* 添加微妙的动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-tabs-wrapper {
  animation: fadeInUp 0.5s ease-out;
}

</style>

