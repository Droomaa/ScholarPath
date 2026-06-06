<script setup>
import { ref, onMounted } from 'vue';
import { Link, useForm } from '@inertiajs/vue3';
import axios from 'axios';

const showingMobileMenu = ref(false);
const formLogout = useForm({});

const handleLogout = () => {
    // Clear Go backend JWT from localStorage first
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_name');
    localStorage.removeItem('auth_user_id');

    // Submit Laravel logout
    formLogout.post(route('logout'));
};

const adminProfile = ref({
    name: 'Alex Rivera',
    role: 'SUPER ADMIN'
});

onMounted(() => {
    // Get user details from localStorage
    const savedName = localStorage.getItem('auth_name');
    const savedRole = localStorage.getItem('auth_role');
    
    if (savedName) adminProfile.value.name = savedName;
    if (savedRole) adminProfile.value.role = savedRole.toUpperCase();

    // Fetch live profile details if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            if (response.data && response.data.data) {
                const u = response.data.data;
                adminProfile.value.name = u.name || savedName;
                adminProfile.value.role = (u.role || savedRole || 'admin').toUpperCase();
            }
        }).catch(err => {
            console.error('Failed to load profile details in layout:', err);
        });
    }
});
</script>

<template>
    <div class="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex overflow-hidden">
        
        <!-- Sidebar (Desktop) -->
        <aside class="hidden lg:flex flex-col w-[260px] bg-white border-r border-slate-100 shrink-0 h-screen sticky top-0">
            <!-- Brand Logo -->
            <div class="px-6 h-20 flex flex-col justify-center border-b border-slate-50">
                <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                    ScholarPath
                </span>
                <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                    Admin Console
                </span>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <!-- Dashboard -->
                <Link
                    :href="route('admin.dashboard')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.dashboard') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                    </svg>
                    Dashboard
                </Link>

                <!-- User Management -->
                <Link
                    :href="route('admin.user-management')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.user-management') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    User Management
                </Link>

                <!-- Content Verification -->
                <Link
                    :href="route('admin.content-verification')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.content-verification') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Content Verification
                </Link>

                <!-- Institution Verification -->
                <Link
                    :href="route('admin.institution-verification')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.institution-verification') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Institution Verification
                </Link>

                <!-- System Logs -->
                <Link
                    :href="route('admin.system-logs')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.system-logs') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    System Logs
                </Link>
            </nav>

            <!-- Bottom: Settings -->
            <div class="px-4 py-2 border-t border-slate-50">
                <Link
                    :href="route('admin.settings')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('admin.settings') 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                </Link>
            </div>

            <!-- Profile Info Footer -->
            <div class="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl overflow-hidden border border-slate-100 bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-inner">
                        {{ adminProfile.name.charAt(0) }}
                    </div>
                    <div class="text-left">
                        <h4 class="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                            {{ adminProfile.name }}
                        </h4>
                        <p class="text-[9px] font-extrabold text-purple-600 tracking-wider">
                            {{ adminProfile.role }}
                        </p>
                    </div>
                </div>
                
                <button
                    type="button"
                    @click="handleLogout"
                    title="Log Out"
                    class="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition duration-200 cursor-pointer"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            
            <!-- Topbar Header -->
            <header class="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 relative z-20">
                <!-- Search Analytics -->
                <div class="flex items-center gap-3 flex-1 max-w-md">
                    <div class="relative w-full">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search analytics, users, or logs..."
                            class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition outline-none"
                        />
                    </div>
                </div>

                <!-- Right profile controls -->
                <div class="flex items-center gap-5">
                    <!-- Notifications -->
                    <button class="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span class="absolute top-2 right-2 h-2.5 w-2.5 bg-purple-500 rounded-full ring-2 ring-white"></span>
                    </button>

                    <!-- Profile Info -->
                    <div class="flex items-center gap-3">
                        <div class="text-right hidden sm:block">
                            <h4 class="text-sm font-bold text-slate-800 leading-tight">
                                {{ adminProfile.name }}
                            </h4>
                            <p class="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                                {{ adminProfile.role }}
                            </p>
                        </div>
                        <!-- Profile Image -->
                        <div class="h-10 w-10 rounded-xl overflow-hidden border border-slate-100 ring-2 ring-purple-50 hover:ring-purple-100 transition flex items-center justify-center bg-purple-50 text-purple-600 font-extrabold text-sm shadow-inner">
                            {{ adminProfile.name.charAt(0) }}
                        </div>
                    </div>

                    <!-- Hamburger (Mobile Only) -->
                    <button
                        @click="showingMobileMenu = !showingMobileMenu"
                        class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 transition focus:outline-none"
                    >
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Mobile Navigation Overlay -->
            <transition name="fade">
                <div v-if="showingMobileMenu" class="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" @click="showingMobileMenu = false"></div>
            </transition>

            <aside
                class="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white flex flex-col border-r border-slate-100 transition-transform duration-300 transform"
                :class="showingMobileMenu ? 'translate-x-0' : '-translate-x-full'"
            >
                <div class="px-6 h-20 flex flex-col justify-center border-b border-slate-50">
                    <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                        ScholarPath
                    </span>
                    <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                        Admin Console
                    </span>
                </div>

                <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" @click="showingMobileMenu = false">
                    <!-- Dashboard -->
                    <Link
                        :href="route('admin.dashboard')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.dashboard') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        Dashboard
                    </Link>
                    <!-- User Management -->
                    <Link
                        :href="route('admin.user-management')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.user-management') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        User Management
                    </Link>

                    <!-- Content Verification -->
                    <Link
                        :href="route('admin.content-verification')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.content-verification') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        Content Verification
                    </Link>

                    <!-- Institution Verification -->
                    <Link
                        :href="route('admin.institution-verification')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.institution-verification') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        Institution Verification
                    </Link>

                    <!-- System Logs -->
                    <Link
                        :href="route('admin.system-logs')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.system-logs') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        System Logs
                    </Link>

                    <!-- Settings -->
                    <Link
                        :href="route('admin.settings')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.settings') ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        Settings
                    </Link>
                </nav>

                <div class="p-4 border-t border-slate-50">
                    <button
                        type="button"
                        @click="handleLogout"
                        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            <!-- Main Page Content Area -->
            <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/40">
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
