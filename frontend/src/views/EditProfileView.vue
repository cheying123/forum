<!-- frontend/src/views/EditProfileView.vue -->
<template>
  <div class="edit-profile-container">
    <!-- 1. 引入裁剪模态框组件 -->
    <AvatarCropperModal ref="cropperModalRef" @crop-success="handleCropSuccess" />

    <h1>编辑个人资料</h1>
    <div v-if="loading">正在加载...</div>
    <form v-else @submit.prevent="updateProfile">
      <div class="form-group avatar-group">
        <label>头像</label>
        <img :src="serverBaseUrl + profile.avatarUrl" v-if="profile.avatarUrl" class="avatar-preview">
        <div v-else class="avatar-preview-placeholder">?</div>
        
        <!-- 2. 修改文件选择逻辑 -->
        <!-- 我们用一个按钮来触发隐藏的 input，更美观 -->
        <input
          type="file"
          ref="fileInputRef"
          @change="onFileSelected"
          accept="image/*"
          style="display: none"
        >
        <button type="button" @click="triggerFileInput">选择图片</button>
      </div>
      
      <!-- 其他信息 -->
      <div class="form-group">
        <label for="username">用户名</label>
        <input id="username" v-model="profile.username" type="text" required>
      </div>
      <div class="form-group">
        <label for="signature">个性签名</label>
        <textarea id="signature" v-model="profile.signature"></textarea>
      </div>
      <div class="form-group">
        <label for="contact">联系方式 (邮箱等)</label>
        <input id="contact" v-model="profile.contact" type="text">
      </div>
      
      <button type="submit" :disabled="isSaving">
        <span v-if="!isSaving">保存更改</span>
        <Loader v-else class="spinner" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import emitter from '@/emitter';
import { Loader } from 'lucide-vue-next';
import AvatarCropperModal from '@/components/AvatarCropperModal.vue'; // 引入新的裁剪模态框组件

const profile = ref({ username: '', signature: '', contact: '', avatarUrl: '' });
const loading = ref(true);
const isSaving = ref(false);
const isUploading = ref(false);       //  我们仍然需要这个状态来显示上传中的加载动画
const serverBaseUrl = 'http://localhost:3000';

// 4. 新增对组件的引用
const cropperModalRef = ref(null);
const fileInputRef = ref(null);

onMounted(async () => {
  try {
    const response = await api.getProfile(); // 需要在 api.js 中添加
    profile.value = response.data;
  } catch (error) {
    emitter.emit('show-toast', { message: '加载资料失败', type: 'error' });
  } finally {
    loading.value = false;
  }
});
// 触发隐藏的文件输入框
const triggerFileInput = () => {
  fileInputRef.value.click();
};

// 当用户选择了文件后，打开裁剪模态框
const onFileSelected = (e) => {
  const file = e.target.files[0];
  if (file) {
    cropperModalRef.value.open(file);
  }
  // 重置 input 的值，确保下次选择同一个文件也能触发 change 事件
  e.target.value = '';
};

// 新的逻辑：当裁剪成功后，执行上传
const handleCropSuccess = async (croppedFile) => {
  isUploading.value = true; // 在头像上显示加载状态（虽然现在没做，但逻辑先加上）
  const formData = new FormData();
  formData.append('avatar', croppedFile);
  try {
    const response = await api.uploadAvatar(formData);

    // 立即更新页面上显示的头像
    profile.value.avatarUrl = response.data.avatarUrl + `?t=${new Date().getTime()}`; // 加一个时间戳，强制浏览器刷新缓存
    emitter.emit('show-toast', { message: '头像上传成功！', type: 'success' });
    
    // 同时更新 localStorage 中的头像信息，以便导航栏能同步更新（如果导航栏有头像的话）
    const user = JSON.parse(localStorage.getItem('user'));
    user.avatarUrl = response.data.avatarUrl;
    localStorage.setItem('user', JSON.stringify(user));

  } catch (error) {
    emitter.emit('show-toast', { message: '头像上传失败', type: 'error' });
  } finally {
    isUploading.value = false;
  }
};

const updateProfile = async () => {
  isSaving.value = true;
  try {
    await api.updateProfile(profile.value);
    emitter.emit('show-toast', { message: '资料保存成功！', type: 'success' });
    const user = JSON.parse(localStorage.getItem('user'));
    user.username = profile.value.username;
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    emitter.emit('show-toast', { message: error.response?.data?.message || '保存失败', type: 'error' });
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.edit-profile-container { max-width: 600px; margin: 20px auto; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input, .form-group textarea { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
.form-group textarea { min-height: 100px; resize: vertical; }
.avatar-group { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.avatar-preview { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
.avatar-preview-placeholder { width: 80px; height: 80px; border-radius: 50%; background-color: #eee; display: flex; justify-content: center; align-items: center; font-size: 36px; color: #aaa; }
button { padding: 10px 20px; cursor: pointer; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>