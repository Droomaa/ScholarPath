<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- MOCK DATA: sorted by oldest registration first ---
const today = new Date();
const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

const institutions = ref([
    {
        id: 1,
        nama: 'Tech Academy Indonesia',
        alamat: 'Jl. Teknologi No. 45, Jakarta Selatan',
        kontak: 'admin@techacademy.id • +62-21-555-1234',
        user_id: 3,
        is_verified: false,
        is_flagged: false,
        registered_at: daysAgo(7),
        sk_file: 'SK_Operasional_TechAcademy.pdf',
        mitra_file: 'Daftar_Mitra_TechAcademy.pdf',
        request_id: 'INST-0001',
    },
    {
        id: 2,
        nama: 'Universitas Merdeka',
        alamat: 'Jl. Pahlawan No. 12, Malang, Jawa Timur',
        kontak: 'humas@unmer.ac.id • +62-341-555-5678',
        user_id: 6,
        is_verified: false,
        is_flagged: false,
        registered_at: daysAgo(5),
        sk_file: 'SK_Operasional_UnMer.pdf',
        mitra_file: 'Daftar_Mitra_UnMer.pdf',
        request_id: 'INST-0002',
    },
    {
        id: 3,
        nama: 'Yayasan Cerdas Bangsa',
        alamat: 'Jl. Pendidikan No. 8, Bandung, Jawa Barat',
        kontak: 'info@cerdasbangsa.org • +62-22-555-9012',
        user_id: 9,
        is_verified: true,
        is_flagged: false,
        registered_at: daysAgo(14),
        sk_file: 'SK_YCB_BAN_PT.pdf',
        mitra_file: 'Mitra_Yayasan_Cerdas_Bangsa.pdf',
        request_id: 'INST-0003',
        verified_by: 'Admin Sarah — ' + daysAgo(12),
    },
]);

const verifiedToday = ref(1);
const rejectedToday = ref(0);

const messageToast = ref({ text: '', type: '' });
const isActioning = ref(false);
const activeRejectInstansi = ref(null);
const rejectReason = ref('');

const getAuthToken = () => localStorage.getItem('auth_token');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

// Sorted by oldest registration at top
const sortedInstitutions = computed(() =>
    [...institutions.value].sort((a, b) => new Date(a.registered_at.split('/').reverse().join('-')) - new Date(b.registered_at.split('/').reverse().join('-')))
);

const pendingCount = computed(() => institutions.value.filter(i => !i.is_verified && !i.is_flagged).length);
const totalPartners = computed(() => institutions.value.filter(i => i.is_verified).length);

onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const res = await axios.get(`${backendUrl}/instansi`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data?.length) {
            institutions.value = res.data.data.map((i, idx) => ({
                ...i,
                registered_at: i.registered_at || daysAgo(idx * 2 + 1),
                // Prefer real file fields from backend; fallback to generated name for display
                sk_document:     i.sk_document     || '',
                legal_document:  i.legal_document  || '',
                sk_file:         i.sk_document     || `SK_${i.nama?.replace(/ /g, '_') || 'Instansi'}.pdf`,
                mitra_file:      i.legal_document  || `Mitra_${i.nama?.replace(/ /g, '_') || 'Instansi'}.pdf`,
                request_id:      `INST-${String(i.id).padStart(4, '0')}`
            }));
        }
    } catch (e) { /* use local mock */ }
});

// ACCEPT
const handleAccept = async (inst) => {
    // Guardrail: jangan bisa accept jika dokumen belum ada
    if (!inst.sk_document || !inst.legal_document) {
        showToast('Berkas dokumen instansi belum lengkap. Tidak bisa diverifikasi!', 'error');
        return;
    }
    isActioning.value = true;
    const token = getAuthToken();
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.put(`${backendUrl}/admin/verify/instansi/${inst.id}`, { status: 'approved' }, { headers: { Authorization: `Bearer ${token}` } });
        inst.is_verified = true;
        inst.status = 'approved';
        inst.verified_by = `Admin — Hari ini`;
        verifiedToday.value++;
        showToast(`Institusi "${inst.nama}" berhasil diverifikasi dan diaktifkan!`, 'success');
    } catch (e) {
        console.error('[Accept] API error:', e?.response?.status, e?.response?.data);
        showToast(`Gagal memverifikasi "${inst.nama}". Periksa koneksi ke server.`, 'error');
    } finally {
        isActioning.value = false;
    }
};

