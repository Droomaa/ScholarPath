<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Link, usePage, router } from '@inertiajs/vue3';
import { LayoutDashboard, Bookmark, Sparkles, Settings, LogOut, Search, Bell, Send, X, User, Heart } from '@lucide/vue';
import { backendApi } from '@/utils/api';
import { watchDebounced } from '@vueuse/core';
import ThemeToggle from '@/Components/ThemeToggle.vue';

const page = usePage();
const user = page.props.auth?.user || {};

const searchQuery = ref(route().params.search || '');

watchDebounced(searchQuery, () => {
    handleSearch();
}, { debounce: 300 });

const handleSearch = () => {
    router.visit(route('dashboard'), { data: { search: searchQuery.value }, preserveState: true });
};

const clearSearch = () => {
    searchQuery.value = '';
    // Debounce will trigger the search
};

const notifications = ref([]);
const showNotifications = ref(false);
const showProfileMenu = ref(false);

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const fetchNotifications = async () => {
    try {
        const response = await backendApi.get('/user/notifications');
        const data = response.data?.data || [];
        notifications.value = data;
    } catch (e) {
        console.error("Failed to fetch notifications", e);
    }
};

const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    if (showNotifications.value) {
        showProfileMenu.value = false;
        // Optionally mark all as read here
        notifications.value.forEach(n => n.is_read = true);
    }
};

const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value;
    if (showProfileMenu.value) {
        showNotifications.value = false;
    }
};

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token');
    router.post(route('logout'));
};

const closeDropdown = (e) => {
    if (!e.target.closest('.notification-container')) {
        showNotifications.value = false;
    }
    if (!e.target.closest('.profile-container')) {
        showProfileMenu.value = false;
    }
};

onMounted(() => {
    // Intercept empty profile to force Onboarding
    if (user && user.role === 'student' && (!user.keahlian || user.keahlian === '')) {
        // Jika sedang tidak berada di Onboarding
        if (!route().current('student.onboarding')) {
            router.visit(route('student.onboarding'));
        }
    }

    fetchNotifications();
    document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});

const navigation = [
    { name: 'Dashboard', href: route('dashboard'), routeName: 'dashboard', icon: LayoutDashboard },
    { name: 'My Programs', href: route('student.programs'), routeName: 'student.programs', icon: Bookmark },
    { name: 'Settings', href: route('student.settings'), routeName: 'student.settings', icon: Settings },
];
</script>

<template>
    <div class="min-h-screen bg-slate-50 dark:bg-navy-950 flex font-sans transition-colors duration-300">
        <!-- Sidebar -->
        <aside class="w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-navy-800 flex flex-col hidden md:flex fixed h-full z-20 transition-colors duration-300">
            <div class="h-20 flex items-center px-8 border-b border-slate-100 dark:border-navy-800">
                <Link :href="route('dashboard')" class="flex items-center gap-2">
                    <span class="text-xl font-bold text-brand-700 dark:text-brand-400 tracking-tight">ScholarPath</span>
                </Link>
                <div class="text-[10px] text-slate-400 font-medium ml-1 mt-1">Student Dashboard</div>
            </div>
            
            <div class="flex-1 overflow-y-auto py-6 px-4">
                <nav class="space-y-1">
                    <Link v-for="item in navigation" :key="item.name" :href="item.href"
                          :class="[route().current(item.routeName) ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 hover:text-brand-700 dark:hover:text-brand-400', 'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200']">
                        <component :is="item.icon" :class="[route().current(item.routeName) ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400', 'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200']" aria-hidden="true" />
                        {{ item.name }}
                    </Link>
                </nav>
            </div>
            
            <div class="p-4 border-t border-slate-100 dark:border-navy-800">
                <Link :href="route('logout')" method="post" as="button" class="w-full group flex justify-center items-center px-4 py-3 text-sm font-medium rounded-xl text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors duration-200">
                    <LogOut class="mr-2 h-4 w-4" />
                    Log Out
                </Link>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 md:ml-64 flex flex-col min-h-screen">
            <!-- Header -->
            <header class="h-20 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 sticky top-0 z-10 px-8 flex items-center justify-between transition-colors duration-300">
                <div class="flex-1 max-w-lg">
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search class="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors" />
                        </div>
                        <input type="text" v-model="searchQuery" class="block w-full pl-10 pr-10 py-2.5 border-0 bg-slate-100 dark:bg-navy-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-navy-900 transition-all text-sm" placeholder="Search scholarships, labs, competitions..." />
                        <button v-if="searchQuery" @click="clearSearch" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <X class="h-4 w-4" />
                        </button>
                    </div>
                </div>
                
                <div class="flex items-center gap-6 ml-4">
                    <ThemeToggle />
                    
                    <!-- Wishlist Topbar Icon -->
                    <Link :href="route('student.wishlist')" class="relative text-slate-400 hover:text-red-500 transition-colors" title="My Wishlist">
                        <Heart class="h-6 w-6" />
                    </Link>

                    <div class="relative notification-container">
                        <button @click="toggleNotifications" class="relative text-slate-400 hover:text-brand-600 transition-colors">
                            <Bell class="h-6 w-6" />
                            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                                {{ unreadCount > 9 ? '9+' : unreadCount }}
                            </span>
                        </button>
                        
                        <!-- Notification Dropdown -->
                        <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                            <div class="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <h3 class="text-sm font-bold text-slate-900">Rekomendasi Program Baru</h3>
                            </div>
                            <div class="max-h-80 overflow-y-auto">
                                <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-slate-500">
                                    Belum ada program baru.
                                </div>
                                <div v-else>
                                    <div v-for="(notif, index) in notifications.slice(0, 5)" :key="index" class="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                                        <div class="flex items-start gap-3">
                                            <div class="bg-brand-50 text-brand-600 p-2 rounded-lg flex-shrink-0">
                                                <Bell class="w-4 h-4" />
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-sm font-bold text-slate-900 leading-tight mb-1">{{ notif.title }}</p>
                                                <p class="text-xs text-slate-500 line-clamp-2">{{ notif.message }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="relative profile-container flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer" @click="toggleProfileMenu">
                        <div class="text-right hidden sm:block">
                            <div class="text-sm font-semibold text-slate-900">{{ user.name }}</div>
                            <div class="text-xs text-slate-500 uppercase tracking-wider font-medium">Student Account</div>
                        </div>
                        <img class="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" :src="'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.username || 'User') + '&background=ede9fe&color=6d28d9'" alt="User Avatar" />
                        
                        <!-- Profile Dropdown -->
                        <div v-if="showProfileMenu" class="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                            <Link :href="route('student.settings')" class="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                <User class="w-4 h-4 mr-2 text-slate-400" />
                                Edit Profile
                            </Link>
                            <button @click="handleLogout" class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut class="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <div class="flex-1 p-8">
                <slot />
            </div>
        </main>
    </div>
</template>
