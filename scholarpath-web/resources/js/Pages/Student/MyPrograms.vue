<script setup>
import { ref, onMounted, computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import StudentLayout from '@/Layouts/StudentLayout.vue';
import Card from '@/Components/Card.vue';
import { Bookmark, Send, MessageSquare, Trophy, Search, ChevronLeft, ChevronRight, Filter, Eye } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const activeTab = ref('All');
const searchQuery = ref('');

const programs = ref([]);

const stats = computed(() => {
    const pendaftaran = programs.value.filter(p => p.id.startsWith('p_'));
    const wishlist = programs.value.filter(p => p.id.startsWith('w_'));
    
    return {
        saved: wishlist.length,
        applied: pendaftaran.length,
        ditolak: pendaftaran.filter(p => ['tolak', 'reject', 'tidak lolos'].some(s => p.status.toLowerCase().includes(s))).length,
        diterima: pendaftaran.filter(p => ['lolos', 'accept', 'approved', 'diterima'].some(s => p.status.toLowerCase().includes(s))).length
    };
});

const getStatusColor = (statusName) => {
    if (!statusName) return 'text-slate-600 bg-slate-100';
    const s = statusName.toLowerCase();
    if (s.includes('lolos') || s.includes('accept') || s.includes('approved')) return 'text-green-600 bg-green-50';
    if (s.includes('tolak') || s.includes('reject')) return 'text-red-600 bg-red-50';
    if (s.includes('reviewing') || s.includes('pending')) return 'text-yellow-600 bg-yellow-50';
    return 'text-slate-600 bg-slate-100';
};

const getDotColor = (statusName) => {
    if (!statusName) return 'bg-slate-400';
    const s = statusName.toLowerCase();
    if (s.includes('lolos') || s.includes('accept') || s.includes('approved')) return 'bg-green-500';
    if (s.includes('tolak') || s.includes('reject')) return 'bg-red-500';
    if (s.includes('reviewing') || s.includes('pending')) return 'bg-yellow-500';
    return 'bg-slate-400';
};

const loading = ref(false);

onMounted(async () => {
    loading.value = true;
    try {
        // Fetch from Go Backend API
        const [wishlistRes, pendaftaranRes, beasiswaRes, olimpiadeRes] = await Promise.all([
            backendApi.get('/user/wishlist').catch(() => ({ data: [] })),
            backendApi.get('/user/pendaftaran').catch(() => ({ data: [] })),
            backendApi.get('/beasiswa').catch(() => ({ data: { data: [] } })),
            backendApi.get('/olimpiade').catch(() => ({ data: { data: [] } }))
        ]);

        const allPrograms = [
            ...(beasiswaRes.data?.data || []).map(p => ({...p, type: 'Beasiswa'})),
            ...(olimpiadeRes.data?.data || []).map(p => ({...p, type: 'Olimpiade'}))
        ];

        const mappedPendaftaran = (pendaftaranRes.data?.data || []).map(p => ({
            id: 'p_' + p.pendaftaran_id,
            name: p.program_title,
            provider: 'Registered Institution',
            type: p.program_type,
            status: p.status_name || 'Pending',
            statusColor: getStatusColor(p.status_name || 'Pending'),
            dotColor: getDotColor(p.status_name || 'Pending'),
            deadline: p.tanggal_daftar ? new Date(p.tanggal_daftar).toLocaleDateString('id-ID') : '-',
            daysLeft: 0,
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.program_title.substring(0, 2))}&background=random&color=fff`
        }));

        const mappedWishlist = (wishlistRes.data?.data || []).map(w => {
            const originalProgram = allPrograms.find(p => p.id === w.program_id && p.type === w.program_type) || {};
            const deadline = originalProgram.end_date ? new Date(originalProgram.end_date).toLocaleDateString('id-ID') : '-';
            
            return {
                id: 'w_' + w.wishlist_id,
                name: w.program_title,
                provider: originalProgram.instansi?.name || 'Saved Program',
                type: w.program_type,
                status: 'Saved',
                statusColor: 'text-slate-600 bg-slate-100',
                dotColor: 'bg-slate-400',
                deadline: deadline,
                daysLeft: 0,
                logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(w.program_title.substring(0, 2))}&background=random&color=fff`,
                originalProgram: originalProgram
            };
        });

        programs.value = [...mappedPendaftaran, ...mappedWishlist];
    } catch (error) {
        console.error('Failed to fetch user programs:', error);
    } finally {
        loading.value = false;
    }
});

const filteredPrograms = computed(() => {
    let result = programs.value;

    if (activeTab.value !== 'All') {
        const typeFilter = activeTab.value === 'Scholarships' ? 'Beasiswa' : 'Lomba';
        result = result.filter(p => p.type === typeFilter);
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q));
    }

    return result;
});
</script>

