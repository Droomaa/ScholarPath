<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const stats = ref({
    total_users: 24892,
    pending_verify: 142,
    reported_content: 18,
    pending_queue_count: 142
});

const verificationQueue = ref([]);
const isLoadingStats = ref(false);
const isLoadingQueue = ref(false);
const messageToast = ref({ text: '', type: '' });
const activeReviewItem = ref(null);
const isVerifying = ref(false);

const getAuthToken = () => localStorage.getItem('auth_token');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4500);
};

const fetchDashboardData = async () => {
    const token = getAuthToken();
    if (!token) return;

    // Fetch Stats
    isLoadingStats.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
            stats.value = response.data;
        }
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
    } finally {
        isLoadingStats.value = false;
    }

    // Fetch Verification Queue
    isLoadingQueue.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/admin/verification-queue`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.data) {
            verificationQueue.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch verification queue:', error);
    } finally {
        isLoadingQueue.value = false;
    }
};

const handleVerify = async (item) => {
    const token = getAuthToken();
    if (!token) return;

    isVerifying.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        let url = '';

        if (item.type === 'Partner Account') {
            url = `${backendUrl}/admin/verify/instansi/${item.id}`;
        } else if (item.type === 'Scholarship Content') {
            url = `${backendUrl}/admin/verify/beasiswa/${item.id}`;
        } else if (item.type === 'Competition Content') {
            url = `${backendUrl}/admin/verify/olimpiade/${item.id}`;
        }

        const response = await axios.put(url, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
            showToast(`${item.type} "${item.name}" berhasil diverifikasi!`, 'success');
            activeReviewItem.value = null;
            // Reload dashboard data
            fetchDashboardData();
        }
    } catch (error) {
        console.error('Verification failed:', error);
        showToast('Gagal memverifikasi item. Silakan coba lagi.', 'error');
    } finally {
        isVerifying.value = false;
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <Head title="Admin Dashboard" />

    <AdminLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300"
                :class="{
                    'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success',
                    'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8 text-left">
            <!-- Header section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
                    <p class="text-sm font-medium text-slate-500">Real-time performance metrics and system status.</p>
                </div>
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                        📅 Last 30 Days
                    </button>
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                        📥 Export Report
                    </button>
                </div>
            </div>

            <!-- Stats grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Users -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-slate-50 text-slate-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                        </div>
                        <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">
                            {{ stats.total_users.toLocaleString('id-ID') }}
                        </p>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-indigo-600 h-full w-[72%]"></div>
                        </div>
                    </div>
                </div>

                <!-- Pending Verifications -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-purple-50 text-purple-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Verifications</span>
                        </div>
                        <span class="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Action Needed</span>
                    </div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <p class="text-3xl font-black text-slate-800 leading-tight">
                                {{ stats.pending_verify }}
                            </p>
                            <span class="text-[10px] font-semibold text-slate-400">Average wait: 4.2 hours</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-purple-600 h-full w-[45%]"></div>
                        </div>
                    </div>
                </div>

                <!-- Reported Content -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-rose-50 text-rose-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Reported Content</span>
                        </div>
                        <span class="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">-5% from last week</span>
                    </div>
                    <div>
                        <div class="flex items-center justify-between">
                            <p class="text-3xl font-black text-slate-800 leading-tight">
                                {{ stats.reported_content }}
                            </p>
                            <!-- Mini avatars -->
                            <div class="flex -space-x-2">
                                <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                <img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                            </div>
                        </div>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-red-500 h-full w-[20%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Graphs & Logs widget -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <!-- Registration Trend chart -->
                <div class="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                        <div>
                            <h3 class="text-base font-black text-slate-800">Registration Trend</h3>
                            <p class="text-[10px] font-semibold text-slate-400">User growth performance across institutions.</p>
                        </div>
                        <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>Students</span>
                            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-purple-600"></span>Institutions</span>
                        </div>
                    </div>

                    <!-- Custom SVG Line Chart -->
                    <div class="h-64 w-full relative pt-4">
                        <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradStudents" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15"/>
                                    <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
                                </linearGradient>
                                <linearGradient id="gradInstitutions" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#9333ea" stop-opacity="0.15"/>
                                    <stop offset="100%" stop-color="#9333ea" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                            <!-- Grid lines -->
                            <line x1="0" y1="50" x2="500" y2="50" stroke="#f8fafc" stroke-width="1.5"/>
                            <line x1="0" y1="100" x2="500" y2="100" stroke="#f8fafc" stroke-width="1.5"/>
                            <line x1="0" y1="150" x2="500" y2="150" stroke="#f8fafc" stroke-width="1.5"/>
                            
                            <!-- Student paths -->
                            <path d="M 0 160 C 50 150, 100 130, 150 135 C 200 140, 250 90, 300 100 C 350 110, 400 60, 450 70 C 475 75, 500 50, 500 50 L 500 200 L 0 200 Z" fill="url(#gradStudents)"/>
                            <path d="M 0 160 C 50 150, 100 130, 150 135 C 200 140, 250 90, 300 100 C 350 110, 400 60, 450 70 C 475 75, 500 50, 500 50" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>
                            
                            <!-- Institution paths -->
                            <path d="M 0 180 C 60 170, 120 185, 180 150 C 240 115, 300 160, 360 110 C 420 60, 480 120, 500 100 L 500 200 L 0 200 Z" fill="url(#gradInstitutions)"/>
                            <path d="M 0 180 C 60 170, 120 185, 180 150 C 240 115, 300 160, 360 110 C 420 60, 480 120, 500 100" fill="none" stroke="#9333ea" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                        
                        <!-- Y-axis guidelines -->
                        <div class="absolute left-2 top-4 bottom-0 flex flex-col justify-between text-[9px] font-bold text-slate-400 pointer-events-none">
                            <span>500+</span>
                            <span>250</span>
                            <span>100</span>
                            <span>0</span>
                        </div>
                    </div>

                    <!-- X-axis weeks -->
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 px-4 pt-2">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>

                <!-- System Logs widget -->
                <div class="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                        <h3 class="text-base font-black text-slate-800">System Logs</h3>
                        <button type="button" class="text-xs font-bold text-purple-600 hover:underline cursor-pointer">View All</button>
                    </div>

                    <div class="space-y-5">
                        <!-- Log 1 -->
                        <div class="flex gap-3.5 items-start">
                            <div class="h-8.5 w-8.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <div class="text-left space-y-0.5">
                                <p class="text-xs font-bold text-slate-800 leading-tight">Admin Login Successful</p>
                                <p class="text-[10px] font-semibold text-slate-400">IP: 192.168.1.45 • 2 mins ago</p>
                            </div>
                        </div>

                        <!-- Log 2 -->
                        <div class="flex gap-3.5 items-start">
                            <div class="h-8.5 w-8.5 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                                </svg>
                            </div>
                            <div class="text-left space-y-0.5">
                                <p class="text-xs font-bold text-slate-800 leading-tight">Policy Update Applied</p>
                                <p class="text-[10px] font-semibold text-slate-400">Security patch v2.4 • 45 mins ago</p>
                            </div>
                        </div>

                        <!-- Log 3 -->
                        <div class="flex gap-3.5 items-start">
                            <div class="h-8.5 w-8.5 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div class="text-left space-y-0.5">
                                <p class="text-xs font-bold text-slate-800 leading-tight">Failed Verification</p>
                                <p class="text-[10px] font-semibold text-slate-400">ID: #SCH-9022 • 1.2 hours ago</p>
                            </div>
                        </div>

                        <!-- Log 4 -->
                        <div class="flex gap-3.5 items-start">
                            <div class="h-8.5 w-8.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div class="text-left space-y-0.5">
                                <p class="text-xs font-bold text-slate-800 leading-tight">New Institution Registered</p>
                                <p class="text-[10px] font-semibold text-slate-400">Oakwood University • 3 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Verification Queue table -->
            <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                    <div class="text-left">
                        <h3 class="text-lg font-black text-slate-800 leading-tight">Pending Verification Queue</h3>
                        <p class="text-xs font-semibold text-slate-400 mt-1">Review accounts and content submitted for verification.</p>
                    </div>
                    <span class="px-3 py-1 text-[10px] font-extrabold uppercase bg-purple-50 border border-purple-100 text-purple-700 rounded-full">
                        High-Priority
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                <th class="pb-3.5 font-bold">Provider/Entity</th>
                                <th class="pb-3.5 font-bold">Type</th>
                                <th class="pb-3.5 font-bold">Submission Date</th>
                                <th class="pb-3.5 font-bold">Status</th>
                                <th class="pb-3.5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <!-- Loader -->
                            <tr v-if="isLoadingQueue">
                                <td colspan="5" class="py-8 text-center text-xs font-bold text-slate-400 animate-pulse">
                                    Memuat data antrean verifikasi...
                                </td>
                            </tr>
                            <!-- Empty -->
                            <tr v-else-if="verificationQueue.length === 0">
                                <td colspan="5" class="py-8 text-center text-xs font-bold text-slate-400">
                                    Tidak ada item yang perlu diverifikasi saat ini.
                                </td>
                            </tr>
                            <!-- Data -->
                            <tr v-else v-for="item in verificationQueue" :key="item.id" class="group hover:bg-slate-50/30 transition-colors duration-150">
                                <td class="py-4.5">
                                    <div class="flex items-center gap-3">
                                        <div class="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                                            :class="{
                                                'bg-rose-50 text-rose-600': item.type === 'Scholarship Content',
                                                'bg-indigo-50 text-indigo-600': item.type === 'Partner Account',
                                                'bg-amber-50 text-amber-600': item.type === 'Competition Content'
                                            }"
                                        >
                                            {{ item.name.charAt(0) }}
                                        </div>
                                        <div class="text-left">
                                            <p class="text-sm font-bold text-slate-800">{{ item.name }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4.5 text-xs font-semibold text-slate-500">
                                    {{ item.type }}
                                </td>
                                <td class="py-4.5 text-xs font-semibold text-slate-400">
                                    {{ item.submission_date }}
                                </td>
                                <td class="py-4.5">
                                    <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                        {{ item.status }}
                                    </span>
                                </td>
                                <td class="py-4.5 text-right">
                                    <button 
                                        type="button" 
                                        @click="activeReviewItem = item"
                                        class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition duration-150 cursor-pointer"
                                    >
                                        Review Details
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Verification Detail Modal -->
        <transition name="fade">
            <div v-if="activeReviewItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="activeReviewItem = null"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                            :class="{
                                'bg-rose-50 text-rose-700 border-rose-100': activeReviewItem.type === 'Scholarship Content',
                                'bg-indigo-50 text-indigo-700 border-indigo-100': activeReviewItem.type === 'Partner Account',
                                'bg-amber-50 text-amber-700 border-amber-100': activeReviewItem.type === 'Competition Content'
                            }"
                        >
                            {{ activeReviewItem.type }}
                        </span>
                        <button type="button" @click="activeReviewItem = null" class="text-slate-400 hover:text-slate-600 transition text-xl">&times;</button>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-xl font-extrabold text-slate-800 leading-tight">
                            {{ activeReviewItem.name }}
                        </h3>
                        
                        <div class="bg-slate-50 rounded-2xl p-4.5 space-y-3 border border-slate-100">
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-400">Submission Date</span>
                                <span class="text-slate-700">{{ activeReviewItem.submission_date }}</span>
                            </div>
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-400">Database ID</span>
                                <span class="text-slate-700">#{{ activeReviewItem.id }}</span>
                            </div>
                            <div class="flex justify-between text-xs font-bold">
                                <span class="text-slate-400">Verification Status</span>
                                <span class="text-amber-600 uppercase tracking-wider">{{ activeReviewItem.status }}</span>
                            </div>
                        </div>

                        <p class="text-xs font-semibold text-slate-500 leading-relaxed">
                            Pastikan data dan kredensial yang diajukan sudah sesuai dengan regulasi platform ScholarPath. Proses verifikasi ini akan mengaktifkan konten/akun sehingga dapat diakses oleh publik (siswa).
                        </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-50">
                        <button 
                            type="button" 
                            @click="activeReviewItem = null" 
                            class="w-full py-3 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-700 text-xs font-bold rounded-2xl border border-slate-150 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            @click="handleVerify(activeReviewItem)" 
                            :disabled="isVerifying"
                            class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/10 hover:shadow-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <svg v-if="isVerifying" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verify & Approve
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </AdminLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
.animate-scale { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
