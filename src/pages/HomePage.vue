<template>
  <div id="homePage">
    <a-list :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6 }" :data-source="dataList" :pagination="pagination" :loading="loading">
<!--      作用域插槽，item是每一张图片，这里item:picture的语法是把item改名成picture，更容易阅读-->
      <template #renderItem="{ item :picture}">
        <a-list-item>
          <a-card hoverable >
            <template #cover>
              <img :alt="picture.name" :src="picture.url" style="height: 180px;object-fit: cover"/>
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{picture.category??'默认'}}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{tag}}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import { listPictureVoByPageUsingPost} from "@/api/pictureController";
import {message} from "ant-design-vue";

// 定义数据
const dataList = ref<API.Picture[]>([])
const total = ref(0)
const loading = ref(true)
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
  const res = await listPictureVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
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
    onChange:(page:number,pageSize:number)=>{
      searchParams.current = page;
      searchParams.pageSize= pageSize
      fetchData()
    }
  }
})
</script>

<style scoped>
#homePage{

}
</style>

