<template>
  <div>
    <a-modal v-model:visible="visible" :title="title" :footer="false" @cancel="closeModal">
      <h4>复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <div style="margin-bottom: 16px" />
      <h4>手机扫码查看</h4>
      <a-qrcode :value="link" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';


interface Props {
  title: string;
  link: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "分享图片",
  link: '#'
})

const visible = ref(false)
const openModal = () => {
  visible.value = true;
};

//用户点击x 或者按下esc会调用这个方法
const closeModal = ()=>{
  visible.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

