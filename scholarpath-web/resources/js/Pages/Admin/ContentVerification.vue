<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const rawQueue = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const activeTypeFilter = ref('All');
const isActioning = ref(false);
const selectedProgram = ref(null);
const activeItem = ref(null);
const messageToast = ref({ text: '', type: '' });
const approvedToday = ref(0);
const declinedToday = ref(0);

// Modals
const showRevisionModal = ref(false);
const revisionFeedback = ref('');
const showRejectModal = ref(false);
const rejectTitle = ref('');
const rejectDesc = ref('');

const getAuthToken = () => localStorage.getItem('auth_token');
const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

// ─── COMPUTED ───────────────────────────────────────────────────────────────

// The backend also returns "Partner Account" items — filter those out here.
// Only keep content that needs content verification: Scholarship & Competition.
const contentQueue = computed(() =>
    rawQueue.value.filter(q =>
        (q.type === 'Scholarship Content' || q.type === 'Competition Content') &&
        (q.status === 'PENDING' || q.status === 'pending' || q.status === 'WAITING_APPROVAL' || q.status === 'pending-resubmit')
    )
);

const pendingCount = computed(() => contentQueue.value.length);

const scholarshipCount = computed(() => contentQueue.value.filter(q => q.type === 'Scholarship Content').length);
const competitionCount = computed(() => contentQueue.value.filter(q => q.type === 'Competition Content').length);

const filteredQueue = computed(() => {
    let list = contentQueue.value;
    if (activeTypeFilter.value !== 'All') {
        list = list.filter(q => q.type === activeTypeFilter.value);
    }
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(item =>
            item.name.toLowerCase().includes(q) ||
            (item.submission_date && item.submission_date.toLowerCase().includes(q))
        );
    }
    return [...list].sort((a, b) => new Date(a.submission_date) - new Date(b.submission_date));
});

// ─── DATA LOADING ────────────────────────────────────────────────────────────

onMounted(async () => {
    isLoading.value = true;
    const token = getAuthToken();
    if (!token) { isLoading.value = false; return; }
    try {
        const res = await axios.get(`${backendUrl}/admin/verification-queue`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data) {
            rawQueue.value = res.data.data;
        }
    } catch (e) {
        console.error('Gagal memuat antrean verifikasi konten', e);
        showToast('Gagal memuat data dari server.', 'error');
    } finally {
        isLoading.value = false;
    }
});

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────

