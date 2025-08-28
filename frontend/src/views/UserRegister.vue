<template>
  <div class="auth-container">
    <h2>注册新账号</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">用户名</label>
        <input id="username" v-model="username" type="text" placeholder="输入用户名" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input id="password" v-model="password" type="password" placeholder="输入密码" required>
      </div>
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="再次输入密码" required>
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="!loading">注册</span>
        <Loader v-else class="spinner" />
      </button>

      
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="switch-form">已有账号? <router-link to="/login">点击登录</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

// 引入事件总线和加载图标
import emitter from '@/emitter';
import { Loader } from 'lucide-vue-next';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

// 新增 loading 状态
const loading = ref(false);

const handleRegister = async () => {
  error.value = ''; // 清空之前的错误信息
  loading.value = true; // 开始请求，进入加载状态
  try {
    await api.register({ username: username.value, password: password.value });
    // 创建一个js对象，这个对象是发送给后端的数据 

    // 使用 emitter 触发全局 Toast
    emitter.emit('show-toast', { message: '注册成功！请登录。', type: 'success' });

    router.push('/login');
  } catch (err) {
    const errorMessage = err.response?.data?.message || '注册失败，请稍后再试。';
    error.value = errorMessage;
    // 失败时也触发 Toast
    emitter.emit('show-toast', { message: errorMessage, type: 'error' });
  }finally {
    loading.value = false; // 请求结束，退出加载状态
  }
};
</script>

<style scoped>
/* 样式统一在 App.vue 中定义 */
/* 新增 spinner 动画样式 */
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>