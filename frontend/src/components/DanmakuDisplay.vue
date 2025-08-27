<!-- frontend/src/components/DanmakuDisplay.vue -->
<template>
  <!-- 弹幕的“舞台”，所有弹幕都在这个容器里滚动 -->
  <div class="danmaku-container">
    <!-- 循环渲染每一条弹幕 -->
    <!-- 我们为每一条弹幕都绑定了一个动态的 style，用来实现随机的垂直位置和动画延迟 -->
    <div
      v-for="item in messages"
      :key="item.id"
      class="danmaku-item"
      :style="{ top: item.top + '%', animationDelay: item.delay + 's', animationDuration: item.duration + 's' }"
    >
      {{ item.content }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

// 接收从 HomeView 传过来的原始留言数据
const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
});

// 使用 computed 属性来处理数据
// 我们为每一条留言都预先计算好它的随机 top、delay 和 duration
// 这样做比在模板里直接调用方法性能更好
const messages = computed(() => {
  return props.messages.map(msg => ({
    ...msg,
    // 随机的垂直位置 (5% 到 90% 之间)
    top: Math.floor(Math.random() * 85) + 5,
    // 随机的动画延迟时间 (0 到 15 秒之间)，这样弹幕就不会同时出现
    delay: Math.random() * 15,
    // 随机的动画持续时间 (8 到 15 秒)，这样弹幕速度就会有快有慢
    duration: Math.random() * 7 + 8
  }));
});

</script>

<style scoped>
.danmaku-container {
  /* 固定在页面顶部，不随页面滚动而移动 */
  position: fixed;
  top: 60px; /* 距离顶部 60px，避免挡住导航栏 */
  left: 0;
  width: 100%;
  height: 200px; /* 弹幕区域的高度 */
  /* pointer-events: none; 让鼠标可以“穿透”弹幕层，点击到下方的元素 */
  pointer-events: none;
  /* overflow: hidden; 确保弹幕不会跑到容器外面去 */
  overflow: hidden;
  z-index: 999; /* 确保弹幕在最上层 */
}

.danmaku-item {
  /* 绝对定位，这样才能用 top 属性来控制垂直位置 */
  position: absolute;
  /* 从屏幕右侧外面开始 */
  left: 100%;
  /* 文本不换行 */
  white-space: nowrap;
  padding: 5px 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  font-size: 16px;
  /* 应用我们定义的动画 */
  animation-name: scroll-left;
  animation-timing-function: linear;
  animation-iteration-count: infinite; /* 无限循环播放 */
}

/* 定义一个从右到左的滚动动画 */
@keyframes scroll-left {
  from {
    /* transform 是比直接修改 left 性能更好的动画方式 */
    transform: translateX(0);
  }
  to {
    /* -100vw 保证它能完全移出屏幕左侧 */
    /* -100% 保证弹幕自身也完全移出 */
    transform: translateX(calc(-100vw - 100%));
  }
}
</style>