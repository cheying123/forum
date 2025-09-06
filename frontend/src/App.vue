<template>
  <div id="app-container">
    <nav class="main-nav">
      <router-link to="/">论坛首页</router-link>
      <!-- frontend/src/App.vue -->
      <div v-if="user" class="user-info">
        <span>欢迎,
          <!-- 用户名也变成可点击的链接 -->
          <router-link :to="{ name: 'UserProfile', params: { username: user.username } }">
            <strong>{{ user.username }}</strong>
          </router-link>
          {{ user.isAdmin ? '(管理员)' : '' }}
        </span>
        <!-- 新增编辑资料链接 -->
        <router-link :to="{ name: 'EditProfile' }">编辑资料</router-link>
        <a @click="logout" href="#">退出登录</a>
      </div>
      <div v-else>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </div>
    </nav>
    <main>
      <router-view/>
    </main>
        
    <!-- 1. 将 Toast 组件放在这里，并给它一个 ref -->
    <Toast ref="toastRef" :message="toastMessage" :type="toastType" />
  </div>
</template>

<script setup>
import { ref, watch,onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import Toast from './components/Toast.vue';
import emitter from './emitter';

const router = useRouter();
const route = useRoute();
const user = ref(JSON.parse(localStorage.getItem('user')));

// --- ↓↓↓ Toast 相关逻辑 ↓↓↓ ---
const toastRef = ref(null);
const toastMessage = ref('');
const toastType = ref('info');

// 定义一个函数，用来触发 Toast
const showToast = (payload) => {
  toastMessage.value = payload.message;
  toastType.value = payload.type || 'info';
  toastRef.value.show();
};

// 3. 在组件挂载时，监听全局的 'show-toast' 事件
onMounted(() => {
  emitter.on('show-toast', showToast);
});

// 4. 在组件卸载时，移除监听，防止内存泄漏
onUnmounted(() => {
  emitter.off('show-toast', showToast);
});
// --- ↑↑↑ Toast 相关逻辑结束 ↑↑↑ ---


const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user.value = null;

    // 使用新的 Toast 提示
    emitter.emit('show-toast', { message: '您已成功退出登录' });

    router.push('/login');
};

// 监听路由变化，以便在登录/退出后能及时更新导航栏的显示状态
watch(() => route.path, () => {
    user.value = JSON.parse(localStorage.getItem('user'));
}, { immediate: true });
</script>

<style>
/* 全局样式 */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; background-color: #f0f2f5; }
#app-container { max-width: 800px; margin: 0 auto; padding: 20px; }
main { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.main-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #ddd; }
.main-nav a { text-decoration: none; color: #007bff; font-weight: bold; margin: 0 10px; }
.main-nav a:hover, .main-nav a.router-link-exact-active { text-decoration: underline; }
.user-info span { margin-right: 15px; }
.user-info a { cursor: pointer; color: #dc3545; }

/* 表单统一样式 */
.auth-container { max-width: 400px; margin: 40px auto; padding: 20px; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group input { width: 100%; padding: 8px; box-sizing: border-box; }
.auth-container button { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
.error-message { color: red; text-align: center; margin-top: 10px; }
.switch-form { text-align: center; margin-top: 15px; }
</style>