<template>
    <StudentLayout>
        <Head title="My Programs" />

        <div class="max-w-7xl mx-auto space-y-8 pb-12">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-brand-700 tracking-tight">My Programs</h1>
                    <p class="text-slate-500 mt-2 max-w-xl text-sm">Track your scholarship applications and upcoming competitions in one place.</p>
                </div>
                
                <div class="relative w-full md:w-80">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search class="h-4 w-4 text-slate-400" />
                    </div>
                    <input v-model="searchQuery" type="text" class="block w-full pl-10 pr-3 py-2.5 border-0 bg-white rounded-full text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6" placeholder="Search insights..." />
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Saved -->
                <div class="bg-white rounded-2xl p-6 border-l-4 border-l-blue-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div class="flex justify-between items-start mb-4 relative">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Bookmark class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="relative">
                        <p class="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Saved</p>
                        <h3 class="text-3xl font-black text-slate-900">{{ stats.saved.toString().padStart(2, '0') }}</h3>
                    </div>
                </div>

                <!-- Applied -->
                <div class="bg-white rounded-2xl p-6 border-l-4 border-l-purple-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div class="flex justify-between items-start mb-4 relative">
                        <div class="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Send class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="relative">
                        <p class="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Applied</p>
                        <h3 class="text-3xl font-black text-slate-900">{{ stats.applied.toString().padStart(2, '0') }}</h3>
                    </div>
                </div>

                <!-- Ditolak -->
                <div class="bg-white rounded-2xl p-6 border-l-4 border-l-red-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div class="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div class="flex justify-between items-start mb-4 relative">
                        <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                            <MessageSquare class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="relative">
                        <p class="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Ditolak</p>
                        <h3 class="text-3xl font-black text-slate-900">{{ stats.ditolak.toString().padStart(2, '0') }}</h3>
                    </div>
                </div>

                <!-- Diterima -->
                <div class="bg-white rounded-2xl p-6 border-l-4 border-l-green-600 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div class="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-110 transition-transform"></div>
                    <div class="flex justify-between items-start mb-4 relative">
                        <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <Trophy class="w-5 h-5" />
                        </div>
                    </div>
                    <div class="relative">
                        <p class="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Diterima</p>
                        <h3 class="text-3xl font-black text-slate-900">{{ stats.diterima.toString().padStart(2, '0') }}</h3>
                    </div>
                </div>
            </div>

            <!-- Active Trackings Table -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 class="text-xl font-bold text-slate-900">Active Trackings</h2>
                    
                    <div class="flex items-center gap-2">
                        <div class="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                            <button @click="activeTab = 'All'" :class="[activeTab === 'All' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-700', 'px-4 py-1.5 rounded-md text-sm transition-all']">All</button>
                            <button @click="activeTab = 'Scholarships'" :class="[activeTab === 'Scholarships' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-700', 'px-4 py-1.5 rounded-md text-sm transition-all']">Scholarships</button>
                            <button @click="activeTab = 'Competitions'" :class="[activeTab === 'Competitions' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-slate-500 font-medium hover:text-slate-700', 'px-4 py-1.5 rounded-md text-sm transition-all']">Competitions</button>
                        </div>
                        <button class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-100 ml-2">
                            <Filter class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th class="p-4 pl-6 font-semibold w-2/5">Program Name</th>
                                <th class="p-4 font-semibold">Type</th>
                                <th class="p-4 font-semibold">Status</th>
                                <th class="p-4 font-semibold">Deadline</th>
                                <th class="p-4 pr-6 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="program in filteredPrograms" :key="program.id" class="hover:bg-slate-50/50 transition-colors">
                                <td class="p-4 pl-6">
                                    <div class="flex items-center gap-4">
                                        <img :src="program.logo" :alt="program.provider" class="w-10 h-10 rounded-lg shadow-sm border border-slate-100">
                                        <div>
                                            <p class="font-bold text-slate-900">{{ program.name }}</p>
                                            <p class="text-xs text-slate-500">{{ program.provider }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <span class="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">{{ program.type }}</span>
                                </td>
                                <td class="p-4">
                                    <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold', program.statusColor]">
                                        <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', program.dotColor]"></span>
                                        {{ program.status }}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <p class="text-sm font-bold text-slate-900">{{ program.deadline }}</p>
                                    <p v-if="program.daysLeft > 0" :class="['text-xs font-bold', program.daysLeft < 15 ? 'text-red-500' : 'text-slate-500']">{{ program.daysLeft }} Days Left</p>
                                </td>
                                <td class="p-4 pr-6 text-center">
                                    <Link :href="route('dashboard', { search: program.name })" class="inline-flex items-center justify-center px-4 py-2 border border-brand-200 text-sm font-bold rounded-lg text-brand-700 bg-white hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                                        View Detail
                                    </Link>
                                </td>
                            </tr>
                            <tr v-if="filteredPrograms.length === 0">
                                <td colspan="5" class="p-8 text-center text-slate-500">
                                    No programs found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="p-4 border-t border-slate-100 flex items-center justify-between">
                    <p class="text-xs text-slate-500 font-medium">Showing 3 of 32 programs</p>
                    <div class="flex items-center gap-1">
                        <button class="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 bg-white">
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-md bg-brand-700 text-white font-bold text-sm">
                            1
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white font-medium text-sm">
                            2
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 bg-white font-medium text-sm">
                            3
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 bg-white">
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </StudentLayout>
</template>
