<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import RegistrationModal from '@/Components/RegistrationModal.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const userPendaftarans = ref([]);
const userWishlist = ref([]);
const isLoadingData = ref(false);
const messageToast = ref({ text: '', type: '' });
const isSubmittingAction = ref(false);

// Search & filter states
const search = ref('');
const activeFilter = ref('All');
const currentPage = ref(1);
const itemsPerPage = 5;

// Selected program detail modal
const selectedProgram = ref(null);
const showRegistrationModal = ref(false);
const registrationProgram = ref(null);
const existingRegistration = ref(null);

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

const fetchData = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoadingData.value = true;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

    // Fetch pendaftaran (riwayat) - only works for student role
    try {
        const resPendaftaran = await axios.get(`${backendUrl}/user/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        userPendaftarans.value = resPendaftaran.data.data || [];
    } catch (error) {
        console.warn('Pendaftaran data not available (may be non-student role):', error?.response?.status);
        userPendaftarans.value = [];
    }

    // Fetch wishlist - separate try/catch so it doesn't fail together
    try {
        const resWishlist = await axios.get(`${backendUrl}/user/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        userWishlist.value = resWishlist.data.data || [];
    } catch (error) {
        console.warn('Wishlist data not available:', error?.response?.status);
        userWishlist.value = [];
    }

    isLoadingData.value = false;
};

// Calculate stats count
const stats = computed(() => {
    const savedCount = userWishlist.value.length;
    const appliedCount = userPendaftarans.value.length;
    
    // Count pending status
    const pendingCount = userPendaftarans.value.filter(
        p => p.status_name?.toLowerCase() === 'pending'
    ).length;

    const resultCount = userPendaftarans.value.filter(
        p => ['accepted', 'rejected'].includes(p.status_name?.toLowerCase())
    ).length;

    return {
        saved: savedCount,
        applied: appliedCount,
        interviews: pendingCount,
        results: resultCount
    };
});

// Combined applied and wishlisted list for table tracking
const calculateDeadline = (deadlineStr) => {
    if (!deadlineStr) return { date: 'TBA', days: '-' };
    const dlDate = new Date(deadlineStr);
    const now = new Date();
    const diffTime = dlDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = dlDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    let daysStr = '';
    if (diffDays > 0) daysStr = `${diffDays} Hari Tersisa`;
    else if (diffDays === 0) daysStr = 'Hari Ini Terakhir';
    else daysStr = 'Telah Berakhir';
    
    return { date: formattedDate, days: daysStr };
};

const trackingList = computed(() => {
    const list = [];
    
    // Add applied items
    userPendaftarans.value.forEach(p => {
        const rawDeadline = p.program_deadline || p.beasiswa?.deadline || p.olimpiade?.deadline || null;
        const { date, days } = calculateDeadline(rawDeadline);
        list.push({
            id: p.pendaftaran_id,
            rawId: p.pendaftaran_id,
            title: p.program_title,
            type: p.program_type || 'Beasiswa',
            source: 'applied',
            status: p.status_name || 'Applied',
            deadline: date,
            daysLeft: days,
            date: p.tanggal_daftar
        });
    });

    // Add wishlisted items
    userWishlist.value.forEach(w => {
        const rawDeadline = w.program_deadline || w.beasiswa?.deadline || w.olimpiade?.deadline || null;
        const { date, days } = calculateDeadline(rawDeadline);
        list.push({
            id: `w-${w.wishlist_id}`,
            rawId: w.wishlist_id,
            title: w.program_title,
            type: w.program_type || 'Beasiswa',
            source: 'saved',
            status: 'Saved',
            deadline: date,
            daysLeft: days,
            date: new Date()
        });
    });

    return list;
});

// Search & Filtered data
const filteredTrackings = computed(() => {
    let result = trackingList.value;

    // Filter by type
    if (activeFilter.value === 'Scholarships') {
        result = result.filter(item => item.type === 'Beasiswa' || item.type?.toLowerCase() === 'scholarship');
    } else if (activeFilter.value === 'Competitions') {
        result = result.filter(item => item.type === 'Lomba' || item.type === 'Olimpiade' || item.type?.toLowerCase() === 'lomba');
    }

    // Search by title
    if (search.value) {
        const query = search.value.toLowerCase();
        result = result.filter(item => item.title.toLowerCase().includes(query));
    }

    return result;
});

