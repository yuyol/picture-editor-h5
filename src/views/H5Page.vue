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
          <el-button
            type="info"
            @click="uploadCroppedImage"
            :disabled="!croppedImage"
            >上传图片到后端</el-button
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
import axios from "axios";

// 裁剪器相关
const aspectRatio = ref<number | string | null>(null); // 默认不限制比例
const image = ref<string | null>(null); // 存储用户上传的图片
const croppedImage = ref<string | null>(null); // 裁剪后的图片
const cropper = ref<any>(null); // 裁剪器实例
const selectedAspectRatio = ref("");

// 接口配置 (请根据真实地址和参数修改)
const uploadUrl = "http://172.16.249.17:48080/app-api/label/brushPic";
const labelMacValue = "F09E9E0C2104"; // 后端要求的参数示例

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
    // 强制指定输出为2560x1440分辨率
    const croppedCanvas = cropper.value.getCroppedCanvas();
    croppedImage.value = croppedCanvas.toDataURL("image/png");
  } else {
    ElMessage.error("请先选择图片！");
  }
};

const crop2560x1440Image = () => {
  if (cropper.value) {
    // 强制指定输出为2560x1440分辨率
    const croppedCanvas = cropper.value.getCroppedCanvas({
      width: 2560,
      height: 1440,
    });
    croppedImage.value = croppedCanvas.toDataURL("image/png");
  } else {
    ElMessage.error("请先选择图片！");
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

// 将Base64转换为Blob
function base64ToBlob(base64: string): Blob {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// 上传裁剪后的图片到后端
const uploadCroppedImage = async () => {
  crop2560x1440Image();
  if (!croppedImage.value) {
    ElMessage.error("没有可上传的图片！");
    return;
  }

  try {
    // 使用 Image 对象获取分辨率
    const img = new Image();
    img.src = croppedImage.value;
    img.onload = async () => {
      console.log(`图片分辨率: ${img.width}x${img.height}`);

      // 继续上传逻辑
      const blob = base64ToBlob(croppedImage.value);
      const file = new File([blob], "cropped-image.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("labelMac", labelMacValue);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.code === 0) {
        ElMessage.success(`图片上传成功，分辨率: ${img.width}x${img.height}`);
      } else {
        ElMessage.error(`图片上传失败: ${response.data.msg || "未知错误"}`);
      }
    };

    img.onerror = () => {
      ElMessage.error("无法读取图片分辨率，请检查图片数据！");
    };
  } catch (error: any) {
    ElMessage.error(`请求失败：${error.message}`);
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
  /* height: 100vh; */
  background-color: #f0f0f0;
  color: black;
}
</style>
