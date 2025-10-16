<template>
  <div id="addSpacePage">
<!--    <h2 style="margin-bottom: 16px">-->
<!--      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}-->
<!--    </h2>-->
    <!-- 空间信息表单 -->
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item name="spaceType" label="空间类型">
        <a-select
          v-model:value="spaceType"
          style="min-width: 180px"
          placeholder="请选择空间类型"
          :options="SPACE_TYPE_OPTIONS"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">提交</a-button>
      </a-form-item>
    </a-form>
    <!-- 空间类型介绍 -->
    <a-card title="空间类型介绍">
<!--      <a-typography-paragraph>-->
<!--        * 默认专业版，如需升级空间级别，请联系-->
<!--        <a href="#" target="_blank">站长</a>-->
<!--      </a-typography-paragraph>-->
      <a-typography-paragraph v-for="spaceType in SPACE_TYPE_OPTIONS" :key="spaceType.value">
        {{ spaceType.label }}：{{ spaceType.value === SPACE_TYPE_ENUM.PRIVATE ? '个人专属空间，仅自己可见' : '团队协作空间，可邀请其他用户加入' }}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {message} from "ant-design-vue";
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  updateSpaceUsingPost
} from "@/api/spaceController";
import {useRoute, useRouter} from "vue-router";
import {
  SPACE_LEVEL_ENUM,
  SPACE_TYPE_ENUM,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constants/space'
import SpaceEditRequest = API.SpaceEditRequest;

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.SpaceAddRequest | SpaceEditRequest>({})
const loading = ref(false)

// 空间类型选择，默认为私有空间
const spaceType = ref<number>(SPACE_TYPE_ENUM.PRIVATE)

const router = useRouter()
const route = useRoute()

// 提交表单
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res;

  // 更新或创建
  if(spaceId){
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
      spaceType: spaceType.value
    })
  } else {
    // 创建空间，默认专业版
    res = await addSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value,
      spaceLevel: SPACE_LEVEL_ENUM.PROFESSIONAL
    })
  }

  if(res.data.code === 0 && res.data.data){
    message.success('操作成功')
    router.push({
      path: `/space/${res.data.data}`
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

// 获取旧数据（编辑模式）
const getOldSpace = async () => {
  const id = route.query?.id
  if(id){
    const res = await getSpaceVoByIdUsingGet({
      id
    })
    if(res.data.code === 0 && res.data.data){
      const data = res.data.data
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceType.value = data.spaceType
    }
  }
}

onMounted(() => {
  getOldSpace()
})
</script>

<style scoped>
#addSpacePage{
max-width: 720px;
  margin: 0 auto ;
}
</style>
