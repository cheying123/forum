// frontend/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 确保这一行存在
import 'vue-advanced-cropper/dist/style.css'; // <-- 添加这一行


createApp(App).use(router).mount('#app')