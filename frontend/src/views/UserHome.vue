<!-- frontend/src/views/HomeView.vue -->
<template>
  <div>
    <!-- 新增：弹幕组件，用 v-if 来控制它的显示和隐藏 -->
    <DanmakuDisplay v-if="showDanmaku" :messages="danmakuMessages" />

    <div class="header-container">
      <h1>论坛留言板</h1>
      <!-- 新增：弹幕开关按钮 -->
      <label class="switch">
        <input type="checkbox" v-model="showDanmaku">
        <span class="slider" data-on="弹幕开启" data-off="弹幕关闭"></span>
      </label>
    </div>

    <div class="post-box">
      <textarea v-model="newMessage" placeholder="分享你的想法..."></textarea>
      <!-- 修改发布按钮 -->
      <button @click="postMessage" :disabled="isPosting">
        <span v-if="!isPosting">发布</span>
        <Loader v-else class="spinner" />
      </button>
    </div>

    <div class="message-list">
      <p v-if="loading">正在加载留言...</p>
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @message-deleted="removeMessageFromList"
        @message-updated="updateMessageInList"
      />
    </div>
  </div>
</template>

<script setup>
// 新增：引入 computed
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import emitter from '@/emitter'; //  引入 emitter
import { Loader } from 'lucide-vue-next'; //  引入图标
import MessageItem from '@/components/MessageItem.vue';
// 新增：引入我们刚刚创建的弹幕组件
import DanmakuDisplay from '@/components/DanmakuDisplay.vue';

const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);

const switchScalePercent = ref(80); // 默认大小为 80%(弹幕)

// 新增：一个控制弹幕是否显示的状态，默认为 true (显示)
const showDanmaku = ref(true);

// 新增 isPosting 状态
const isPosting = ref(false);

// 新增：使用 computed 计算属性来筛选出符合弹幕条件的留言
// 这样做的好处是，当 messages 列表变化时，danmakuMessages 会自动更新
const danmakuMessages = computed(() => {
  // filter 方法会返回一个新数组，只包含满足条件的元素
  return messages.value.filter(message => message.content.length <= 30);
});


// 获取所有留言 (此函数不变)
const fetchMessages = async () => {
  try {
    const response = await api.getMessages();
    messages.value = response.data;
  } catch (error) {
    console.error("获取留言失败:", error);
    alert('无法加载留言，请刷新页面。');
  } finally {
    loading.value = false;
  }
};

// 发布新留言 (此函数不变)
const postMessage = async () => {
  if (!newMessage.value.trim()) return;
  isPosting.value = true; // 开始发布
  try {
    const response = await api.postMessage(newMessage.value);
    messages.value.unshift(response.data);
    newMessage.value = '';
    emitter.emit('show-toast', { message: '发布成功！', type: 'success' });
  } catch (error) {
    emitter.emit('show-toast', { message: '发布失败！', type: 'error' });
  }finally {
    isPosting.value = false; // 结束发布
  }
};

// 从列表中移除被删除的留言 (此函数不变)
const removeMessageFromList = (messageId) => {
  messages.value = messages.value.filter(m => m.id !== messageId);
};

// 更新列表中的留言内容 (此函数不变)
const updateMessageInList = (updatedMessage) => {
  const index = messages.value.findIndex(m => m.id === updatedMessage.id);
  if (index !== -1) {
    messages.value[index].content = updatedMessage.content;
  }
};

// 当组件被挂载到页面上时，自动获取留言列表 (此函数不变)
onMounted(fetchMessages);
</script>

/* frontend/src/views/HomeView.vue */
<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* --- ↓↓↓ 开关按钮的全新可缩放样式 ↓↓↓ --- */

/* 1. 定义一个可控的缩放比例 */
.switch {
  /* 
    使用 v-bind 将 JS 中的变量传递给 CSS 变量 --scale。
    我们将百分比转换为了一个小数，例如 80 -> 0.8 
  */
  --scale: v-bind(switchScalePercent / 100);

  /* 2. 定义开关的基础尺寸 (100%大小时的尺寸) */
  --switch-width: 100px; /* 为了容纳文字，把基础宽度稍微加长一点 */
  --switch-height: 34px;
  --slider-padding: 4px;
  --slider-diameter: 26px; /* 滑块直径 */

  /* 3. 使用 calc() 和 var() 根据缩放比例计算最终尺寸 */
  position: relative;
  display: inline-block;
  width: calc(var(--switch-width) * var(--scale));
  height: calc(var(--switch-height) * var(--scale));
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: calc(var(--switch-height) * var(--scale)); /* 圆角也按比例缩放 */
}

.slider:before {
  position: absolute;
  content: "";
  /* 根据缩放比例计算滑块大小 */
  height: calc(var(--slider-diameter) * var(--scale));
  width: calc(var(--slider-diameter) * var(--scale));
  /* 根据缩放比例计算滑块位置 */
  left: calc(var(--slider-padding) * var(--scale));
  bottom: calc(var(--slider-padding) * var(--scale));
  background-color: white;
  transition: .4s;
  border-radius: 50%;

  /* 确保滑块在文字上层 */
  z-index: 2;
}

/* 文字 (::after 伪元素) - 这是新增的部分 */
.slider:after {
  /* 通过 attr() 读取 HTML 中 data-off 属性的值 */
  content: attr(data-off);
  color: white;
  display: block;
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  /* 文字默认显示在右侧 */
  left: 65%; 
  font-size: calc(12px * var(--scale)); /* 字体大小也按比例缩放 */
  font-family: sans-serif;
  transition: .4s;

  white-space: nowrap;  /* 禁止换行 */

  /* 确保文字在滑块下层 */
  z-index: 1;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  /* 移动距离现在是 宽度 - 直径 - 边距 */
  transform: translateX(calc((var(--switch-width) - var(--slider-diameter) - 2*var(--slider-padding)) * var(--scale)));
}

/* 当开关被选中时，改变文字内容和位置 */
input:checked + .slider:after {
  /* 通过 attr() 读取 HTML 中 data-on 属性的值 */
  content: attr(data-on);
  /* 文字移动到左侧 */
  left: 35%;
}

/* --- ↑↑↑ 开关按钮样式到此结束 ↑↑↑ --- */

/* ... 下面的 post-box 等样式保持不变 ... */
.post-box {
  margin-bottom: 30px;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.post-box textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

.post-box button {
  padding: 8px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.post-box button:hover {
  background-color: #0056b3;
}

.message-list {
  clear: both;
}

/* 新增 spinner 动画 */
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>