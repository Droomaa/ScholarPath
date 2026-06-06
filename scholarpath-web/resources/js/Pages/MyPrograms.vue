<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
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
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // Fetch pendaftaran & wishlist
        const [resPendaftaran, resWishlist] = await Promise.all([
            axios.get(`${backendUrl}/user/pendaftaran`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/user/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        userPendaftarans.value = resPendaftaran.data.data || [];
        userWishlist.value = resWishlist.data.data || [];
    } catch (error) {
        console.error('Error fetching programs data:', error);
        showToast('Gagal memuat beberapa data dari backend.', 'error');
    } finally {
        isLoadingData.value = false;
    }
};

// Calculate stats count
const stats = computed(() => {
    const savedCount = userWishlist.value.length || 24; // Fallback to mockup value if empty
    const appliedCount = userPendaftarans.value.length || 8; // Fallback to mockup
    
    // Count interview status
    const interviewCount = userPendaftarans.value.filter(
        p => p.status_name?.toLowerCase() === 'interview' || p.status_name?.toLowerCase() === 'wawancara'
    ).length || 3;

    const resultCount = userPendaftarans.value.filter(
        p => ['lulus', 'diterima', 'ditolak', 'selesai'].includes(p.status_name?.toLowerCase())
    ).length || 2;

    return {
        saved: savedCount,
        applied: appliedCount,
        interviews: interviewCount,
        results: resultCount
    };
});

// Combined applied and wishlisted list for table tracking
const trackingList = computed(() => {
    const list = [];
    
    // Add applied items
    userPendaftarans.value.forEach(p => {
        list.push({
            id: p.pendaftaran_id,
            rawId: p.pendaftaran_id,
            title: p.program_title,
            type: p.program_type || 'Beasiswa',
            source: 'applied',
            status: p.status_name || 'Applied',
            deadline: '15 Oct 2024',
            daysLeft: '12 Days Left',
            date: p.tanggal_daftar
        });
    });

    // Add wishlisted items
    userWishlist.value.forEach(w => {
        list.push({
            id: `w-${w.wishlist_id}`,
            rawId: w.wishlist_id,
            title: w.program_title,
            type: w.program_type || 'Beasiswa',
            source: 'saved',
            status: 'Saved',
            deadline: '12 Dec 2024',
            daysLeft: '69 Days Left',
            date: new Date()
        });
    });

    // Fallback Mockup Data if no entries exist
    if (list.length === 0) {
        return [
            {
                id: 'mock-1',
                title: 'Global Future Leaders 2024',
                type: 'Beasiswa',
                status: 'Interview',
                deadline: '15 Oct 2024',
                daysLeft: '12 Days Left',
                source: 'applied'
            },
            {
                id: 'mock-2',
                title: 'STEM Innovation Challenge',
                type: 'Lomba',
                status: 'Applied',
                deadline: '01 Nov 2024',
                daysLeft: '28 Days Left',
                source: 'applied'
            },
            {
                id: 'mock-3',
                title: 'National Art Scholarship',
                type: 'Beasiswa',
                status: 'Saved',
                deadline: '12 Dec 2024',
                daysLeft: '69 Days Left',
                source: 'saved'
            }
        ];
    }

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

// Action: Cancel or delete application/saved
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
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Programs</h1>
                <p class="text-sm font-medium text-slate-500">
                    Pantau status pendaftaran beasiswa dan kompetisi aktif Anda di satu tempat.
                </p>
            </div>

            <!-- Stats Matrix Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Saved -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved</span>
                        <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800">{{ stats.saved }}</span>
                        <span class="text-[10px] font-bold text-slate-400">programs</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                </div>

                <!-- Applied -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Applied</span>
                        <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">+5%</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800">{{ stats.applied }}</span>
                        <span class="text-[10px] font-bold text-slate-400">submissions</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                    </div>
                </div>

                <!-- Interviews -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Interviews</span>
                        <span class="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">Stable</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800">{{ stats.interviews }}</span>
                        <span class="text-[10px] font-bold text-slate-400">interviews</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                </div>

                <!-- Results -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Results</span>
                        <span class="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">New</span>
                    </div>
                    <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-black text-slate-800">{{ stats.results }}</span>
                        <span class="text-[10px] font-bold text-slate-400">decisions</span>
                    </div>
                    <div class="absolute -right-3 -bottom-3 text-slate-50 opacity-5 group-hover:scale-110 transition duration-300 pointer-events-none">
                        <svg class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Active Trackings Table Container -->
            <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <!-- Table Header Controls -->
                <div class="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 class="text-lg font-black text-slate-800">Active Trackings</h2>
                    
                    <div class="flex flex-col sm:flex-row items-center gap-3">
                        <!-- Filters -->
                        <div class="flex rounded-xl bg-slate-100 p-1 w-full sm:w-auto">
                            <button
                                v-for="filt in ['All', 'Scholarships', 'Competitions']"
                                :key="filt"
                                type="button"
                                @click="activeFilter = filt; currentPage = 1"
                                class="px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none"
                                :class="activeFilter === filt ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                            >
                                {{ filt }}
                            </button>
                        </div>

                        <!-- Search Box -->
                        <div class="relative w-full sm:w-64">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                v-model="search"
                                placeholder="Search Insights..."
                                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 transition outline-none"
                            />
                        </div>
                    </div>
                </div>

                <!-- Table Content -->
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse text-left">
                        <thead>
                            <tr class="border-b border-slate-50 bg-slate-50/20 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                <th class="py-4 px-6">Program Name</th>
                                <th class="py-4 px-6">Type</th>
                                <th class="py-4 px-6">Status</th>
                                <th class="py-4 px-6">Deadline</th>
                                <th class="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 text-xs">
                            <tr v-for="item in paginatedTrackings" :key="item.id" class="hover:bg-slate-50/30 transition duration-150">
                                <!-- Program Name -->
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        <div class="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 font-bold uppercase text-[10px]">
                                            {{ item.title ? item.title.slice(0,2) : 'SP' }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 leading-snug">{{ item.title }}</p>
                                            <p class="text-[10px] font-bold text-slate-400 mt-0.5">ScholarPath Partner</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Type -->
                                <td class="py-4 px-6 font-bold text-slate-500">
                                    {{ item.type }}
                                </td>

                                <!-- Status Badge -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100': item.status?.toLowerCase() === 'interview' || item.status?.toLowerCase() === 'wawancara',
                                            'bg-blue-50 text-blue-700 border-blue-100': item.status?.toLowerCase() === 'applied' || item.status?.toLowerCase() === 'daftar',
                                            'bg-slate-50 text-slate-600 border-slate-100': item.status?.toLowerCase() === 'saved' || item.status?.toLowerCase() === 'simpan'
                                        }"
                                    >
                                        <span class="h-1.5 w-1.5 rounded-full"
                                            :class="{
                                                'bg-emerald-500': item.status?.toLowerCase() === 'interview' || item.status?.toLowerCase() === 'wawancara',
                                                'bg-blue-500': item.status?.toLowerCase() === 'applied' || item.status?.toLowerCase() === 'daftar',
                                                'bg-slate-400': item.status?.toLowerCase() === 'saved' || item.status?.toLowerCase() === 'simpan'
                                            }"
                                        ></span>
                                        {{ item.status }}
                                    </span>
                                </td>

                                <!-- Deadline -->
                                <td class="py-4 px-6">
                                    <p class="font-bold text-slate-700">{{ item.deadline }}</p>
                                    <p class="text-[10px] font-bold text-red-500 mt-0.5">{{ item.daysLeft }}</p>
                                </td>

                                <!-- Actions -->
                                <td class="py-4 px-6 text-right space-x-2">
                                    <button
                                        type="button"
                                        @click="selectedProgram = item"
                                        class="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
                                    >
                                        View Detail
                                    </button>
                                    <span class="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        :disabled="isSubmittingAction"
                                        @click="handleDeleteItem(item)"
                                        class="text-red-500 hover:text-red-600 font-bold hover:underline disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="filteredTrackings.length === 0">
                                <td colspan="5" class="py-12 text-center text-slate-400 font-bold">
                                    Tidak ada data pendaftaran aktif ditemukan.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table Pagination -->
                <div class="p-6 border-t border-slate-50 flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-400">
                        Showing {{ Math.min(filteredTrackings.length, (currentPage - 1) * itemsPerPage + 1) }} to {{ Math.min(filteredTrackings.length, currentPage * itemsPerPage) }} of {{ filteredTrackings.length }} programs
                    </span>

                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            :disabled="currentPage === 1"
                            @click="currentPage--"
                            class="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 transition cursor-pointer"
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
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                : 'border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-800'"
                        >
                            {{ pg }}
                        </button>
                        <button
                            type="button"
                            :disabled="currentPage === totalPages"
                            @click="currentPage++"
                            class="h-8 w-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 transition cursor-pointer"
                        >
                            <span>&gt;</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Detail Modal -->
            <transition name="fade">
                <div v-if="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <!-- Close on Backdrop Click -->
                    <div class="absolute inset-0" @click="selectedProgram = null"></div>

                    <!-- Modal Shell -->
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white"
                                :class="selectedProgram.type === 'Beasiswa' ? 'bg-rose-500' : 'bg-violet-500'"
                            >
                                {{ selectedProgram.type }}
                            </span>
                            <button type="button" @click="selectedProgram = null" class="text-slate-400 hover:text-slate-600 transition">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-xl font-extrabold text-slate-800">
                                {{ selectedProgram.title }}
                            </h3>
                            <p class="text-xs leading-relaxed text-slate-500 font-semibold">
                                Program yang Anda ikuti melalui kemitraan strategis ScholarPath dengan institusi pendidikan nasional dan internasional.
                            </p>
                            
                            <!-- Additional Metadata -->
                            <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600 font-bold">
                                <div class="flex justify-between">
                                    <span>Tipe Program</span>
                                    <span class="text-slate-800">{{ selectedProgram.type }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Status Terkini</span>
                                    <span class="text-slate-800 uppercase text-[10px] tracking-wider">{{ selectedProgram.status }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Batas Pendaftaran</span>
                                    <span class="text-slate-800">{{ selectedProgram.deadline }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 pt-6 mt-6 border-t border-slate-50">
                            <button
                                type="button"
                                @click="selectedProgram = null"
                                class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-100 transition duration-200 cursor-pointer"
                            >
                                Tutup Detail
                            </button>
                        </div>
                    </div>
                </div>
            </transition>

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
