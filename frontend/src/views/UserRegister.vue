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
      <button type="submit">注册</button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="switch-form">已有账号? <router-link to="/login">点击登录</router-link></p>
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

const handleRegister = async () => {
  error.value = ''; // 清空之前的错误信息
  try {
    await api.register({ username: username.value, password: password.value });
    // 创建一个js对象，这个对象是发送给后端的数据 

    alert('注册成功！请登录。');
    router.push('/login'); // 注册成功后跳转到登录页
  } catch (err) {
    error.value = err.response?.data?.message || '注册失败，请稍后再试。';
  }
};
</script>

<style scoped>
/* 样式统一在 App.vue 中定义 */
</style>