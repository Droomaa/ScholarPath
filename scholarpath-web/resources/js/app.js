import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';
import axios from 'axios';

// Apply theme immediately to prevent white flash
const theme = localStorage.getItem('theme');
if (theme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Global Axios Interceptor for 401 Unauthorized (Token expired/invalid)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Session expired or token invalid. Redirecting to login...');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_role');
            localStorage.removeItem('auth_name');
            localStorage.removeItem('auth_user_id');
            // Allow some specific routes to bypass auto-redirect if needed, but globally it should go to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Listen to all navigations to keep localStorage in sync with Laravel session status
router.on('navigate', (event) => {
    const auth = event.detail.page.props.auth;
    if (auth && auth.user && auth.go_token) {
        localStorage.setItem('auth_token', auth.go_token);
        localStorage.setItem('auth_role', auth.user.role);
        localStorage.setItem('auth_name', auth.user.name);
        localStorage.setItem('auth_user_id', auth.user.id);
    } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_name');
        localStorage.removeItem('auth_user_id');
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        // Synchronize on initial boot
        const auth = props.initialPage.props.auth;
        if (auth && auth.user && auth.go_token) {
            localStorage.setItem('auth_token', auth.go_token);
            localStorage.setItem('auth_role', auth.user.role);
            localStorage.setItem('auth_name', auth.user.name);
            localStorage.setItem('auth_user_id', auth.user.id);
        }

        return createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