const openDetail = async (item) => {
    if (activeItem.value?.id === item.id && activeItem.value?.type === item.type) return;
    activeItem.value = item;
    selectedProgram.value = null;
    try {
        const token = getAuthToken();
        let detailData = {};
        if (item.type === 'Scholarship Content') {
            const res = await axios.get(`${backendUrl}/beasiswa/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
            detailData = res.data?.data || {};
        } else {
            const res = await axios.get(`${backendUrl}/olimpiade/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
            detailData = res.data?.data || {};
        }
        selectedProgram.value = { ...item, ...detailData };
    } catch (e) {
        selectedProgram.value = { ...item };
    }
};

const closeDetail = () => {
    activeItem.value = null;
    selectedProgram.value = null;
};

// ─── APPROVE ─────────────────────────────────────────────────────────────────

const handleApprove = async () => {
    if (!activeItem.value || isActioning.value) return;
    isActioning.value = true;
    const token = getAuthToken();
    const url = activeItem.value.type === 'Scholarship Content'
        ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
        : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
    try {
        await axios.put(url, { status: 'active', is_visible: true }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error('Gagal approve program', e);
    }
    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id && q.type === activeItem.value.type);
    if (idx !== -1) rawQueue.value.splice(idx, 1);
    approvedToday.value++;
    showToast(`Program "${activeItem.value.name}" berhasil disetujui dan dipublikasikan! ✓`, 'success');
    closeDetail();
    isActioning.value = false;
};

// ─── REQUEST REVISION ────────────────────────────────────────────────────────

const handleRequestRevision = async () => {
    if (!revisionFeedback.value.trim() || !activeItem.value || isActioning.value) return;
    isActioning.value = true;
    const token = getAuthToken();
    const url = activeItem.value.type === 'Scholarship Content'
        ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
        : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
    try {
        await axios.put(url, { status: 'pending-resubmit', is_visible: false, alasan: revisionFeedback.value }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error('Gagal request revisi', e);
    }
    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id && q.type === activeItem.value.type);
    if (idx !== -1) rawQueue.value[idx].status = 'pending-resubmit';
    showToast('Permintaan revisi berhasil dikirim ke instansi.', 'success');
    showRevisionModal.value = false;
    revisionFeedback.value = '';
    closeDetail();
    isActioning.value = false;
};

// ─── REJECT ──────────────────────────────────────────────────────────────────

const openRejectModal = () => {
    rejectTitle.value = '';
    rejectDesc.value = '';
    showRejectModal.value = true;
};

const handleReject = async () => {
    if (!rejectTitle.value.trim() || !rejectDesc.value.trim() || !activeItem.value || isActioning.value) return;
    isActioning.value = true;
    const token = getAuthToken();
    const url = activeItem.value.type === 'Scholarship Content'
        ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
        : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
    try {
        await axios.put(url, { status: 'rejected', is_visible: false, alasan: `${rejectTitle.value}: ${rejectDesc.value}` }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error('Gagal reject program', e);
    }
    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id && q.type === activeItem.value.type);
    if (idx !== -1) rawQueue.value.splice(idx, 1);
    declinedToday.value++;
    showToast(`Program "${activeItem.value.name}" telah ditolak.`, 'success');
    showRejectModal.value = false;
    closeDetail();
    isActioning.value = false;
};
</script>

<template>
    <Head title="Verifikasi Konten" />

    <AdminLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text"
                class="fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold"
                :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success', 'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error' }">
                <span class="h-5 w-5 rounded-full flex items-center justify-center text-xs text-white"
                    :class="messageToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'">
                    {{ messageToast.type === 'success' ? '✓' : '✗' }}
                </span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-6 text-left">

            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Verifikasi Konten</h1>
                    <p class="text-sm font-medium text-slate-500">Tinjau dan verifikasi program beasiswa & kompetisi yang diajukan oleh institusi. Hanya program berstatus <strong>Pending</strong> yang ditampilkan.</p>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">⏳</div>
                    <div>
                        <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Menunggu Review</p>
                        <p class="text-2xl font-black text-slate-800">{{ pendingCount }}</p>
                    </div>
                </div>
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shrink-0">🎓</div>
                    <div>
                        <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Beasiswa</p>
                        <p class="text-2xl font-black text-slate-800">{{ scholarshipCount }}</p>
                    </div>
                </div>
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">🏆</div>
                    <div>
                        <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kompetisi</p>
                        <p class="text-2xl font-black text-slate-800">{{ competitionCount }}</p>
                    </div>
                </div>
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">✓</div>
                    <div>
                        <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Disetujui Hari Ini</p>
                        <p class="text-2xl font-black text-slate-800">{{ approvedToday }}</p>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <!-- Table Toolbar -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-50">
                    <!-- Type Filter Tabs -->
                    <div class="flex rounded-xl bg-slate-100 p-1 w-fit">
                        <button v-for="tab in [{ key: 'All', label: 'Semua' }, { key: 'Scholarship Content', label: 'Beasiswa' }, { key: 'Competition Content', label: 'Kompetisi' }]" :key="tab.key"
                            type="button" @click="activeTypeFilter = tab.key"
                            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none whitespace-nowrap"
                            :class="activeTypeFilter === tab.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                            {{ tab.label }}
                        </button>
                    </div>
                    <!-- Search -->
                    <div class="relative w-full sm:w-64">
                        <svg class="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                        </svg>
                        <input v-model="searchQuery" type="text" placeholder="Cari nama program..."
                            class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                    </div>
                </div>

                <!-- Loading Skeleton -->
                <div v-if="isLoading" class="p-6 space-y-3">
                    <div v-for="n in 4" :key="n" class="h-14 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredQueue.length === 0" class="py-20 flex flex-col items-center justify-center text-center gap-3">
                    <span class="text-5xl">🎉</span>
                    <p class="text-sm font-bold text-slate-500">
                        {{ searchQuery ? `Tidak ada program yang cocok dengan "${searchQuery}"` : 'Tidak ada program yang menunggu verifikasi saat ini.' }}
                    </p>
                    <p v-if="!searchQuery" class="text-xs font-semibold text-slate-400">Semua program telah diverifikasi.</p>
                </div>

                <!-- Data Table -->
                <div v-else class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-slate-50 bg-slate-50/60">
                                <th class="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 px-6 py-3.5">Nama Program</th>
                                <th class="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 px-4 py-3.5 hidden md:table-cell">Kategori</th>
                                <th class="text-left text-[10px] font-black uppercase tracking-wider text-slate-400 px-4 py-3.5 hidden lg:table-cell">Tgl. Pengajuan</th>
                                <th class="text-center text-[10px] font-black uppercase tracking-wider text-slate-400 px-4 py-3.5">Status</th>
                                <th class="text-right text-[10px] font-black uppercase tracking-wider text-slate-400 px-6 py-3.5">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-for="item in filteredQueue" :key="`${item.type}-${item.id}`"
                                class="hover:bg-slate-50/60 transition group">
                                <!-- Program Name -->
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                                            :class="item.type === 'Scholarship Content' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'">
                                            {{ item.type === 'Scholarship Content' ? '🎓' : '🏆' }}
                                        </div>
                                        <div class="min-w-0">
                                            <p class="text-xs font-black text-slate-800 truncate max-w-[220px] leading-tight">{{ item.name }}</p>
                                            <p class="text-[10px] font-semibold text-slate-400 mt-0.5 md:hidden">{{ item.submission_date }}</p>
                                        </div>
                                    </div>
                                </td>
                                <!-- Category -->
                                <td class="px-4 py-4 hidden md:table-cell">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border"
                                        :class="item.type === 'Scholarship Content'
                                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'">
                                        {{ item.type === 'Scholarship Content' ? 'Beasiswa' : 'Kompetisi' }}
                                    </span>
                                </td>
                                <!-- Submission Date -->
                                <td class="px-4 py-4 hidden lg:table-cell">
                                    <p class="text-xs font-bold text-slate-500">{{ item.submission_date || '-' }}</p>
                                </td>
                                <!-- Status -->
                                <td class="px-4 py-4 text-center">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide"
                                        :class="item.status === 'pending-resubmit'
                                            ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                            : 'bg-amber-50 text-amber-700 border border-amber-100'">
                                        {{ item.status === 'pending-resubmit' ? 'Re-submit' : 'Pending' }}
                                    </span>
                                </td>
                                <!-- Actions -->
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <!-- Review Detail Button -->
                                        <button type="button" @click="openDetail(item)"
                                            class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-100 transition cursor-pointer">
                                            Detail
                                        </button>
                                        <!-- Approve -->
                                        <button type="button"
                                            @click="activeItem = item; handleApprove()"
                                            :disabled="isActioning"
                                            class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition disabled:opacity-50 cursor-pointer">
                                            Setujui
                                        </button>
                                        <!-- Reject -->
                                        <button type="button"
                                            @click="activeItem = item; openRejectModal()"
                                            :disabled="isActioning"
                                            class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition disabled:opacity-50 cursor-pointer">
                                            Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table Footer -->
                <div v-if="!isLoading && filteredQueue.length > 0" class="px-6 py-3 border-t border-slate-50 flex items-center justify-between">
                    <p class="text-[11px] font-bold text-slate-400">Menampilkan {{ filteredQueue.length }} dari {{ pendingCount }} program pending.</p>
                </div>
            </div>
        </div>

        <!-- ── DETAIL SIDE PANEL ─────────────────────────────────────────── -->
        <transition name="slide-panel">
            <div v-if="activeItem" class="fixed inset-0 z-40 flex justify-end">
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeDetail"></div>
                <div class="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
                    <!-- Panel Header -->
                    <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                        <div class="flex items-center gap-3">
                            <span class="text-xl">{{ activeItem.type === 'Scholarship Content' ? '🎓' : '🏆' }}</span>
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">{{ activeItem.type === 'Scholarship Content' ? 'Beasiswa' : 'Kompetisi' }}</p>
                                <h2 class="text-sm font-black text-slate-800 leading-tight truncate max-w-[280px]">{{ activeItem.name }}</h2>
                            </div>
                        </div>
                        <button @click="closeDetail" type="button" class="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition text-xl cursor-pointer">&times;</button>
                    </div>

                    <!-- Panel Body -->
                    <div class="flex-1 p-6 space-y-6">
                        <!-- Loading -->
                        <div v-if="!selectedProgram" class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                            <svg class="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            <p class="text-xs font-bold">Memuat detail program...</p>
                        </div>

                        <!-- Detail Content -->
                        <template v-else>
                            <!-- Status Badge Row -->
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-full border"
                                    :class="activeItem.type === 'Scholarship Content' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'">
                                    {{ activeItem.type === 'Scholarship Content' ? 'Beasiswa' : 'Kompetisi' }}
                                </span>
                                <span class="px-2.5 py-1 text-[10px] font-black uppercase tracking-wide rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                    {{ activeItem.status === 'pending-resubmit' ? 'Re-submit Pending' : 'Pending Review' }}
                                </span>
                            </div>

                            <!-- Key Details Grid -->
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tgl. Pengajuan</p>
                                    <p class="text-xs font-black text-slate-800">{{ selectedProgram.submission_date || '-' }}</p>
                                </div>
                                <div class="bg-slate-50 rounded-2xl p-4 space-y-1">
                                    <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Kuota</p>
                                    <p class="text-xs font-black text-slate-800">{{ selectedProgram.kuota_pendaftar ?? selectedProgram.kuota ?? '-' }}</p>
                                </div>
                                <div class="bg-slate-50 rounded-2xl p-4 space-y-1 col-span-2">
                                    <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        {{ activeItem.type === 'Scholarship Content' ? 'Nominal Dana' : 'Biaya Pendaftaran' }}
                                    </p>
                                    <p class="text-xs font-black text-purple-600">
                                        Rp {{ Number(selectedProgram.nominal_dana ?? selectedProgram.biaya_pendaftaran ?? 0).toLocaleString('id-ID') }}
                                    </p>
                                </div>
                            </div>

                            <!-- Description -->
                            <div class="space-y-2">
                                <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Deskripsi Program</p>
                                <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                    <p class="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-wrap">
                                        {{ selectedProgram.deskripsi || selectedProgram.description || 'Deskripsi tidak tersedia.' }}
                                    </p>
                                </div>
                            </div>

                            <!-- Link -->
                            <div v-if="selectedProgram.link_informasi || selectedProgram.link" class="space-y-1">
                                <p class="text-[10px] font-black uppercase tracking-wider text-slate-400">Link Informasi</p>
                                <a :href="selectedProgram.link_informasi || selectedProgram.link" target="_blank"
                                    class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                                    {{ selectedProgram.link_informasi || selectedProgram.link }} ↗
                                </a>
                            </div>
                        </template>
                    </div>

                    <!-- Panel Footer: Action Buttons -->
                    <div v-if="selectedProgram" class="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row gap-3">
                        <button type="button" @click="handleApprove" :disabled="isActioning"
                            class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/10 transition flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                            Setujui
                        </button>
                        <button type="button" @click="showRevisionModal = true" :disabled="isActioning"
                            class="flex-1 py-3 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-300 disabled:opacity-50 text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Revisi
                        </button>
                        <button type="button" @click="openRejectModal" :disabled="isActioning"
                            class="flex-1 py-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-300 disabled:opacity-50 text-xs font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            Tolak
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ── REVISION MODAL ────────────────────────────────────────────── -->
        <transition name="fade">
            <div v-if="showRevisionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showRevisionModal = false"></div>
                <div class="relative z-10 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full animate-scale text-left">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-black text-slate-800">Ajukan Permintaan Revisi</h3>
                        <button type="button" @click="showRevisionModal = false" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">&times;</button>
                    </div>
                    <form @submit.prevent="handleRequestRevision" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Program Target</label>
                            <input type="text" :value="activeItem?.name" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold" />
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Instruksi Revisi *</label>
                            <textarea v-model="revisionFeedback" required rows="5"
                                placeholder="Jelaskan bagian apa yang perlu direvisi secara detail..."
                                class="w-full px-4 py-2.5 border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-xs text-slate-800 transition outline-none resize-none">
                            </textarea>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="showRevisionModal = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isActioning || !revisionFeedback.trim()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow transition cursor-pointer">
                                <span v-if="isActioning" class="flex items-center justify-center gap-2">
                                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    Mengirim...
                                </span>
                                <span v-else>Kirim Permintaan Revisi</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- ── REJECT MODAL ──────────────────────────────────────────────── -->
        <transition name="fade">
            <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showRejectModal = false"></div>
                <div class="relative z-10 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full animate-scale text-left">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-black text-slate-800">Tolak Program</h3>
                        <button type="button" @click="showRejectModal = false" class="text-slate-400 hover:text-slate-600 text-xl cursor-pointer">&times;</button>
                    </div>
                    <form @submit.prevent="handleReject" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Program Target</label>
                            <input type="text" :value="activeItem?.name" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold" />
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Judul Alasan Penolakan *</label>
                            <input type="text" v-model="rejectTitle" required placeholder="Contoh: Informasi Tidak Lengkap"
                                class="w-full px-4 py-2.5 border border-slate-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-xl text-xs text-slate-800 transition outline-none" />
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Deskripsi Penolakan *</label>
                            <textarea v-model="rejectDesc" required rows="4"
                                placeholder="Jelaskan alasan penolakan secara detail..."
                                class="w-full px-4 py-2.5 border border-slate-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 rounded-xl text-xs text-slate-800 transition outline-none resize-none">
                            </textarea>
                        </div>
                        <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 font-semibold">
                            ⚠ Program yang ditolak akan dihapus dari antrean dan instansi akan menerima notifikasi.
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="showRejectModal = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isActioning || !rejectTitle.trim() || !rejectDesc.trim()" class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow transition cursor-pointer">
                                <span v-if="isActioning" class="flex items-center justify-center gap-2">
                                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    Menolak...
                                </span>
                                <span v-else>Konfirmasi Tolak Program</span>
                            </button>
                        </div>
                    </form>
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

.slide-panel-enter-active, .slide-panel-leave-active { transition: opacity 0.3s ease; }
.slide-panel-enter-from, .slide-panel-leave-to { opacity: 0; }
.slide-panel-enter-active .relative, .slide-panel-leave-active .relative { transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1); }
.slide-panel-enter-from .relative { transform: translateX(100%); }
.slide-panel-leave-to .relative { transform: translateX(100%); }

.animate-scale { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
