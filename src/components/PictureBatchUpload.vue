<template>
  <div class="picture-batch-upload">
    <!-- 上传区域 -->
    <a-upload
      v-if="pictureList.length === 0"
      list-type="picture-card"
      :multiple="true"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
      :file-list="fileList"
      @change="handleChange"
    >
      <div>
        <loading-outlined v-if="uploading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传多张图片</div>
        <div class="ant-upload-hint">支持批量选择，jpg/png/webp格式</div>
      </div>
    </a-upload>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <a-progress :percent="uploadProgress" status="active" />
      <p>正在上传 {{ uploadedCount }}/{{ totalCount }} 张图片...</p>
    </div>

    <!-- 已上传图片预览网格 -->
    <div v-if="pictureList.length > 0 && !uploading" class="picture-grid">
      <div class="grid-header">
        <h3>已上传 {{ pictureList.length }} 张图片</h3>
        <a-button @click="clearAll" danger size="small">清空所有</a-button>
      </div>
      <div class="grid-container">
        <div v-for="(pic, index) in pictureList" :key="pic.id" class="picture-item">
          <div class="picture-wrapper">
            <img :src="pic.thumbnailUrl || pic.url" :alt="pic.name" />
            <div class="picture-overlay">
              <a-button
                type="primary"
                danger
                size="small"
                :icon="h(DeleteOutlined)"
                @click="removePicture(index)"
              >
                删除
              </a-button>
            </div>
          </div>
          <div class="picture-name">{{ pic.name }}</div>
        </div>
      </div>
<!--      <a-button-->
<!--        type="dashed"-->
<!--        block-->
<!--        :icon="h(PlusOutlined)"-->
<!--        @click="continueUpload"-->
<!--        style="margin-top: 16px"-->
<!--      >-->
<!--        继续添加图片-->
<!--      </a-button>-->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, computed } from 'vue';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';
import { uploadMultiplePicturesUsingPost } from '@/api/pictureController';
import { useLoginUserStore } from '@/stores/useLoginUserStore';

interface Props {
  spaceId?: number;
  onSuccess?: (pictureList: API.PictureVO[]) => void;
}

const props = defineProps<Props>();
const loginUserStore = useLoginUserStore();

// 状态管理
const pictureList = ref<API.PictureVO[]>([]);
const fileList = ref<any[]>([]);
const uploading = ref<boolean>(false);
const uploadProgress = ref<number>(0);
const uploadedCount = ref<number>(0);
const totalCount = ref<number>(0);
const isUploading = ref<boolean>(false); // 防止重复上传的标志位

/**
 * 上传前的校验
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const loginUser = loginUserStore.loginUser;

  // 通过 MIME 类型和文件扩展名双重校验
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const isValidImage = hasValidType || hasValidExtension;

  if (!isValidImage) {
    message.error(`${file.name} 不是 jpg、webp 或 png 格式`);
    return false;
  }

  const maxSize = loginUser.userRole === 'admin' ? 5 : 2;
  const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
  if (!isLtMaxSize) {
    message.error(`${file.name} 超过 ${maxSize}MB 限制`);
    return false;
  }

  return true;
};

/**
 * 文件列表变化处理
 */
const handleChange = (info: any) => {
  fileList.value = info.fileList;
};

/**
 * 批量上传处理
 */
const handleUpload = async (options: any) => {
  const { file, onSuccess: uploadSuccess, onError } = options;

  // 防止并发重复上传
  if (isUploading.value) {
    uploadSuccess(); // 直接标记为成功，避免上传组件报错
    return;
  }

  // 设置上传标志
  isUploading.value = true;
  uploading.value = true;

  try {
    // 收集所有待上传的文件
    const filesToUpload = fileList.value
      .filter((f) => f.originFileObj)
      .map((f) => f.originFileObj);

    if (filesToUpload.length === 0) {
      return;
    }

    totalCount.value = filesToUpload.length;
    uploadProgress.value = 0;

    // 构建 FormData
    const formData = new FormData();

    // 添加所有文件
    filesToUpload.forEach((file) => {
      formData.append('files', file);
    });

    // 添加 spaceId 参数
    if (props.spaceId) {
      formData.append('spaceId', props.spaceId.toString());
    }

    // 使用 FormData 直接调用接口，覆盖默认的请求配置
    // 不传递 params，所有参数都在 formData 中
    const res = await uploadMultiplePicturesUsingPost(
      {},  // 空的 params，避免重复传递 spaceId
      { files: filesToUpload },
      {
        data: formData,
        requestType: 'form',
      }
    );

    if (res.data.code === 0 && res.data.data) {
      pictureList.value = res.data.data;
      uploadedCount.value = filesToUpload.length;
      uploadProgress.value = 100;
      message.success(`成功上传 ${filesToUpload.length} 张图片`);

      // 通知父组件
      props.onSuccess?.(res.data.data);

      // 清空文件列表
      fileList.value = [];
    } else {
      message.error('批量上传失败：' + res.data.message);
    }

    uploadSuccess();
  } catch (e: any) {
    console.error('批量上传失败', e);
    message.error('批量上传失败：' + e.message);
    onError(e);
  } finally {
    uploading.value = false;
    uploadedCount.value = 0;
    totalCount.value = 0;
    isUploading.value = false; // 重置上传标志
  }
};

/**
 * 删除单张图片
 */
const removePicture = (index: number) => {
  pictureList.value.splice(index, 1);
  message.success('已删除');

  // 更新父组件
  props.onSuccess?.(pictureList.value);
};

/**
 * 清空所有图片
 */
const clearAll = () => {
  pictureList.value = [];
  fileList.value = [];
  message.success('已清空所有图片');

  // 通知父组件
  props.onSuccess?.([]);
};

/**
 * 继续添加图片
 */
const continueUpload = () => {
  // 通过清空已上传列表来显示上传区域
  // 但保留已有的图片数据
  const existingPictures = [...pictureList.value];
  pictureList.value = [];

  // 等待用户上传新图片后，合并到现有列表
  const originalOnSuccess = props.onSuccess;
  props.onSuccess = (newPictures: API.PictureVO[]) => {
    pictureList.value = [...existingPictures, ...newPictures];
    originalOnSuccess?.(pictureList.value);
  };
};

// 暴露方法给父组件
defineExpose({
  pictureList,
  clearAll,
});
</script>

<style scoped>
.picture-batch-upload {
  width: 100%;
}

.picture-batch-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 180px;
  min-width: 100%;
}

.picture-batch-upload :deep(.ant-upload-list-picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ant-upload-text {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.ant-upload-hint {
  margin-top: 4px;
  color: #999;
  font-size: 12px;
}

.upload-progress {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}

.upload-progress p {
  margin-top: 8px;
  color: #666;
}

.picture-grid {
  margin-top: 16px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.grid-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.picture-item {
  position: relative;
}

.picture-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.picture-wrapper:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.picture-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.picture-wrapper:hover .picture-overlay {
  opacity: 1;
}

.picture-name {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
