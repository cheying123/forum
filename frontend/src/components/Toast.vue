<!-- frontend/src/components/Toast.vue -->
<template>
  <!-- 使用 transition 组件给提示框添加入场和离场动画 -->
  <transition name="toast-fade">
    <div v-if="visible" :class="['toast', `toast--${type}`]">
      <div class="toast-content">
        <!-- 这里可以根据类型显示不同的图标，但为了简单，我们先只用文字 -->
        <p>{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info' // 'info', 'success', 'error'
  },
  duration: {
    type: Number,
    default: 3000 // 默认显示 3 秒
  }
});

const visible = ref(false);
let timer = null;

const show = () => {
  visible.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    visible.value = false;
  }, props.duration);
};

// 暴露 show 方法，这样父组件就可以通过 ref 调用它
defineExpose({ show });
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  z-index: 10000;
  color: white;
  font-weight: 500;
}

/* 不同类型的背景色 */
.toast--success {
  background-color: #4CAF50; /* 绿色 */
}
.toast--error {
  background-color: #F44336; /* 红色 */
}
.toast--info {
  background-color: #2196F3; /* 蓝色 */
}

.toast-content p {
  margin: 0;
  padding: 0;
}

/* 定义 transition 动画 */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>