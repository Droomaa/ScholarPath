<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- MOCK DATA: sorted by oldest pending first ---
const today = new Date();
const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

const rawQueue = ref([]);

const approvedToday = ref(0);
const declinedToday = ref(0);
const revisionRate = ref('0%');

const activeItem = ref(null);
const selectedProgram = ref(null);
const messageToast = ref({ text: '', type: '' });
const isActioning = ref(false);

// Revision Modal
const showRevisionModal = ref(false);
const revisionFeedback = ref('');

// Reject Modal
const showRejectModal = ref(false);
const rejectTitle = ref('');
const rejectDesc = ref('');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

const getAuthToken = () => localStorage.getItem('auth_token');

// Sorted by oldest first
const sortedQueue = computed(() =>
    [...rawQueue.value].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
);

const pendingCount = computed(() => rawQueue.value.filter(q => q.status === 'pending' || q.status === 'pending-resubmit').length);

const selectItem = async (item) => { 
    activeItem.value = item; 
    selectedProgram.value = null; // Loading state
    try {
        const token = getAuthToken();
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        let detailData = {};
        
        if (item.type === 'Scholarship Content') {
            const res = await axios.get(`${backendUrl}/beasiswa/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
            detailData = res.data?.data || {};
        } else if (item.type === 'Competition Content') {
            const res = await axios.get(`${backendUrl}/olimpiade/${item.id}`, { headers: { Authorization: `Bearer ${token}` } });
            detailData = res.data?.data || {};
        }
        
        selectedProgram.value = { ...item, ...detailData };
    } catch (e) {
        selectedProgram.value = { ...item };
        console.error("Gagal menarik detail program", e);
    }
};

// Load from backend
onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const res = await axios.get(`${backendUrl}/admin/verification-queue`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) {
            rawQueue.value = res.data.data;
        }
    } catch (e) {
        console.error("Gagal menarik data antrean verifikasi", e);
    }
    if (sortedQueue.value.length > 0) {
        selectItem(sortedQueue.value[0]);
    }
});

// --- APPROVE ---
const handleApprove = async () => {
    if (!activeItem.value) return;
    isActioning.value = true;
    const token = getAuthToken();

    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const url = activeItem.value.type === 'Scholarship Content'
            ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
            : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
        await axios.put(url, { status: 'active', is_visible: true }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) { /* local fallback */ }

    // Remove from local queue
    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id);
    if (idx !== -1) rawQueue.value.splice(idx, 1);
    approvedToday.value++;
    showToast(`Program "${activeItem.value.name}" berhasil disetujui dan dipublikasikan!`, 'success');
    activeItem.value = null;
    selectedProgram.value = null;
    if (sortedQueue.value.length > 0) selectItem(sortedQueue.value[0]);
    isActioning.value = false;
};

// --- REQUEST REVISION ---
const handleRequestRevision = async () => {
    if (!revisionFeedback.value.trim() || !activeItem.value) return;
    isActioning.value = true;
    const token = getAuthToken();

    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const url = activeItem.value.type === 'Scholarship Content'
            ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
            : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
        await axios.put(url, { 
            status: 'pending-resubmit', 
            is_visible: false,
            alasan: revisionFeedback.value 
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error("Gagal mengirim request revisi", e);
    }

    // Mark as pending-resubmit (simulate re-submit behavior)
    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id);
    if (idx !== -1) rawQueue.value[idx].status = 'pending-resubmit';

    showToast(`Permintaan revisi dikirim. Program masuk status Pending Re-submit.`, 'success');
    showRevisionModal.value = false;
    revisionFeedback.value = '';
    activeItem.value = null;
    selectedProgram.value = null;
    if (sortedQueue.value.length > 0) selectItem(sortedQueue.value[0]);
    isActioning.value = false;
};

// --- REJECT (remove from list) ---
const openRejectModal = () => {
    rejectTitle.value = '';
    rejectDesc.value = '';
    showRejectModal.value = true;
};

const handleReject = async () => {
    if (!rejectTitle.value.trim() || !rejectDesc.value.trim() || !activeItem.value) return;
    isActioning.value = true;
    const token = getAuthToken();

    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const url = activeItem.value.type === 'Scholarship Content'
            ? `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`
            : `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
        await axios.put(url, { 
            status: 'rejected', 
            is_visible: false,
            alasan: `${rejectTitle.value}: ${rejectDesc.value}` 
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error("Gagal menolak program", e);
    }

    const idx = rawQueue.value.findIndex(q => q.id === activeItem.value.id);
    if (idx !== -1) rawQueue.value.splice(idx, 1);
    declinedToday.value++;
    showToast(`Program "${activeItem.value.name}" telah ditolak dan dihapus dari antrean.`, 'success');
    showRejectModal.value = false;
    activeItem.value = null;
    selectedProgram.value = null;
    if (sortedQueue.value.length > 0) selectItem(sortedQueue.value[0]);
    isActioning.value = false;
};
</script>

<template>
    <Head title="Content Verification" />

    <AdminLayout>
        <!-- Toast -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold"
                :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success', 'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error' }">
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8 text-left">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Content Verification Queue</h1>
                    <p class="text-sm font-medium text-slate-500">Tinjau dan kelola program beasiswa & kompetisi yang diajukan instansi terverifikasi.</p>
                </div>
            </div>

            <!-- Header Metric Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Queue -->
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">⏳</div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Queue</span>
                        <p class="text-xl font-black text-slate-800">{{ pendingCount }} items</p>
                    </div>
                </div>
                <!-- Approved Today -->
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">✓</div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Approved Today</span>
                        <p class="text-xl font-black text-slate-800">{{ approvedToday }} items</p>
                    </div>
                </div>
                <!-- Revision Rate -->
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">⚠</div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Revision Rate</span>
                        <p class="text-xl font-black text-slate-800">{{ revisionRate }}</p>
                    </div>
                </div>
                <!-- Decline Today -->
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm shrink-0">✗</div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Decline Today</span>
                        <p class="text-xl font-black text-slate-800">{{ declinedToday }} items</p>
                    </div>
                </div>
            </div>

            <!-- Main Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <!-- Left Panel: Active item detail -->
                <div class="lg:col-span-8 space-y-6">
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
                        <!-- Empty state / Loading state -->
                        <div v-if="!selectedProgram" class="flex-1 flex items-center justify-center py-16 text-slate-400 font-bold text-sm flex-col gap-3">
                            <span v-if="activeItem" class="animate-spin h-6 w-6 text-indigo-500"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" class="opacity-25"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></span>
                            <span>{{ activeItem ? 'Memuat detail program...' : 'Pilih item dari antrean untuk memulai peninjauan.' }}</span>
                        </div>

                        <!-- Detail view -->
                        <div v-else class="space-y-6">
                            <div class="flex justify-between items-start">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border"
                                            :class="selectedProgram.type === 'Scholarship Content' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'">
                                            {{ selectedProgram.type }}
                                        </span>
                                        <span v-if="selectedProgram.status === 'pending-resubmit'" class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                            Pending Re-submit
                                        </span>
                                    </div>
                                    <h3 class="text-lg font-black text-slate-800 leading-tight">{{ selectedProgram.name || selectedProgram.judul || selectedProgram.nama }}</h3>
                                    <p class="text-xs font-semibold text-slate-450">{{ selectedProgram.instansi || 'Instansi' }} • Submitted: {{ selectedProgram.submitted_at }}</p>
                                </div>
                                <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                    Pending
                                </span>
                            </div>

                            <!-- Two column details -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-50 py-6">
                                <!-- Program Details -->
                                <div class="space-y-4">
                                    <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400">Program Details</h4>
                                    <div class="space-y-2.5 text-xs font-bold">
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">{{ selectedProgram.type === 'Scholarship Content' ? 'Nominal Dana' : 'Biaya Pendaftaran' }}</span>
                                            <span class="text-purple-600">
                                                {{ selectedProgram.type === 'Scholarship Content'
                                                    ? `Rp ${(selectedProgram.nominal_dana || selectedProgram.nominal || 0).toLocaleString('id-ID')}`
                                                    : `Rp ${(selectedProgram.biaya_pendaftaran || selectedProgram.biaya || 0).toLocaleString('id-ID')}` }}
                                            </span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Tipe</span>
                                            <span class="text-slate-700">{{ selectedProgram.tipe_beasiswa || selectedProgram.tipe_lomba || selectedProgram.tipe || selectedProgram.type }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Kuota</span>
                                            <span class="text-slate-700">{{ selectedProgram.kuota_pendaftar || selectedProgram.kuota || selectedProgram.quota || '-' }} slots</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Link Info</span>
                                            <a :href="selectedProgram.link_informasi || selectedProgram.link || selectedProgram.info_link" target="_blank" class="text-purple-600 hover:underline truncate max-w-[120px]">
                                                {{ selectedProgram.link_informasi || selectedProgram.link || 'Lihat Website ↗' }}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="space-y-4">
                                    <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400">Deskripsi Program</h4>
                                    <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                        <p class="text-xs leading-relaxed text-slate-500 font-semibold text-justify whitespace-pre-wrap">{{ selectedProgram.deskripsi || selectedProgram.description || 'Deskripsi tidak tersedia.' }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Row: 3 buttons -->
                            <div class="flex flex-col sm:flex-row gap-3 pt-2">
                                <button type="button" @click="handleApprove" :disabled="isActioning"
                                    class="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    Approve Program
                                </button>
                                <button type="button" @click="showRevisionModal = true" :disabled="isActioning"
                                    class="flex-1 py-3.5 px-4 bg-white hover:bg-amber-50 text-amber-700 disabled:opacity-50 rounded-2xl border border-amber-200 hover:border-amber-300 transition flex items-center justify-center gap-2 cursor-pointer font-bold text-xs">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                    Request Revision
                                </button>
                                <button type="button" @click="openRejectModal" :disabled="isActioning"
                                    class="flex-1 py-3.5 px-4 bg-white hover:bg-red-50 text-red-700 disabled:opacity-50 rounded-2xl border border-red-200 hover:border-red-300 transition flex items-center justify-center gap-2 cursor-pointer font-bold text-xs">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                    Reject Program
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="lg:col-span-4 space-y-6">
                    <!-- Queue List (oldest first) -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div class="flex justify-between items-center pb-2">
                            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Queue ({{ pendingCount }})</h3>
                        </div>
                        <div class="space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
                            <div v-if="sortedQueue.length === 0" class="py-6 text-center text-xs font-bold text-slate-400">Seluruh antrean program telah selesai dikurasi. Belum ada program baru masuk.</div>
                            <div v-for="item in sortedQueue" :key="item.id"
                                @click="selectItem(item)"
                                class="p-3.5 border rounded-2xl cursor-pointer transition duration-150 flex items-center justify-between text-left group"
                                :class="activeItem?.id === item.id ? 'bg-purple-50/50 border-purple-200 shadow-sm' : 'border-slate-100 hover:bg-slate-50/50 hover:border-slate-200'">
                                <div class="flex items-center gap-3">
                                    <div class="h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                                        :class="item.type === 'Scholarship Content' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'">
                                        {{ item.name.charAt(0) }}
                                    </div>
                                    <div class="space-y-0.5">
                                        <p class="text-xs font-bold text-slate-800 truncate max-w-[150px] leading-tight">{{ item.name }}</p>
                                        <div class="flex items-center gap-1.5">
                                            <p class="text-[9px] font-semibold text-slate-400">Submitted: {{ item.submitted_at }}</p>
                                            <span v-if="item.status === 'pending-resubmit'" class="text-[8px] font-black text-orange-600 bg-orange-50 px-1 rounded">Re-submit</span>
                                        </div>
                                    </div>
                                </div>
                                <svg class="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    </div>

                    <!-- Review Guidelines -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider text-left">Review Guidelines</h4>
                        <p class="text-[11px] font-semibold text-slate-450 leading-relaxed text-justify">
                            Pastikan semua submission memenuhi standar akademik premium ScholarPath.
                        </p>
                        <div class="space-y-2.5 text-xs text-slate-700 font-bold">
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>Institutional ID Verified</span>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>No Spelling Errors</span>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>Media & Links Valid</span>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>Persyaratan Dokumen Lengkap</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Request Revision -->
        <transition name="fade">
            <div v-if="showRevisionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showRevisionModal = false"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Ajukan Permintaan Revisi</h3>
                        <button type="button" @click="showRevisionModal = false" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <form @submit.prevent="handleRequestRevision" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Program Target</label>
                            <input type="text" :value="activeItem?.name" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Instruksi Revisi untuk Instansi</label>
                            <textarea v-model="revisionFeedback" required rows="5" placeholder="Jelaskan bagian apa yang perlu direvisi..." class="w-full px-4 py-2.5 border border-slate-150 focus:border-purple-500 rounded-xl text-xs text-slate-800 transition outline-none resize-none"></textarea>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="showRevisionModal = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isActioning" class="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                <svg v-if="isActioning" class="animate-spin h-4 w-4 text-white mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span v-else>Kirim Permintaan Revisi</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Modal: Reject Program -->
        <transition name="fade">
            <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showRejectModal = false"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Tolak Program</h3>
                        <button type="button" @click="showRejectModal = false" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <form @submit.prevent="handleReject" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Program Target</label>
                            <input type="text" :value="activeItem?.name" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Judul Alasan Penolakan *</label>
                            <input type="text" v-model="rejectTitle" required placeholder="Contoh: Informasi Tidak Lengkap" class="w-full px-4 py-2.5 border border-slate-150 focus:border-red-400 rounded-xl text-xs text-slate-800 transition outline-none"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Deskripsi Penolakan *</label>
                            <textarea v-model="rejectDesc" required rows="4" placeholder="Jelaskan alasan penolakan program ini secara detail..." class="w-full px-4 py-2.5 border border-slate-150 focus:border-red-400 rounded-xl text-xs text-slate-800 transition outline-none resize-none"></textarea>
                        </div>
                        <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 font-semibold">
                            ⚠ Program yang ditolak akan dihapus dari antrean dan instansi akan menerima notifikasi penolakan.
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="showRejectModal = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isActioning" class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                <svg v-if="isActioning" class="animate-spin h-4 w-4 text-white mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
.animate-scale { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
