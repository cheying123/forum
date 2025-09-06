<!-- frontend/src/views/UserProfileView.vue -->
<template>
  <div v-if="loading" class="loading-container">
    <Loader class="spinner" />
  </div>
  <div v-else-if="user" class="profile-container">
    <div class="profile-header">
      <img :src="serverBaseUrl + user.avatarUrl" v-if="user.avatarUrl" alt="Avatar" class="profile-avatar">
      <div v-else class="profile-avatar-placeholder">?</div>
      <h1 class="profile-username">{{ user.username }}</h1>
    </div>
    <div class="profile-details">
      <div class="detail-item">
        <strong>个性签名:</strong>
        <p>{{ user.signature || '这个人很懒，什么都没留下...' }}</p>
      </div>
      <div class="detail-item">
        <strong>联系方式:</strong>
        <p>{{ user.contact || '未提供' }}</p>
      </div>
    </div>
  </div>
  <div v-else class="not-found">
    <h2>用户不存在</h2>
    <p>抱歉，我们找不到您要查找的用户。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { Loader } from 'lucide-vue-next';

const user = ref(null);
const loading = ref(true);
const route = useRoute();
const serverBaseUrl = 'http://localhost:3000'; // 后端服务器地址

const fetchUser = async (username) => {
  loading.value = true;
  try {
    const response = await api.getUser(username); // 我们需要在 api.js 中添加这个方法
    user.value = response.data;
  } catch (error) {
    console.error("获取用户信息失败:", error);
    user.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUser(route.params.username);
});

// 监听路由参数变化，以便在同一个页面切换不同用户时能重新加载数据
watch(() => route.params.username, (newUsername) => {
  if (newUsername) {
    fetchUser(newUsername);
  }
});
</script>

<style scoped>
.profile-container { max-width: 700px; margin: 20px auto; }
.profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.profile-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; }
.profile-avatar-placeholder { width: 100px; height: 100px; border-radius: 50%; background-color: #eee; display: flex; justify-content: center; align-items: center; font-size: 48px; color: #aaa; }
.profile-username { font-size: 2.5em; margin: 0; }
.detail-item { margin-bottom: 20px; }
.detail-item strong { display: block; margin-bottom: 5px; color: #555; }
.detail-item p { margin: 0; white-space: pre-wrap; }
.loading-container, .not-found { text-align: center; padding: 50px; }
.spinner { width: 48px; height: 48px; }
</style>