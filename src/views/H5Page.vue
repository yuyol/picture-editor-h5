<template>
  <div class="h5-page">
    <div
      style="
        margin-top: 5vh;
        margin-bottom: 5vh;
        margin-left: 5vh;
        margin-right: 5vh;
      "
    >
      <!-- 文件选择 -->
      <el-upload
        class="upload-demo"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        :before-upload="handleBeforeUpload"
        :show-file-list="true"
        :limit="1"
        accept="image/*"
      >
        <el-button type="primary">选择图片</el-button>
      </el-upload>

      <div style="margin-bottom: 2vh">
        <label for="aspect-ratio">选择裁剪比例:</label>
        <el-select
          v-model="selectedAspectRatio"
          placeholder="选择"
          size="small"
          style="width: 240px"
          @change="updateAspectRatio"
          s
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="cropper-container" style="margin-bottom: 2vh">
        <VueCropper
          v-if="image"
          ref="cropper"
          :src="image"
          :view-mode="1"
          :drag-mode="'move'"
          :aspect-ratio="aspectRatio"
          :initialAspectRatio="2560 / 1440"
          :auto-crop-area="1"
          :movable="true"
          :zoomable="true"
          :scalable="true"
          :rotatable="true"
          :crop-box-movable="true"
          :crop-box-resizable="true"
          @cropend="onCropEnd"
        >
        </VueCropper>
      </div>
      <div>
        <div style="margin-bottom: 2vh">
          <el-button plain type="primary" @click="cropImage"
            >裁剪图片</el-button
          >
          <el-button @click="resetCropper">重置裁剪框</el-button>
        </div>

        <div>
          <el-button
            type="success"
            @click="downloadImage"
            :disabled="!croppedImage"
            >下载图片</el-button
          >
        </div>
      </div>
      <div v-if="croppedImage">
        <label>裁剪后的图片：</label>
        <div class="cropper-container">
          <img :src="croppedImage" alt="裁剪后的图片" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";
import { ElMessage, Options } from "element-plus";
import { throttle } from "lodash";

// 裁剪器相关
const aspectRatio = ref<number | string | null>(null); // 默认不限制比例
const image = ref<string | null>(null); // 存储用户上传的图片
const croppedImage = ref<string | null>(null); // 裁剪后的图片
const cropper = ref<any>(null); // 裁剪器实例
const selectedAspectRatio = ref("");

const value = ref("");
const options = [
  {
    value: "null",
    label: "自由裁剪",
  },
  {
    value: "1/1",
    label: "1:1",
  },
  {
    value: "16/9",
    label: "16:9",
  },
  {
    value: "2560/1440",
    label: "2560:1440",
  },
];

// 处理上传的图片
const handleBeforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  const reader = new FileReader();
  // 读取图片后设置到 image
  reader.onload = async (event: ProgressEvent<FileReader>) => {
    if (event.target?.result) {
      image.value = null; // 清空之前的图片
      await nextTick(); // 等待 DOM 更新，强制 VueCropper 刷新
      image.value = event.target.result as string; // 设置新图片
    }
  };
  reader.readAsDataURL(file);
  return false; // 阻止默认上传行为
};

const cropImage = () => {
  if (cropper.value) {
    // 获取裁剪后的图像并转换为 Base64 格式
    croppedImage.value = cropper.value.getCroppedCanvas().toDataURL();
  }
};

// 重置裁剪框
const resetCropper = () => {
  if (cropper.value) {
    cropper.value.reset(); // 重置裁剪器
  }
};

// 实时更新裁剪结果
// const onCropMove = () => {
//   if (cropper.value) {
//     // 获取实时裁剪区域并更新图片
//     croppedImage.value = cropper.value.getCroppedCanvas().toDataURL();
//   }
// };

const onCropEnd = () => {
  if (cropper.value) {
    croppedImage.value = cropper.value.getCroppedCanvas().toDataURL();
  }
};

// 更新裁剪比例
const updateAspectRatio = (value: string) => {
  console.log(value);
  if (value === null) {
    aspectRatio.value = null;
  } else {
    const [w, h] = value.split("/").map(Number);
    aspectRatio.value = w / h;
  }
};

// 下载裁剪后的图片
const downloadImage = () => {
  if (!croppedImage.value) {
    ElMessage.error("没有可以下载的图片！");
    return;
  }

  const link = document.createElement("a");
  link.href = croppedImage.value;
  link.download = "cropped-image.png"; // 文件名
  link.click();
  ElMessage.success("图片已下载！");
};

// 监听 aspectRatio 的变化并更新裁剪器
watch(aspectRatio, (newRatio) => {
  if (cropper.value) {
    cropper.value.setAspectRatio(newRatio); // 强制更新裁剪器的比例
  }
});
</script>

<style scoped>
.h5-page {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  /* height: 100vh; */
  background-color: #f0f0f0;
  color: black;
}
</style>
