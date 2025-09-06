<template>
  <div class="message-item">
    <!-- 引入确认对话框组件 -->
    <ConfirmModal
      ref="confirmModalRef"
      message="确定要删除这条留言吗？"
      @confirm="executeDelete"
    />
    <div class="message-header">
    <!-- 用 router-link 包裹用户名 -->
      <router-link :to="{ name: 'UserProfile', params: { username: message.username } }">
        <strong>{{ message.username }}</strong>
      </router-link>
      <span class="timestamp">{{ new Date(message.createdAt).toLocaleString() }}</span>
    </div>
    <div class="message-content">
      <p v-if="!isEditing">{{ message.content }}</p>
      <!-- 修改留言的输入区域 -->
      <!-- 使用一个新的 div.edit-card 作为 Flexbox 容器 -->
      <div v-else class="edit-card">
        <textarea v-model="editableContent" class="edit-textarea" placeholder="输入修改内容..."></textarea>
        <!-- 用一个 div.edit-actions 把两个按钮包起来，方便对齐 -->
        <div class="edit-actions">
          <button @click="cancelEdit" class="cancel-btn">取消</button>
          <button @click="saveEdit" :disabled="isSaving" class="save-btn">
            <span v-if="!isSaving">保存</span>
            <Loader v-else class="spinner" />
          </button>
        </div>
      </div>
    </div>
    <!-- 只有留言的主人或管理员才能看到操作按钮 -->
    <!-- 给“删除”按钮添加加载状态 -->
    <div class="message-actions" v-if="!isEditing && (isOwner || isAdmin)">
      <button v-if="isOwner" @click="startEdit" class="edit-btn">修改</button>
      <button @click="promptDelete" :disabled="isDeleting" class="delete-btn">
        <span v-if="!isDeleting">删除</span>
        <Loader v-else class="spinner" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import api from '@/services/api';
// 引入所需的新工具
import emitter from '@/emitter';
import { Loader } from 'lucide-vue-next';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps({ message: Object });
const emit = defineEmits(['message-deleted', 'message-updated']);

const user = ref(JSON.parse(localStorage.getItem('user')));
const isEditing = ref(false); // 是否处于编辑状态
const editableContent = ref(props.message.content);

// 新增加载状态
const isSaving = ref(false);
const isDeleting = ref(false);

// 新增对 ConfirmModal 的引用
const confirmModalRef = ref(null);

// 计算属性，判断当前登录用户是否是这条留言的主人
const isOwner = computed(() => user.value && user.value.id === props.message.userId);
// 计算属性，判断当前登录用户是否是管理员
const isAdmin = computed(() => user.value && user.value.isAdmin);

const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  editableContent.value = props.message.content; // 取消时恢复原始内容
};

const saveEdit = async () => {
  isSaving.value = true;
  try {
    await api.updateMessage(props.message.id, editableContent.value);
    // 通知父组件（Home.vue）更新列表
    emit('message-updated', { id: props.message.id, content: editableContent.value });
    isEditing.value = false;
    emitter.emit('show-toast', { message: '修改成功！', type: 'success' });
  } catch (error) {
    emitter.emit('show-toast', { message: '修改失败！', type: 'error' });
  } finally {
    isSaving.value = false;
  }
};

// 新增一个函数，用来打开确认对话框
const promptDelete = () => {
  confirmModalRef.value.open();
};

// 新增一个函数，在用户点击“确认”后真正执行删除操作
const executeDelete = async () => {
  isDeleting.value = true;
  try {
    await api.deleteMessage(props.message.id);
    emit('message-deleted', props.message.id);
    emitter.emit('show-toast', { message: '删除成功！', type: 'success' });
  } catch (error) {
    emitter.emit('show-toast', { message: '删除失败！', type: 'error' });
  } finally {
    isDeleting.value = false;
  }
};


</script>

<style scoped>
.message-item { border: 1px solid #e1e1e1; padding: 15px; margin-bottom: 15px; border-radius: 8px; background-color: #f9f9f9; }
.message-header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #555; }
.timestamp { font-size: 0.85em; color: #888; }
.message-content p { white-space: pre-wrap; word-wrap: break-word; }


/* --- ↓↓↓ 编辑区样式 ↓↓↓ --- */

/* 1. 编辑卡片容器，使用 Flexbox 布局 */
.edit-card {
  display: flex;
  flex-direction: column; /* 让 textarea 和按钮区域垂直排列 */
  gap: 10px; /* 在 textarea 和按钮之间增加一些间距 */
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 6px;
  background-color: #fff;
}

/* 2. 美化 textarea 样式 */
.edit-textarea {
  width: 100%;
  min-height: 90px;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical; /* 只允许用户垂直调整大小 */
  font-family: inherit; /* 继承父元素的字体 */
  font-size: 1em;
  transition: border-color 0.3s, box-shadow 0.3s;
}

/* 当 textarea 获得焦点时的样式 */
.edit-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* 3. 按钮动作容器，也使用 Flexbox 来对齐按钮 */
.edit-actions {
  display: flex;
  justify-content: flex-end; /* 让所有按钮都靠右对齐 */
  gap: 8px; /* 在按钮之间增加一些间距 */
}

/* 4. 统一修改所有按钮的基础样式 */
.edit-actions button, .message-actions button {
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  min-width: 70px; /* 保持一个最小宽度，防止变形 */
  text-align: center;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

/* --- ↑↑↑ 编辑区样式结束 ↑↑↑ --- */


.message-actions { text-align: right; margin-top: 10px; }

/* 给按钮添加最小宽度，防止加载时变形 */
.message-actions button, .edit-area button { 
  margin-left: 10px; 
  padding: 5px 10px; 
  border-radius: 4px; 
  cursor: pointer; 
  border: 1px solid; 
  min-width: 60px; /* 新增 */
  text-align: center; /* 新增 */
}


.edit-btn { background-color: #ffc107; border-color: #ffc107; }
.delete-btn { background-color: #dc3545; color: white; border-color: #dc3545; }
.save-btn { background-color: #28a745; color: white; border-color: #28a745; }
.cancel-btn { background-color: #6c757d; color: white; border-color: #6c757d; }

/* 按钮的悬停效果 */
.edit-btn:hover { background-color: #e0a800; }
.delete-btn:hover { background-color: #c82333; }
.save-btn:hover { background-color: #218838; }
.cancel-btn:hover { background-color: #5a6268; }


/* 新增 spinner 动画 */
/* 加载图标的样式 */
.spinner {
  display: inline-block; /* 让图标能居中 */
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>