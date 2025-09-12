<!--以分页的形式展示-->
<template>
  <div id="homePage">
    <!--    搜索框-->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从本站中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!--    分类和标签筛选-->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane tab="全部" key="all"></a-tab-pane>
      <a-tab-pane :tab="category" :key="category" v-for="category in categoryList"></a-tab-pane>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签: </span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
<!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading"/>
<!--    分页-->
    <a-pagination
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
      style="text-align: right"
    />
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {listPictureTagCategoryUsingGet, listPictureVoByPageUsingPost} from "@/api/pictureController";
import {message} from "ant-design-vue";
import {useRouter} from "vue-router";
import PictureList from '@/components/PictuerList.vue'

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const selectedTagList = ref<boolean []>([])
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  //转换搜索参数
  const params = {
    ...searchParams,
    tags:[] as string[]
  }
  //如果选择“全部”，相当于不加额外的搜索条件
  if(selectedCategory.value !== 'all'){
    params.category = selectedCategory.value
  }
  //遍历标签数组，将被选中的标签放入查询参数中
  selectedTagList.value.forEach((useTag,index)=>{
    if(useTag){
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    // message.error('获取数据失败，' + res.data.message)
    message.error(res.data.message)
  }
  loading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

//当页面改变的时候会调用这个函数，来更改当前的页号和页面大小
const onPageChange = (page:number,pageSize:number)=>{
  searchParams.current = page;
  searchParams.pageSize= pageSize
  fetchData()
}

const doSearch = ()=>{
  searchParams.current = 1
  fetchData()
}


const getTagCategoryOptions  = async () =>{
  const res=  await listPictureTagCategoryUsingGet()
  //操作成功
  if(res.data.code === 0 && res.data.data){
    tagList.value = (res.data.data.tagList ?? [])

    categoryList.value = (res.data.data.categoryList?? [])
  }else{
    message.error('获取标签分页列表失败'+res.data.message)
  }
}

onMounted(()=>{
  getTagCategoryOptions()
})

const router = useRouter()

</script>

<style scoped>
#homePage{
margin-bottom: 16px;
}

#homePage .search-bar{
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar{
  margin-bottom: 16px;
}
</style>