// Paginated trackings
const paginatedTrackings = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredTrackings.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
    return Math.ceil(filteredTrackings.value.length / itemsPerPage) || 1;
});

const handleDeleteItem = async (item) => {
    const token = getAuthToken();
    if (!token) return;
    
    if (!confirm(`Apakah Anda yakin ingin membatalkan/menghapus "${item.title}"?`)) {
        return;
    }

    isSubmittingAction.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        if (item.source === 'applied') {
            await axios.delete(`${backendUrl}/pendaftaran/${item.rawId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Pendaftaran berhasil dibatalkan.');
        } else {
            await axios.delete(`${backendUrl}/user/wishlist/${item.rawId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Program dihapus dari wishlist.');
        }
        fetchData();
    } catch (error) {
        console.error('Error deleting program track:', error);
        showToast('Gagal membatalkan/menghapus program.', 'error');
    } finally {
        isSubmittingAction.value = false;
    }
};

const openDetail = async (item) => {
    if (item.source === 'applied') {
        isLoadingData.value = true;
        try {
            const token = getAuthToken();
            const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
            const res = await axios.get(`${backendUrl}/user/pendaftaran/${item.rawId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const detail = res.data.data;
            existingRegistration.value = detail;
            
            // Build the program object for RegistrationModal
            const programData = detail.beasiswa_id ? detail.beasiswa : detail.olimpiade;
            if (programData) {
                registrationProgram.value = {
                    ...programData,
                    type: detail.beasiswa_id ? 'Beasiswa' : 'Olimpiade',
                    title: programData.nama || programData.judul,
                    instansi: { nama: 'Penyelenggara Resmi' }
                };
            } else {
                // Fallback if program data not in response - create minimal object
                registrationProgram.value = {
                    id: detail.beasiswa_id || detail.olimpiade_id,
                    type: detail.beasiswa_id ? 'Beasiswa' : 'Olimpiade',
                    title: item.title || 'Program',
                    nama: item.title || 'Program',
                    deadline: null,
                    instansi: { nama: 'Penyelenggara Resmi' }
                };
            }
            
            showRegistrationModal.value = true;
        } catch (e) {
            console.error('openDetail error:', e);
            showToast('Gagal memuat detail pendaftaran: ' + (e.response?.data?.error || e.message), 'error');
        } finally {
            isLoadingData.value = false;
        }
    } else {
        showToast('Fitur edit detail hanya tersedia untuk pendaftaran aktif.', 'warning');
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <Head title="My Programs" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300"
                :class="{
                    'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success',
                    'bg-amber-50 text-amber-800 border-amber-100': messageToast.type === 'warning',
                    'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                <span v-else-if="messageToast.type === 'warning'" class="h-5 w-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">!</span>
                <span v-else class="h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            
            <!-- Page Header -->
            <div class="space-y-1">
                <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Programs</h1>
                <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pantau status pendaftaran beasiswa dan kompetisi aktif Anda di satu tempat.
                </p>
            </div>

            <!-- Stats Matrix Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Saved -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Saved</span>
                        <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/60">+12%</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800 dark:text-white">{{ stats.saved }}</span>
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">programs</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 dark:text-slate-800 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                </div>

                <!-- Applied -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Applied</span>
                        <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/60">+5%</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800 dark:text-white">{{ stats.applied }}</span>
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">submissions</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 dark:text-slate-800 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                    </div>
                </div>

                <!-- Pending / In Progress -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending</span>
                        <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">In Progress</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800 dark:text-white">{{ stats.interviews }}</span>
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">pending</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 dark:text-slate-800 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                </div>

                <!-- Results -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Results</span>
                        <span class="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800/60">New</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800 dark:text-white">{{ stats.results }}</span>
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">decisions</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 dark:text-slate-800 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Active Trackings Table Container -->
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <!-- Table Header Controls -->
                <div class="p-6 border-b border-slate-50 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 class="text-lg font-black text-slate-800 dark:text-white">Active Trackings</h2>
                    
                    <div class="flex flex-col sm:flex-row items-center gap-3">
                        <!-- Filters -->
                        <div class="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto">
                            <button
                                v-for="filt in ['All', 'Scholarships', 'Competitions']"
                                :key="filt"
                                type="button"
                                @click="activeFilter = filt; currentPage = 1"
                                class="px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none"
                                :class="activeFilter === filt ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                            >
                                {{ filt }}
                            </button>
                        </div>

                        <!-- Search Box -->
                        <div class="relative w-full sm:w-64">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                v-model="search"
                                placeholder="Search Insights..."
                                class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                            />
                        </div>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse text-left">
                        <thead>
                            <tr class="border-b border-slate-50 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-800/20 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th class="py-4 px-6">Program Name</th>
                                <th class="py-4 px-6">Type</th>
                                <th class="py-4 px-6">Status</th>
                                <th class="py-4 px-6">Deadline</th>
                                <th class="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
                            <tr v-for="item in paginatedTrackings" :key="item.id" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition duration-150">
                                <!-- Program Name -->
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        <div class="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">
                                            {{ item.title ? item.title.slice(0,2) : 'SP' }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 dark:text-slate-200 leading-snug">{{ item.title }}</p>
                                            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">ScholarPath Partner</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Type -->
                                <td class="py-4 px-6 font-bold text-slate-500 dark:text-slate-400">
                                    {{ item.type }}
                                </td>

                                <!-- Status Badge -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/60': item.status?.toLowerCase() === 'accepted',
                                            'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/60': item.status?.toLowerCase() === 'rejected',
                                            'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/60': item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'applied',
                                            'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700': item.status?.toLowerCase() === 'saved' || item.status?.toLowerCase() === 'simpan'
                                        }"
                                    >
                                        <span class="h-1.5 w-1.5 rounded-full"
                                            :class="{
                                                'bg-emerald-500 dark:bg-emerald-400': item.status?.toLowerCase() === 'accepted',
                                                'bg-red-500 dark:bg-red-400': item.status?.toLowerCase() === 'rejected',
                                                'bg-amber-500 dark:bg-amber-400': item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'applied',
                                                'bg-slate-400 dark:bg-slate-500': item.status?.toLowerCase() === 'saved' || item.status?.toLowerCase() === 'simpan'
                                            }"
                                        ></span>
                                        {{ item.status }}
                                    </span>
                                </td>

                                <!-- Deadline -->
                                <td class="py-4 px-6">
                                    <p class="font-bold text-slate-700 dark:text-slate-300">{{ item.deadline }}</p>
                                    <p class="text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5">{{ item.daysLeft }}</p>
                                </td>

                                <!-- Actions -->
                                <td class="py-4 px-6 text-right space-x-2">
                                    <button
                                        type="button"
                                        @click="openDetail(item)"
                                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold hover:underline"
                                    >
                                        View Detail
                                    </button>
                                    <span class="text-slate-300 dark:text-slate-600">|</span>
                                    <button
                                        type="button"
                                        :disabled="isSubmittingAction"
                                        @click="handleDeleteItem(item)"
                                        class="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold hover:underline disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="filteredTrackings.length === 0">
                                <td colspan="5" class="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                                    Tidak ada data pendaftaran aktif ditemukan.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table Pagination -->
                <div class="p-6 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-400 dark:text-slate-500">
                        Showing {{ Math.min(filteredTrackings.length, (currentPage - 1) * itemsPerPage + 1) }} to {{ Math.min(filteredTrackings.length, currentPage * itemsPerPage) }} of {{ filteredTrackings.length }} programs
                    </span>

                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            :disabled="currentPage === 1"
                            @click="currentPage--"
                            class="h-8 w-8 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            <span>&lt;</span>
                        </button>
                        <button
                            v-for="pg in totalPages"
                            :key="pg"
                            type="button"
                            @click="currentPage = pg"
                            class="h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-bold transition duration-150 cursor-pointer"
                            :class="currentPage === pg 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm dark:bg-indigo-500 dark:border-indigo-500' 
                                : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'"
                        >
                            {{ pg }}
                        </button>
                        <button
                            type="button"
                            :disabled="currentPage === totalPages"
                            @click="currentPage++"
                            class="h-8 w-8 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            <span>&gt;</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Registration Detail Modal (Replaces old static modal) -->
            <RegistrationModal 
                :show="showRegistrationModal" 
                :program="registrationProgram" 
                :isEditMode="true" 
                :existingRegistration="existingRegistration" 
                @close="showRegistrationModal = false" 
                @success="fetchData(); showRegistrationModal = false" 
            />

        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.toast-enter-active, .toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}
.toast-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.animate-scale {
    animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.92) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