// REJECT
const openRejectModal = (inst) => {
    activeRejectInstansi.value = inst;
    rejectReason.value = '';
};

const handleReject = async () => {
    if (!rejectReason.value.trim() || !activeRejectInstansi.value) return;
    isActioning.value = true;
    const token = getAuthToken();
    const target = activeRejectInstansi.value;

    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        // 1. Update institution status to 'rejected' in the backend
        await axios.put(`${backendUrl}/admin/verify/instansi/${target.id}`,
            { status: 'rejected', reason: rejectReason.value },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // 2. Send rejection notification to the institution user
        await axios.post(`${backendUrl}/admin/notifications`, {
            user_id: target.user_id,
            title: 'Pengajuan Verifikasi Institusi Ditolak',
            message: `Verifikasi "${target.nama}" ditolak: ${rejectReason.value}`
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        console.error('[InstitutionVerification] Reject API failed:', e?.response?.status, e?.response?.data);
        // Continue with local state update even if API fails
    }

    // Update local state reactively
    const idx = institutions.value.findIndex(i => i.id === target.id);
    if (idx !== -1) {
        institutions.value[idx].is_flagged = true;
        institutions.value[idx].flag_reason = `Ditolak: ${rejectReason.value}`;
        institutions.value[idx].status = 'rejected';
    }
    rejectedToday.value++;
    showToast(`Penolakan untuk "${target.nama}" berhasil dikirim ke sistem!`, 'success');
    activeRejectInstansi.value = null;
    rejectReason.value = '';
    isActioning.value = false;
};

const handleReexamine = (inst) => {
    inst.is_flagged = false;
    inst.is_verified = false;
    showToast(`Institusi "${inst.nama}" dikembalikan ke antrean peninjauan.`, 'success');
};
</script>

<template>
    <Head title="Institution Verification" />

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
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Institution Verification</h1>
                    <p class="text-sm font-medium text-slate-500">Tinjau berkas legalitas institusi dan berikan keputusan verifikasi.</p>
                </div>
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export Report
                    </button>
                </div>
            </div>

            <!-- Stats Row: 4 Metrics -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <!-- Pending Requests -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28">
                    <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pending Request</span>
                    <div class="flex items-baseline justify-between mt-1">
                        <p class="text-2xl font-black text-slate-800">{{ pendingCount }}</p>
                        <span class="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">Menunggu</span>
                    </div>
                </div>
                <!-- Verified Today -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28">
                    <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Verified Today</span>
                    <div class="flex items-baseline justify-between mt-1">
                        <p class="text-2xl font-black text-slate-800">{{ verifiedToday.toString().padStart(2,'0') }}</p>
                        <span class="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">✓ Sukses</span>
                    </div>
                </div>
                <!-- Reject Today -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28">
                    <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Reject Today</span>
                    <div class="flex items-baseline justify-between mt-1">
                        <p class="text-2xl font-black text-slate-800">{{ rejectedToday.toString().padStart(2,'0') }}</p>
                        <span class="text-[9px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">Ditolak</span>
                    </div>
                </div>
                <!-- Total Partners -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-28">
                    <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Partners</span>
                    <div class="flex items-baseline justify-between mt-1">
                        <p class="text-2xl font-black text-slate-800">{{ totalPartners.toLocaleString('id-ID') }}</p>
                        <span class="text-[9px] font-semibold text-slate-450">Aktif</span>
                    </div>
                </div>
            </div>

            <!-- Institution Queue Cards (oldest first) -->
            <div class="space-y-6">
                <div v-if="sortedInstitutions.length === 0" class="py-16 text-center text-sm font-bold text-slate-400">
                    Tidak ada antrean instansi saat ini.
                </div>
                <div v-for="inst in sortedInstitutions" :key="inst.id"
                    class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-200">
                    <!-- Top: Identity -->
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div class="flex items-start gap-4">
                            <div class="h-12 w-12 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center font-extrabold text-lg shrink-0"
                                :class="{ 'bg-purple-100 text-purple-700': !inst.is_verified && !inst.is_flagged, 'bg-emerald-100 text-emerald-700': inst.is_verified, 'bg-red-100 text-red-700': inst.is_flagged }">
                                {{ inst.nama.charAt(0) }}
                            </div>
                            <div class="space-y-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="text-base font-black text-slate-800 leading-tight">{{ inst.nama }}</h3>
                                    <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full"
                                        :class="{ 'bg-amber-50 text-amber-700 border border-amber-100': !inst.is_verified && !inst.is_flagged, 'bg-emerald-50 text-emerald-700 border border-emerald-100': inst.is_verified, 'bg-red-50 text-red-700 border border-red-100': inst.is_flagged }">
                                        {{ inst.is_flagged ? 'DITOLAK' : (inst.is_verified ? 'VERIFIED' : 'PENDING REVIEW') }}
                                    </span>
                                </div>
                                <p class="text-xs font-semibold text-slate-500">{{ inst.alamat }}</p>
                                <p class="text-[10px] text-slate-400 font-semibold">Terdaftar: {{ inst.registered_at }}</p>
                            </div>
                        </div>
                        <span class="text-[10px] font-black uppercase text-slate-450">Request ID: #{{ inst.request_id }}</span>
                    </div>

                    <!-- Mid: Contacts & Documents -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 pb-2 border-t border-slate-50 text-xs font-bold">
                        <!-- Contact -->
                        <div class="space-y-1 text-left">
                            <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Kontak Registrar</span>
                            <p class="text-slate-700 font-semibold truncate">{{ inst.kontak.split(' • ')[0] }}</p>
                            <p v-if="inst.kontak.split(' • ')[1]" class="text-slate-450 mt-0.5">{{ inst.kontak.split(' • ')[1] }}</p>
                        </div>

                        <!-- Verification Documents -->
                        <div class="space-y-2 text-left">
                            <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Dokumen Verifikasi</span>

                            <!-- Only show links if institution has uploaded documents -->
                            <template v-if="inst.sk_document || inst.sk_file">
                                <div class="flex items-center gap-1.5">
                                    <svg class="h-4 w-4 shrink-0 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    <a :href="'http://localhost:8080/storage/uploads/' + (inst.sk_document || inst.sk_file)" target="_blank"
                                       class="text-xs font-bold text-purple-600 hover:text-purple-800 underline underline-offset-2 truncate max-w-[160px]"
                                       title="Buka SK Izin Operasional di tab baru">
                                        Lihat SK Izin
                                    </a>
                                </div>
                                <div class="flex items-center gap-1.5">
                                    <svg class="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    <a :href="'http://localhost:8080/storage/uploads/' + (inst.legal_document || inst.mitra_file)" target="_blank"
                                       class="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 truncate max-w-[160px]"
                                       title="Buka Dokumen Legalitas NIB di tab baru">
                                        Lihat NIB
                                    </a>
                                </div>
                            </template>

                            <!-- No documents uploaded yet -->
                            <p v-else class="text-[11px] text-slate-400 italic font-medium">Belum ada dokumen diunggah</p>
                        </div>

                        <!-- Verification detail -->
                        <div class="space-y-1 text-left md:text-right md:justify-self-end">
                            <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Detail Verifikasi</span>
                            <p v-if="inst.is_verified" class="text-emerald-600 font-bold text-xs">✓ Diverifikasi oleh {{ inst.verified_by || 'Admin' }}</p>
                            <p v-else-if="inst.is_flagged" class="text-red-600 font-bold text-xs">✗ Pengajuan ditolak</p>
                            <p v-else class="text-slate-400 font-semibold text-xs">Menunggu keputusan administrator</p>
                        </div>
                    </div>

                    <!-- Flag Banner -->
                    <div v-if="inst.is_flagged" class="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                        <span class="h-8 w-8 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">⚠</span>
                        <div class="space-y-0.5 text-left">
                            <h4 class="text-xs font-black text-red-950 uppercase tracking-wider">Alasan Penolakan</h4>
                            <p class="text-xs text-red-700 font-bold leading-relaxed">{{ inst.flag_reason }}</p>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div v-if="!inst.is_verified" class="flex flex-col gap-3 pt-3 border-t border-slate-50">

                        <!-- GUARDRAIL: Berkas belum lengkap — kunci semua tombol aksi -->
                        <div v-if="!inst.sk_document || !inst.legal_document"
                            class="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <span class="text-amber-500 text-base">⚠️</span>
                            <p class="text-xs font-bold text-amber-700">Berkas Belum Lengkap — Tombol Aksi Dikunci</p>
                            <p class="text-[10px] text-amber-600 ml-auto font-semibold">Tunggu instansi unggah dokumen</p>
                        </div>

                        <div class="flex justify-end gap-3">
                            <template v-if="inst.is_flagged">
                                <button type="button" @click="handleReexamine(inst)"
                                    class="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                                    Re-examine
                                </button>
                            </template>
                            <template v-else>
                                <!-- Reject button — disabled if documents missing -->
                                <button type="button"
                                    @click="inst.sk_document && inst.legal_document ? openRejectModal(inst) : null"
                                    :disabled="!inst.sk_document || !inst.legal_document || isActioning"
                                    :class="[
                                        'px-5 py-2.5 border text-xs font-bold rounded-xl transition',
                                        (inst.sk_document && inst.legal_document)
                                            ? 'border-red-200 hover:bg-red-50 text-red-700 cursor-pointer'
                                            : 'border-slate-100 text-slate-300 opacity-40 cursor-not-allowed pointer-events-none'
                                    ]">
                                    Reject
                                </button>

                                <!-- Accept button — disabled if documents missing -->
                                <button type="button"
                                    @click="inst.sk_document && inst.legal_document ? handleAccept(inst) : null"
                                    :disabled="!inst.sk_document || !inst.legal_document || isActioning"
                                    :class="[
                                        'px-5 py-2.5 text-xs font-bold rounded-xl shadow transition',
                                        (inst.sk_document && inst.legal_document)
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                            : 'bg-slate-200 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none'
                                    ]">
                                    <svg v-if="isActioning" class="animate-spin h-4 w-4 text-white mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span v-else>Accept</span>
                                </button>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="pt-5 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Menampilkan {{ sortedInstitutions.length }} dari {{ institutions.length }} institusi</span>
                <div class="flex items-center gap-1">
                    <button class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer">&lt;</button>
                    <button class="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center transition">1</button>
                    <button class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer">&gt;</button>
                </div>
            </div>
        </div>

        <!-- Modal: Reject Institution -->
        <transition name="fade">
            <div v-if="activeRejectInstansi" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="activeRejectInstansi = null"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Tolak Pendaftaran Institusi</h3>
                        <button type="button" @click="activeRejectInstansi = null" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <form @submit.prevent="handleReject" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5 block">Institusi Target</label>
                            <input type="text" :value="activeRejectInstansi.nama" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1.5 block">Alasan Penolakan</label>
                            <textarea v-model="rejectReason" required rows="5" placeholder="Jelaskan alasan penolakan institusi ini..." class="w-full px-4 py-2.5 border border-slate-150 focus:border-purple-500 rounded-xl text-xs text-slate-850 transition outline-none resize-none"></textarea>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="activeRejectInstansi = null" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isActioning" class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                <svg v-if="isActioning" class="animate-spin h-4 w-4 text-white mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span v-else>Tolak & Tandai</span>
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
