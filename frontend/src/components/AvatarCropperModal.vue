<!-- frontend/src/components/AvatarCropperModal.vue -->
<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-backdrop" @click.self="close">
      <div class="modal">
        <header class="modal-header">
          <h3>裁剪头像</h3>
          <button type="button" class="btn-close" @click="close">×</button>
        </header>
        <section class="modal-body">
          <cropper
            ref="cropperRef"
            :src="imageSrc"
            :stencil-props="{
              aspectRatio: 1/1, // 保持 1:1 的宽高比（正方形）
            }"
            :canvas="{
              width: 512, // 输出图片的宽度
              height: 512 // 输出图片的高度
            }"
          />
        </section>
        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="cropImage">
            确认裁剪并上传
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';
// 1. 引入 Cropper 组件
import { Cropper } from 'vue-advanced-cropper';

const emit = defineEmits(['crop-success']);

const visible = ref(false);
const imageSrc = ref(null);
const cropperRef = ref(null);

// 打开模态框，并加载用户选择的图片
const open = (file) => {
  if (file && file.type.startsWith('image/')) {
    imageSrc.value = URL.createObjectURL(file); // 将 File 对象转换为 URL
    visible.value = true;
  }
};

const close = () => {
  visible.value = false;
  imageSrc.value = null; // 清理 URL，释放内存
};

// 裁剪图片
const cropImage = () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
      // 将裁剪后的 Canvas 转换为 Blob 对象 (类似文件)
      canvas.toBlob(blob => {
        // 创建一个新的 File 对象，以便上传
        const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
        // 发出事件，将裁剪后的文件传递给父组件
        emit('crop-success', croppedFile);
        close();
      }, 'image/png');
    }
  }
};

defineExpose({ open });
</script>

<style scoped>
/* 这里的样式大部分和 ConfirmModal 类似，但有针对裁剪器的调整 */
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #FFFFFF;
  box-shadow: 2px 2px 20px 1px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  width: 90vw;
  max-width: 500px;
}
.modal-body {
  height: 400px; /* 给裁剪器一个固定的高度 */
}

/* ... header, footer, button 等样式可以复用 ConfirmModal 的 ... */
.modal-header { padding: 15px; display: flex; border-bottom: 1px solid #eeeeee; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; }
.btn-close { padding: 0.5rem; margin: -0.5rem; background: transparent; border: 0; font-size: 1.5rem; cursor: pointer; }
.modal-footer { padding: 15px; display: flex; border-top: 1px solid #eeeeee; justify-content: flex-end; }
.btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; }
.btn-primary { color: white; background: #007bff; }
.btn-secondary { background: #6c757d; color: white; }

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>