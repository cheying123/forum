<template>
  <div class="message-item">
    <div class="message-header">
      <strong>{{ message.username }}</strong>
      <span class="timestamp">{{ new Date(message.createdAt).toLocaleString() }}</span>
    </div>
    <div class="message-content">
      <p v-if="!isEditing">{{ message.content }}</p>
      <!-- 修改留言的输入区域 -->
      <div v-else class="edit-area">
        <textarea v-model="editableContent"></textarea>
        <button @click="saveEdit" class="save-btn">保存</button>
        <button @click="cancelEdit" class="cancel-btn">取消</button>
      </div>
    </div>
    <!-- 只有留言的主人或管理员才能看到操作按钮 -->
    <div class="message-actions" v-if="!isEditing && (isOwner || isAdmin)">
      <button v-if="isOwner" @click="startEdit" class="edit-btn">修改</button>
      <button @click="deleteMessage" class="delete-btn">删除</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import api from '@/services/api';

const props = defineProps({ message: Object });
const emit = defineEmits(['message-deleted', 'message-updated']);

const user = ref(JSON.parse(localStorage.getItem('user')));
const isEditing = ref(false); // 是否处于编辑状态
const editableContent = ref(props.message.content);

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
  try {
    await api.updateMessage(props.message.id, editableContent.value);
    // 通知父组件（Home.vue）更新列表
    emit('message-updated', { id: props.message.id, content: editableContent.value });
    isEditing.value = false;
  } catch (error) {
    alert('修改失败！');
  }
};

const deleteMessage = async () => {
  if (confirm('确定要删除这条留言吗？')) {
    try {
      await api.deleteMessage(props.message.id);
      // 通知父组件（Home.vue）从列表中移除这条留言
      emit('message-deleted', props.message.id);
    } catch (error) {
      alert('删除失败！');
    }
  }
};
</script>

<style scoped>
.message-item { border: 1px solid #e1e1e1; padding: 15px; margin-bottom: 15px; border-radius: 8px; background-color: #f9f9f9; }
.message-header { display: flex; justify-content: space-between; margin-bottom: 10px; color: #555; }
.timestamp { font-size: 0.85em; color: #888; }
.message-content p { white-space: pre-wrap; word-wrap: break-word; }
.edit-area textarea { width: 100%; box-sizing: border-box; margin-bottom: 5px; }
.message-actions { text-align: right; margin-top: 10px; }
.message-actions button { margin-left: 10px; padding: 5px 10px; border-radius: 4px; cursor: pointer; border: 1px solid; }
.edit-btn { background-color: #ffc107; border-color: #ffc107; }
.delete-btn { background-color: #dc3545; color: white; border-color: #dc3545; }
.save-btn { background-color: #28a745; color: white; border-color: #28a745; }
.cancel-btn { background-color: #6c757d; color: white; border-color: #6c757d; }
</style>