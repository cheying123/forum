<!-- frontend/src/components/ConfirmModal.vue -->
<template>
  <!-- 使用 transition 组件给模态框添加淡入淡出效果 -->
  <transition name="modal-fade">
    <div v-if="visible" class="modal-backdrop">
      <div class="modal">
        <header class="modal-header">
          <h3>{{ title }}</h3>
        </header>
        <section class="modal-body">
          <p>{{ message }}</p>
        </section>
        <footer class="modal-footer">
          <button type-button class="btn btn-secondary" @click="cancel">
            取消
          </button>
          <button type-button class="btn btn-danger" @click="confirm">
            确认
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: { type: String, default: '确认操作' },
  message: { type: String, required: true },
});

const emit = defineEmits(['confirm', 'cancel']);

const visible = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const confirm = () => {
  emit('confirm');
  close();
};

const cancel = () => {
  emit('cancel');
  close();
};

// 暴露 open 和 close 方法给父组件
defineExpose({ open, close });
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #FFFFFF;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  width: 400px;
  border-radius: 8px;
}

.modal-header {
  padding: 15px;
  display: flex;
  border-bottom: 1px solid #eeeeee;
  color: #333;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
}

.modal-body {
  position: relative;
  padding: 20px 15px;
}

.modal-footer {
  padding: 15px;
  display: flex;
  border-top: 1px solid #eeeeee;
  flex-direction: row;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-danger {
  color: white;
  background: #dc3545;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>