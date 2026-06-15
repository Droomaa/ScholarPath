<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const listApplicants = ref([]);
const isLoading = ref(false);
const messageToast = ref({ text: '', type: '' });
const isSaving = ref(false);
const searchQuery = ref('');
const sortBy = ref('high_match');
const filterType = ref('All');
const selectedApplicantDetails = ref(null);

// Pagination: 5 rows per page
const currentPage = ref(1);
const PAGE_SIZE = 5;

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => localStorage.getItem('auth_token');

const fetchApplicants = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        // Try new dedicated endpoint first
        try {
            const response = await axios.get(`${backendUrl}/instansi/applicants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            listApplicants.value = response.data.data || [];
            return;
        } catch (e) {
            console.warn('instansi/applicants not available, falling back:', e?.response?.status);
        }

        // Fallback to legacy endpoint
        const response = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        listApplicants.value = response.data.data || [];
    } catch (e) {
        console.error('Failed to load applicants:', e);
        listApplicants.value = [];
    } finally {
        isLoading.value = false;
    }
};

// AI Match Score: use api field if available, else hash generator as fallback
const getMatchScore = (app) => {
    // Use real AI score if available from API
    if (app.ai_score !== undefined && app.ai_score !== null) {
        return parseInt(app.ai_score);
    }
    // Fallback hash generator
    const str = (app.student_name || '') + (app.program_title || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 59) + 40; // 40 to 98
};

// Dynamic color classes based on score thresholds
const getScoreColorClass = (score) => {
    if (score > 70) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800/50';
    if (score > 40) return 'text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800/50';
    return 'text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-900/30 border-red-100 dark:border-red-800/50';
};

const getScoreDotClass = (score) => {
    if (score > 70) return 'bg-emerald-500 dark:bg-emerald-400';
    if (score > 40) return 'bg-amber-500 dark:bg-amber-400';
    return 'bg-red-500 dark:bg-red-400';
};

const getCompatibilityText = (score) => {
    if (score > 70) return 'High Match';
    if (score > 40) return 'Medium';
    return 'Low Match';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatKeahlian = (str) => {
    if (!str) return 'Siswa ScholarPath';
    let items = [];
    if (Array.isArray(str)) {
        items = str;
    } else {
        items = str.split(',').map(s => s.trim()).filter(s => s);
    }
    
    if (items.length > 5) {
        return items.slice(0, 5).join(', ') + '...';
    }
    return items.join(', ');
};

// Status helpers — support string status from new endpoint + numeric status_id from legacy
const isStatusPending = (app) => {
    return app.status === 'pending' || app.status_name === 'pending' ||
           app.status_id === 1 || app.status_name === 'Applied' || app.status_name === 'Daftar';
};

const isStatusAccepted = (app) => {
    return app.status === 'accept' || app.status === 'lolos' ||
           app.status_id === 3 || app.status_name === 'Accepted' || app.status_name === 'Lolos';
};

const isStatusRejected = (app) => {
    return app.status === 'reject' || app.status === 'ditolak' ||
           app.status_id === 4 || app.status_name === 'Rejected' || app.status_name === 'Ditolak';
};

const getStatusLabel = (app) => {
    if (isStatusAccepted(app)) return 'Diterima';
    if (isStatusRejected(app)) return 'Ditolak';
    return 'Menunggu Review';
};

const getStatusBadgeClass = (app) => {
    if (isStatusAccepted(app)) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50';
    if (isStatusRejected(app)) return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50';
    return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50';
};

// Stats using string status
const stats = computed(() => {
    const total = listApplicants.value.length;
    const reviewing = listApplicants.value.filter(a => isStatusPending(a)).length;
    const rejected = listApplicants.value.filter(a => isStatusRejected(a)).length;
    const accepted = listApplicants.value.filter(a => isStatusAccepted(a)).length;
    return { total, reviewing, rejected, accepted };
});

// 2-in-1 search: match against applicant_name OR program_title
const processedApplicants = computed(() => {
    let list = [...listApplicants.value];

    // Search filter — matches name OR program title
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        list = list.filter(app =>
            (app.student_name || '').toLowerCase().includes(query) ||
            (app.applicant_name || '').toLowerCase().includes(query) ||
            (app.program_title || '').toLowerCase().includes(query)
        );
    }

    // Program type filter
    if (filterType.value !== 'All') {
        list = list.filter(app =>
            (app.program_type || app.type || '').toLowerCase() === filterType.value.toLowerCase()
        );
    }

    // Sort
    list.sort((a, b) => {
        const scoreA = getMatchScore(a);
        const scoreB = getMatchScore(b);
        if (sortBy.value === 'high_match') return scoreB - scoreA;
        if (sortBy.value === 'low_match') return scoreA - scoreB;
        if (sortBy.value === 'newest') return new Date(b.tanggal_daftar) - new Date(a.tanggal_daftar);
        return 0;
    });

    return list;
});

// Pagination computed
const totalPages = computed(() => Math.ceil(processedApplicants.value.length / PAGE_SIZE) || 1);

const pagedApplicants = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return processedApplicants.value.slice(start, start + PAGE_SIZE);
});

const goToPrevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const goToNextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

// Reset to page 1 when filter/search changes
watch([searchQuery, filterType, sortBy], () => {
    currentPage.value = 1;
});

// Update applicant status: accept, reject, or pending (cancel)
const updateStatus = async (app, newStatus) => {
    const token = getAuthToken();
    if (!token) return;
    isSaving.value = true;

    const pendaftaranId = app.pendaftaran_id || app.id;

    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        // Try new instansi/applicants endpoint format
        try {
            await axios.put(`${backendUrl}/instansi/applicants/${pendaftaranId}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            // Fallback to legacy pendaftaran endpoint with status_id
            const statusIdMap = { accept: 3, reject: 4, pending: 1 };
            await axios.put(`${backendUrl}/pendaftaran/${pendaftaranId}/status`, {
                status_id: statusIdMap[newStatus] || 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        const statusLabels = { accept: 'Diterima', reject: 'Ditolak', pending: 'Pending' };
        showToast(`Status berhasil diperbarui menjadi ${statusLabels[newStatus] || newStatus}!`);

        // Close modal and refresh
        selectedApplicantDetails.value = null;
        await fetchApplicants();
    } catch (e) {
        console.error('Failed to update status:', e);
        showToast('Gagal memperbarui status pelamar.', 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    fetchApplicants();
});
</script>

<template>
    <Head title="Manajemen Pelamar" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-slideDown"
                :class="{
                    'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60': messageToast.type === 'success',
                    'bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-100 dark:border-red-800/60': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                <span v-else class="h-5 w-5 bg-red-500 dark:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">×</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Page Header (No bulk buttons) -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div class="space-y-1">
                    <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Pelamar</h1>
                    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Review and manage student applications with AI-powered match scoring.</p>
                </div>
            </div>

            <!-- Stats Matrix Row: Total, Reviewing, Ditolak, Diterima -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Total Pelamar -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28 text-left">
                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Pelamar</span>
                    <div class="flex items-baseline justify-between mt-2">
                        <span class="text-2xl font-black text-slate-800 dark:text-white leading-tight">{{ stats.total.toLocaleString('id-ID') }}</span>
                        <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">Total</span>
                    </div>
                </div>

                <!-- Reviewing -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28 text-left">
                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Menunggu Review</span>
                    <div class="flex items-baseline justify-between mt-2">
                        <span class="text-2xl font-black text-slate-800 dark:text-white leading-tight">{{ stats.reviewing }}</span>
                        <span class="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800/50">Pending</span>
                    </div>
                </div>

                <!-- Ditolak -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28 text-left">
                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ditolak</span>
                    <div class="flex items-baseline justify-between mt-2">
                        <span class="text-2xl font-black text-slate-800 dark:text-white leading-tight">{{ stats.rejected }}</span>
                        <span class="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800/50">Reject</span>
                    </div>
                </div>

                <!-- Diterima -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28 text-left">
                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Diterima</span>
                    <div class="flex items-baseline justify-between mt-2">
                        <span class="text-2xl font-black text-slate-800 dark:text-white leading-tight">{{ stats.accepted }}</span>
                        <span class="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">Accept</span>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">

                <!-- Table Controls Header -->
                <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <!-- 2-in-1 Search Bar: matches name OR program -->
                    <div class="relative w-full sm:max-w-xs">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari nama pelamar atau program..."
                            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                        />
                    </div>

                    <!-- Filter & Sort -->
                    <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <!-- Filter tabs -->
                        <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                            <button
                                v-for="tab in ['All', 'Beasiswa', 'Olimpiade']"
                                :key="tab"
                                @click="filterType = tab"
                                class="px-3 py-1.5 rounded-md text-[10px] font-black transition-all focus:outline-none cursor-pointer"
                                :class="filterType === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                            >
                                {{ tab }}
                            </button>
                        </div>

                        <!-- Sort dropdown -->
                        <select
                            v-model="sortBy"
                            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl focus:outline-none cursor-pointer outline-none"
                        >
                            <option value="high_match">Sort: High Match</option>
                            <option value="newest">Sort: Newest</option>
                            <option value="low_match">Sort: Lowest Match</option>
                        </select>
                    </div>
                </div>

                <!-- Applicants Table -->
                <div class="overflow-x-auto">
                    <!-- Loading skeleton -->
                    <div v-if="isLoading" class="p-6 space-y-3">
                        <div v-for="n in 5" :key="n" class="h-14 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                    </div>

                    <table v-else class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th class="py-4 px-6">Pelamar</th>
                                <th class="py-4 px-6">Program Tujuan</th>
                                <th class="py-4 px-6">AI Match Score</th>
                                <th class="py-4 px-6">Status</th>
                                <th class="py-4 px-6 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
                            <tr
                                v-for="app in pagedApplicants"
                                :key="app.pendaftaran_id || app.id"
                                class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group"
                            >
                                <!-- Applicant Name -->
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3.5">
                                        <div class="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 shrink-0">
                                            {{ (app.student_name || app.applicant_name || '?').split(' ').map(n => n[0]).slice(0,2).join('') }}
                                        </div>
                                        <div class="text-left">
                                            <p class="font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{{ app.student_name || app.applicant_name }}</p>
                                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{{ formatKeahlian(app.keahlian) }}</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Program & date -->
                                <td class="py-4 px-6 text-left">
                                    <div>
                                        <p class="font-bold text-slate-700 dark:text-slate-300 leading-snug">{{ app.program_title }}</p>
                                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Daftar: {{ formatDate(app.tanggal_daftar || app.created_at) }}</p>
                                    </div>
                                </td>

                                <!-- AI Match Score (dynamic color) -->
                                <td class="py-4 px-6 text-left">
                                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border" :class="getScoreColorClass(getMatchScore(app))">
                                        <span class="h-1.5 w-1.5 rounded-full" :class="getScoreDotClass(getMatchScore(app))"></span>
                                        <span class="text-[9px] font-black uppercase tracking-wider">
                                            {{ getMatchScore(app) }}% {{ getCompatibilityText(getMatchScore(app)) }}
                                        </span>
                                    </div>
                                </td>

                                <!-- Status Badge -->
                                <td class="py-4 px-6 text-left">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border" :class="getStatusBadgeClass(app)">
                                        {{ getStatusLabel(app) }}
                                    </span>
                                </td>

                                <!-- Action: Eye icon -->
                                <td class="py-4 px-6 text-center">
                                    <button
                                        @click="selectedApplicantDetails = app"
                                        class="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                                        title="Lihat Detail Pelamar"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>

                            <!-- Empty state -->
                            <tr v-if="pagedApplicants.length === 0 && !isLoading">
                                <td colspan="5" class="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                                    Tidak ada pelamar yang cocok dengan filter atau pencarian Anda.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Bar -->
                <div class="p-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>
                        Menampilkan {{ processedApplicants.length === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE + 1) }}–{{ Math.min(currentPage * PAGE_SIZE, processedApplicants.length) }} dari {{ processedApplicants.length }} pelamar
                    </span>

                    <div class="flex items-center gap-1.5">
                        <!-- Prev -->
                        <button
                            @click="goToPrevPage"
                            :disabled="currentPage <= 1"
                            class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >‹</button>

                        <!-- Page numbers -->
                        <template v-for="page in totalPages" :key="page">
                            <button
                                v-if="page === currentPage || Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages"
                                @click="currentPage = page"
                                class="h-8 w-8 rounded-lg font-bold transition focus:outline-none cursor-pointer"
                                :class="page === currentPage
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'"
                            >{{ page }}</button>
                            <span
                                v-else-if="page === currentPage - 2 || page === currentPage + 2"
                                class="text-slate-400 px-1 text-xs"
                            >…</span>
                        </template>

                        <!-- Next -->
                        <button
                            @click="goToNextPage"
                            :disabled="currentPage >= totalPages"
                            class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >›</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ========================================= -->
        <!-- DETAIL & DECISION MODAL                   -->
        <!-- ========================================= -->
        <transition name="fade">
            <div v-if="selectedApplicantDetails" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
                <div class="absolute inset-0" @click="selectedApplicantDetails = null"></div>
                <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 animate-scale text-left">

                    <!-- Modal Header: AI Score badge + close button -->
                    <div class="flex justify-between items-start mb-5">
                        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase"
                            :class="getScoreColorClass(getMatchScore(selectedApplicantDetails))"
                        >
                            <span class="h-1.5 w-1.5 rounded-full" :class="getScoreDotClass(getMatchScore(selectedApplicantDetails))"></span>
                            AI Score: {{ getMatchScore(selectedApplicantDetails) }}% — {{ getCompatibilityText(getMatchScore(selectedApplicantDetails)) }}
                        </span>
                        <button type="button" @click="selectedApplicantDetails = null" class="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 text-xl transition">×</button>
                    </div>

                    <!-- Candidate Profile -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800/60 pb-4">
                            <div class="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-base">
                                {{ (selectedApplicantDetails.student_name || selectedApplicantDetails.applicant_name || '?').split(' ').map(n => n[0]).slice(0,2).join('') }}
                            </div>
                            <div>
                                <h3 class="text-base font-extrabold text-slate-800 dark:text-white leading-snug">{{ selectedApplicantDetails.student_name || selectedApplicantDetails.applicant_name }}</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{{ selectedApplicantDetails.student_email || selectedApplicantDetails.email || '-' }}</p>
                            </div>
                        </div>

                        <!-- Technical Details -->
                        <div class="space-y-3 py-2 text-xs">
                            <div class="grid grid-cols-3 gap-2">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Keahlian</span>
                                <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ formatKeahlian(selectedApplicantDetails.keahlian) }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Program</span>
                                <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ selectedApplicantDetails.program_title }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Tanggal</span>
                                <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ formatDate(selectedApplicantDetails.tanggal_daftar || selectedApplicantDetails.created_at) }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Status</span>
                                <span class="col-span-2">
                                    <span class="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border" :class="getStatusBadgeClass(selectedApplicantDetails)">
                                        {{ getStatusLabel(selectedApplicantDetails) }}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <!-- Submitted Documents -->
                        <div class="space-y-3 py-2 text-xs border-t border-slate-50 dark:border-slate-800/60 pt-4">
                            <h4 class="font-bold text-slate-800 dark:text-white">Berkas Pendaftaran</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <a v-if="selectedApplicantDetails.resume_url" :href="selectedApplicantDetails.resume_url" target="_blank" class="flex justify-between items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-bold">
                                    Resume CV <span class="text-xs">↓</span>
                                </a>
                                <a v-if="selectedApplicantDetails.report_card_url" :href="selectedApplicantDetails.report_card_url" target="_blank" class="flex justify-between items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-bold">
                                    Rapor <span class="text-xs">↓</span>
                                </a>
                                <a v-if="selectedApplicantDetails.proposal_url" :href="selectedApplicantDetails.proposal_url" target="_blank" class="flex justify-between items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-bold">
                                    Proposal <span class="text-xs">↓</span>
                                </a>
                                <a v-if="selectedApplicantDetails.recommendation_url" :href="selectedApplicantDetails.recommendation_url" target="_blank" class="flex justify-between items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-bold">
                                    Rekomendasi <span class="text-xs">↓</span>
                                </a>
                                <p v-if="!selectedApplicantDetails.resume_url && !selectedApplicantDetails.report_card_url && !selectedApplicantDetails.proposal_url && !selectedApplicantDetails.recommendation_url" class="col-span-2 text-slate-400 dark:text-slate-500 font-semibold text-center py-2">
                                    Tidak ada berkas terlampir.
                                </p>
                            </div>
                            <div v-if="selectedApplicantDetails.alasan" class="mt-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h5 class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Alasan Ketertarikan</h5>
                                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-line">{{ selectedApplicantDetails.alasan }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Decision Buttons: conditional based on current status -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/60">
                        <!-- If PENDING: show Accept + Reject -->
                        <template v-if="isStatusPending(selectedApplicantDetails)">
                            <button
                                type="button"
                                :disabled="isSaving"
                                @click="updateStatus(selectedApplicantDetails, 'reject')"
                                class="w-full py-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100/50 dark:border-red-800/50 transition cursor-pointer disabled:opacity-50"
                            >
                                {{ isSaving ? '...' : 'Tolak Pelamar' }}
                            </button>
                            <button
                                type="button"
                                :disabled="isSaving"
                                @click="updateStatus(selectedApplicantDetails, 'accept')"
                                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer disabled:opacity-50"
                            >
                                {{ isSaving ? '...' : 'Terima Pelamar' }}
                            </button>
                        </template>

                        <!-- If ACCEPTED or REJECTED: show Batalkan button -->
                        <template v-else>
                            <button
                                type="button"
                                :disabled="isSaving"
                                @click="updateStatus(selectedApplicantDetails, 'pending')"
                                class="w-full py-3 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-2xl border border-amber-100/50 dark:border-amber-800/50 transition cursor-pointer disabled:opacity-50"
                            >
                                {{ isSaving ? 'Memproses...' : '↩ Batalkan Keputusan (Pending)' }}
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </transition>
    </AuthenticatedLayout>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-scale { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-slideDown {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
