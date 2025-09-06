// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/UserHome.vue';
import Login from '../views/UserLogin.vue';
import Register from '../views/UserRegister.vue';

// 引入新的页面组件
import UserProfileView from '../views/UserProfileView.vue';
import EditProfileView from '../views/EditProfileView.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },

    // 添加新路由
    {
      path: '/user/:username', // 使用动态路由参数 :username
      name: 'UserProfile',
      component: UserProfileView,
      props: true // 将路由参数作为 props 传递给组件
    },
    {
      path: '/profile/edit',
      name: 'EditProfile',
      component: EditProfileView,
      // 路由守卫：只有登录用户才能访问编辑页面
      meta: { requiresAuth: true } 
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

// 设置“路由守卫”：在每次页面跳转前进行检查
// 修改路由守卫，以支持新的 requiresAuth meta 字段
router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('user');

    if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) {
        // 如果路由需要认证但用户未登录，跳转到登录页
        next('/login');
    } else {
        next(); // 否则正常放行
    }
});

export default router;