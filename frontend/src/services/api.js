// frontend/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
    //baseURL: 'http://localhost:3000/api', // 我们后端的地址
    baseURL: '/api', // 修改成这一行！
    headers: {
        'Content-Type': 'application/json'
    }
});

// 添加一个请求拦截器，它的作用是在每一个请求发出前，都自动将 Token 加入到请求头中
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default {
    register(user) { return apiClient.post('/register', user); },
    login(credentials) { return apiClient.post('/login', credentials); },
    getMessages() { return apiClient.get('/messages'); },
    postMessage(content) { return apiClient.post('/messages', { content }); },
    updateMessage(id, content) { return apiClient.put(`/messages/${id}`, { content }); },
    deleteMessage(id) { return apiClient.delete(`/messages/${id}`); },

     // --- ↓↓↓ 新增用户相关方法 ↓↓↓ ---
    getUser(username) {
        return apiClient.get(`/users/${username}`);
    },
    getProfile() {
        return apiClient.get('/profile');
    },
    updateProfile(profileData) {
        return apiClient.put('/profile', profileData);
    },
    uploadAvatar(formData) {
        return apiClient.post('/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // 上传文件必须的头
            }
        });
    },
};