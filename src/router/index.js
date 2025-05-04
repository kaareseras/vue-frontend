import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import JobsView from '@/views/JobsView.vue';
import JobView from '@/views/JobView.vue';
import AddJobView from '@/views/AddJobView.vue';
import EditJobView from '@/views/EditJobView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import LoginView from '@/views/LoginView.vue'
import UserSettingsView from '@/views/UserSettingsView.vue'
import UserCreateView from '@/views/UserCreateView.vue';
import AccountVerifyView from '@/views/AccountVerifyView.vue';
import ForgotPasswordView from '@/views/ForgotPasswordView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/jobs',
            name: 'jobs',
            component: JobsView 
        },
        {
            path: '/jobs/:id',
            name: 'job',
            component: JobView
        },
        {
            path: '/jobs/add',
            name: 'add-job',
            component: AddJobView
        },
        {
            path: '/jobs/edit/:id',
            name: 'edit-job',
            component: EditJobView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/user',
            name: 'UserSettings',
            component: UserSettingsView
        },
        {
            path: '/usercreate',
            name: 'user-create',
            component: UserCreateView
        },
        {
            path: '/auth/account-verify',
            name: 'AccountVerify',
            component: AccountVerifyView
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: ForgotPasswordView
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: ResetPasswordView
        },        
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView
        }

    ]
});

export default router;
