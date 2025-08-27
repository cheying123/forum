<template>
  <div class="auth-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input id="username" v-model="username" type="text" placeholder="输入用户名" required>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input id="password" v-model="password" type="password" placeholder="输入密码" required>
      </div>
      <button type="submit">登录</button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="switch-form">没有账号? <router-link to="/register">点击注册</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  try {
    const response = await api.login({ username: username.value, password: password.value });
    // 将 Token 和用户信息存储在浏览器的 localStorage 中
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    router.push('/'); // 登录成功后跳转到首页
  } catch (err) {
    error.value = err.response?.data?.message || '登录失败，请稍后再试。';
  }
};
</script>

<style scoped>
/* 样式统一在 App.vue 中定义 */
</style>