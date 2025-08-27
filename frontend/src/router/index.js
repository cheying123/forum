// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/UserHome.vue';
import Login from '../views/UserLogin.vue';
import Register from '../views/UserRegister.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// 设置“路由守卫”：在每次页面跳转前进行检查
router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/register']; // 无需登录即可访问的页面
    const authRequired = !publicPages.includes(to.path); // 当前要访问的页面是否需要登录
    const loggedIn = localStorage.getItem('user'); // 检查本地是否存有用户信息

    // 如果用户想访问需要登录的页面，但实际上没有登录，则强制跳转到登录页
    if (authRequired && !loggedIn) {
        return next('/login');
    }

    next(); // 如果一切正常，则放行
});

export default router;