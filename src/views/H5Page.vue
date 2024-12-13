<template>
    <div class="h5-page">
        <div style="margin: 10vh;">
            <!-- 文件选择 -->
            <input type="file" @change="onFileChange" />
            <div>
            <label for="aspect-ratio">选择裁剪比例:</label>
            <select id="aspect-ratio" v-model="aspectRatio" @change="updateAspectRatio">
                <option value="null">自由裁剪</option>
                <option value="1">1:1</option>
                <option value="16/9">16:9</option>
                <option value="1560/1440">1560x1440</option>
            </select>
            </div>
            <div class="cropper-container">
                <VueCropper
                v-if="image"
                ref="cropper"
                :src="image"
                :view-mode="1"
                :drag-mode="'crop'"
                :aspect-ratio="aspectRatio"
                :auto-crop-area="1"
                :movable="true"
                :zoomable="true"
                :scalable="true"
                :rotatable="true"
                :crop-box-movable="true"
                :crop-box-resizable="true"
                @cropmove="onCropMove">
                </VueCropper>
                    
            </div>
            <div>
                <button @click="cropImage">裁剪图片</button>
                <button @click="resetCropper">重置裁剪框</button>
            </div>
            <div v-if="croppedImage">
                <h3>裁剪后的图片：</h3>
                <div class="cropper-container">
                    <img :src="croppedImage" alt="裁剪后的图片" />
                </div>
            </div>
        </div>
    
    </div>
  </template>
  
<script setup lang="ts">
import { ref, watch} from 'vue';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

// 设置裁剪器的比例
const aspectRatio = ref<number | string | null>(null); // 默认不限制比例

// 存储图片路径
const image = ref<string | null>(null);
const croppedImage = ref<string | null>(null);

// 获取裁剪后的图片
const cropper = ref<any>(null);

const cropImage = () => {
  if (cropper.value) {
    // 获取裁剪后的图像并转换为 Base64 格式
    croppedImage.value = cropper.value.getCroppedCanvas().toDataURL();
  }
};

// 处理文件选择
const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    image.value = URL.createObjectURL(file);
  }
};

// 重置裁剪框
const resetCropper = () => {
  if (cropper.value) {
    cropper.value.reset(); // 重置裁剪器
  }
};

// 实时更新裁剪结果
const onCropMove = () => {
  if (cropper.value) {
    // 获取实时裁剪区域并更新图片
    croppedImage.value = cropper.value.getCroppedCanvas().toDataURL();
  }
};

// 更新裁剪比例
const updateAspectRatio = () => {
    console.log("更改比例")
  switch (aspectRatio.value) {
    case '1':
      aspectRatio.value = 1; // 1:1 比例
      break;
    case '16/9':
      aspectRatio.value = 16 / 9; // 16:9 比例
      break;
    case '1560/1440':
      aspectRatio.value = 1560 / 1440; // 1560x1440 比例
      break;
    default:
      aspectRatio.value = null; // 自由裁剪
      break;
  }
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
height: 100vh;
background-color: #f0f0f0;
color: black;
}
</style>
  