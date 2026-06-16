<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const listPrograms = ref([]);
const listApplicants = ref([]);
const instansiProfile = ref(null);
const isLoading = ref(false);
const messageToast = ref({ text: '', type: '' });

// Modal states
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedProgramDetail = ref(null);
const programToDelete = ref(null);
const isSaving = ref(false);
const isDeleting = ref(false);

// Multi-step form state
const currentStep = ref(1); // 1 = program info, 2 = requirements
const programType = ref('Beasiswa'); // Beasiswa or Lomba
const activeTab = ref('Semua'); // Tabs: Semua, Aktif, Menunggu, Ditolak

// Form fields for Beasiswa
const today = new Date().toISOString().split('T')[0];

const beasiswaForm = ref({
    nama: '',
    deskripsi: '',
    kuota_pendaftar: null,
    tipe_beasiswa: 'Fully Funded',
    nominal_pendanaan: null,
    link_informasi: '',
    deadline: '',
    posterFile: null
});

// Form fields for Olimpiade
const olimpiadeForm = ref({
    judul: '',
    deskripsi: '',
    tipe_lomba: 'Sains',
    kuota: null,
    biaya_pendaftaran: null,
    link_informasi: '',
    deadline: '',
    posterFile: null
});

// Step 2: Requirements checklist
const defaultRequirements = ref([
    { id: 1, label: 'KTP / NISN', enabled: true, isDefault: true },
    { id: 2, label: 'Resume / CV', enabled: true, isDefault: true },
    { id: 3, label: 'Rapor / Transkrip Nilai', enabled: true, isDefault: true },
    { id: 4, label: 'Surat Rekomendasi', enabled: false, isDefault: true }
]);
const customRequirements = ref([]);
const newCustomRequirement = ref('');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => localStorage.getItem('auth_token');

// Check if program is active based on deadline (end_date)
const isProgramActive = (program) => {
    if (program.rawData?.status === 'rejected') return false;
    if (program.rawData?.status === 'pending') return false;
    const deadlineStr = program.deadline || program.end_date;
    if (!deadlineStr) return true; // Assume active if no deadline set
    const deadline = new Date(deadlineStr);
    return deadline > new Date() && program.rawData?.status === 'active';
};

const getProgramStatus = (program) => {
    if (program.rawData?.status === 'rejected') return 'Ditolak';
    if (program.rawData?.status === 'pending') return 'Menunggu';
    return isProgramActive(program) ? 'Aktif' : 'Non Aktif';
};

const formatDeadline = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const fetchData = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

    let userId = null;

    // 1. Get logged-in user profile
    try {
        const resUser = await axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        userId = resUser.data.data.id;
    } catch (e) {
        console.warn('Failed to load user profile:', e?.response?.status);
    }

    // 2. Try dedicated instansi/programs endpoint first
    try {
        const resPrograms = await axios.get(`${backendUrl}/instansi/programs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resPrograms.data && resPrograms.data.data) {
            listPrograms.value = (resPrograms.data.data || []).map(p => ({
                id: p.id,
                title: p.title || p.nama || p.judul,
                type: p.type || (p.kuota_pendaftar !== undefined ? 'Beasiswa' : 'Lomba'),
                category: p.category || p.tipe_beasiswa || p.tipe_lomba || 'Beasiswa',
                deadline: p.deadline || p.end_date,
                instansi_id: p.instansi_id,
                rawData: p
            }));

            // Also load applicants for count
            try {
                const resApp = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                listApplicants.value = resApp.data.data || [];
            } catch (e) { listApplicants.value = []; }

            isLoading.value = false;
            return;
        }
    } catch (e) {
        console.warn('instansi/programs not available, falling back to legacy:', e?.response?.status);
    }

    // Fallback: Legacy - fetch all instansis to resolve instansi profile
    try {
        const resAllInstansi = await axios.get(`${backendUrl}/instansi`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (userId) {
            instansiProfile.value = (resAllInstansi.data.data || []).find(i => i.user_id === userId);
        }
    } catch (e) {
        console.warn('Failed to load instansi list:', e?.response?.status);
    }

    // Fetch applicants
    try {
        const resApp = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        listApplicants.value = resApp.data.data || [];
    } catch (e) {
        console.warn('Failed to load applicants:', e?.response?.status);
        listApplicants.value = [];
    }

    // Fetch all programs (beasiswa + olimpiade)
    try {
        const [resB, resO] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const mappedBeasiswa = (resB.data.data || []).map(b => ({
            id: b.id,
            title: b.nama,
            type: 'Beasiswa',
            category: b.tipe_beasiswa || 'Beasiswa',
            deadline: b.deadline,
            instansi_id: b.instansi_id,
            rawData: b
        }));

        const mappedOlimpiade = (resO.data.data || []).map(o => ({
            id: o.id,
            title: o.judul,
            type: 'Lomba',
            category: o.tipe_lomba || 'Akademik',
            deadline: o.deadline,
            instansi_id: o.instansi_id,
            rawData: o
        }));

        const combined = [...mappedBeasiswa, ...mappedOlimpiade];

        if (instansiProfile.value) {
            listPrograms.value = combined.filter(p => p.instansi_id === instansiProfile.value.id);
        } else {
            listPrograms.value = combined;
        }
    } catch (e) {
        console.warn('Failed to load programs data:', e?.response?.status);
    }

    isLoading.value = false;
};

// Calculate stats count based on real deadline
const stats = computed(() => {
    return {
        total: listPrograms.value.length,
        active: listPrograms.value.filter(p => getProgramStatus(p) === 'Aktif').length,
        pending: listPrograms.value.filter(p => getProgramStatus(p) === 'Menunggu').length,
        rejected: listPrograms.value.filter(p => getProgramStatus(p) === 'Ditolak').length
    };
});

const filteredPrograms = computed(() => {
    if (activeTab.value === 'Semua') return listPrograms.value;
    if (activeTab.value === 'Aktif') return listPrograms.value.filter(p => getProgramStatus(p) === 'Aktif');
    if (activeTab.value === 'Menunggu') return listPrograms.value.filter(p => getProgramStatus(p) === 'Menunggu');
    if (activeTab.value === 'Ditolak') return listPrograms.value.filter(p => getProgramStatus(p) === 'Ditolak');
    return listPrograms.value;
});

const getApplicantCount = (program) => {
    return listApplicants.value.filter(a => a.program_title === program.title).length;
};

// Open view modal
const handleViewProgram = (program) => {
    selectedProgramDetail.value = program;
    showDetailModal.value = true;
};

// Confirm delete modal
const handleConfirmDelete = (program) => {
    programToDelete.value = program;
    showDeleteConfirm.value = true;
};

// Execute delete and filter from local state immediately
const handleDeleteProgram = async () => {
    const program = programToDelete.value;
    if (!program) return;

    const token = getAuthToken();
    if (!token) return;

    isDeleting.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        if (program.type === 'Beasiswa') {
            await axios.delete(`${backendUrl}/beasiswa/${program.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            await axios.delete(`${backendUrl}/olimpiade/${program.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        // Instantly remove from local state without full refetch
        listPrograms.value = listPrograms.value.filter(p => !(p.id === program.id && p.type === program.type));
        showToast('Program berhasil dihapus.');
    } catch (e) {
        console.error('Failed to delete program:', e);
        showToast('Gagal menghapus program.', 'error');
    } finally {
        isDeleting.value = false;
        showDeleteConfirm.value = false;
        programToDelete.value = null;
    }
};

// Cancel create modal with reset
const handleCancelCreate = () => {
    if (confirm('Batalkan pembuatan program? Semua data yang diisi akan hilang.')) {
        resetCreateForm();
        showCreateModal.value = false;
    }
};

const resetCreateForm = () => {
    currentStep.value = 1;
    programType.value = 'Beasiswa';
    beasiswaForm.value = {
        nama: '', deskripsi: '', kuota_pendaftar: null, tipe_beasiswa: 'Fully Funded',
        nominal_pendanaan: null, link_informasi: '', deadline: '', posterFile: null
    };
    olimpiadeForm.value = {
        judul: '', deskripsi: '', tipe_lomba: 'Sains', kuota: null,
        biaya_pendaftaran: null, link_informasi: '', deadline: '', posterFile: null
    };
    defaultRequirements.value = [
        { id: 1, label: 'KTP / NISN', enabled: true, isDefault: true },
        { id: 2, label: 'Resume / CV', enabled: true, isDefault: true },
        { id: 3, label: 'Rapor / Transkrip Nilai', enabled: true, isDefault: true },
        { id: 4, label: 'Surat Rekomendasi', enabled: false, isDefault: true }
    ];
    customRequirements.value = [];
    newCustomRequirement.value = '';
};

const addCustomRequirement = () => {
    const label = newCustomRequirement.value.trim();
    if (!label) return;
    const nextId = Date.now();
    customRequirements.value.push({ id: nextId, label, enabled: true });
    newCustomRequirement.value = '';
};

const removeCustomRequirement = (id) => {
    customRequirements.value = customRequirements.value.filter(r => r.id !== id);
};

const goToStep2 = () => {
    const form = programType.value === 'Beasiswa' ? beasiswaForm.value : olimpiadeForm.value;
    const nameField = programType.value === 'Beasiswa' ? form.nama : form.judul;
    const typeField = programType.value === 'Beasiswa' ? form.tipe_beasiswa : form.tipe_lomba;
    const quotaField = programType.value === 'Beasiswa' ? form.kuota_pendaftar : form.kuota;
    const amountField = programType.value === 'Beasiswa' ? form.nominal_pendanaan : form.biaya_pendaftaran;
    
    if (!nameField || !form.deskripsi || !form.deadline || !typeField || !quotaField || amountField === null || !form.link_informasi) {
        showToast('Harap isi semua field wajib sebelum melanjutkan.', 'error');
        return;
    }
    
    if (new Date(form.deadline) < new Date(today)) {
        showToast('Tanggal deadline tidak boleh berlalu.', 'error');
        return;
    }
    currentStep.value = 2;
};

// Create a new program (submit step 2 = final)
const handleCreateProgram = async () => {
    const token = getAuthToken();
    if (!token) return;

    isSaving.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        // Build requirements payload
        const enabledRequirements = [
            ...defaultRequirements.value.filter(r => r.enabled).map(r => r.label),
            ...customRequirements.value.filter(r => r.enabled).map(r => r.label)
        ];

        // Upload poster if exists
        let posterUrl = '';
        let currentForm = programType.value === 'Beasiswa' ? beasiswaForm.value : olimpiadeForm.value;

        if (currentForm.posterFile) {
            const formData = new FormData();
            formData.append('file', currentForm.posterFile);

            const uploadRes = await axios.post(`${backendUrl}/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            posterUrl = uploadRes.data.file_url;
        }

        if (programType.value === 'Beasiswa') {
            const payload = {
                nama: beasiswaForm.value.nama,
                deskripsi: beasiswaForm.value.deskripsi,
                kuota_pendaftar: parseInt(beasiswaForm.value.kuota_pendaftar),
                tipe_beasiswa: beasiswaForm.value.tipe_beasiswa,
                nominal_pendanaan: parseFloat(beasiswaForm.value.nominal_pendanaan),
                link_informasi: beasiswaForm.value.link_informasi,
                deadline: beasiswaForm.value.deadline ? `${beasiswaForm.value.deadline}T23:59:59Z` : new Date().toISOString(),
                gambar_poster: posterUrl,
                persyaratan: enabledRequirements
            };
            await axios.post(`${backendUrl}/beasiswa`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            const payload = {
                judul: olimpiadeForm.value.judul,
                deskripsi: olimpiadeForm.value.deskripsi,
                tipe_lomba: olimpiadeForm.value.tipe_lomba,
                kuota: parseInt(olimpiadeForm.value.kuota),
                biaya_pendaftaran: parseFloat(olimpiadeForm.value.biaya_pendaftaran),
                link_informasi: olimpiadeForm.value.link_informasi,
                deadline: olimpiadeForm.value.deadline ? `${olimpiadeForm.value.deadline}T23:59:59Z` : new Date().toISOString(),
                gambar_poster: posterUrl,
                persyaratan: enabledRequirements
            };
            await axios.post(`${backendUrl}/olimpiade`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        showToast('Program berhasil diajukan! Menunggu proses verifikasi oleh Admin.', 'success');
        resetCreateForm();
        showCreateModal.value = false;
        fetchData();
    } catch (e) {
        console.error('Failed to create program:', e);
        const errorMsg = e.response?.data?.error || 'Gagal menambahkan program baru.';
        showToast(errorMsg, 'error');
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <Head title="Kelola Program" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300"
                :class="{
                    'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60': messageToast.type === 'success',
                    'bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-100 dark:border-red-800/60': messageToast.type === 'error',
                    'bg-amber-50 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-800/60': messageToast.type === 'warning'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                <span v-else-if="messageToast.type === 'error'" class="h-5 w-5 bg-red-500 dark:bg-red-600 text-white rounded-full flex items-center justify-center text-xs">×</span>
                <span v-else class="h-5 w-5 bg-amber-500 dark:bg-amber-600 text-white rounded-full flex items-center justify-center text-xs">!</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Kelola Program</h1>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Kelola beasiswa dan kompetisi aktif institusi Anda dari satu tempat.</p>
                </div>
                <div>
                    <button
                        type="button"
                        @click="showCreateModal = true; resetCreateForm()"
                        class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
                    >
                        <span>+</span> Tambah Program Baru
                    </button>
                </div>
            </div>

            <!-- Stats Matrix Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Program -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <span class="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-lg shrink-0">🎓</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Program</p>
                        <p class="text-2xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{{ stats.total }}</p>
                    </div>
                </div>

                <!-- Program Aktif -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 cursor-pointer" @click="activeTab = 'Aktif'">
                    <span class="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-lg shrink-0">✓</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Program Aktif</p>
                        <p class="text-2xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{{ stats.active }}</p>
                    </div>
                </div>

                <!-- Program Menunggu -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 cursor-pointer" @click="activeTab = 'Menunggu'">
                    <span class="h-12 w-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-lg shrink-0">⏳</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menunggu Kurasi</p>
                        <p class="text-2xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{{ stats.pending }}</p>
                    </div>
                </div>

                <!-- Program Ditolak -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 cursor-pointer" @click="activeTab = 'Ditolak'">
                    <span class="h-12 w-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center text-lg shrink-0">✖</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ditolak</p>
                        <p class="text-2xl font-black text-slate-800 dark:text-white leading-tight mt-0.5">{{ stats.rejected }}</p>
                    </div>
                </div>
            </div>

            <!-- Program Table Card -->
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                    <h2 class="text-lg font-black text-slate-800 dark:text-white">Daftar Program</h2>
                    <!-- Tabs -->
                    <div class="flex gap-2">
                        <button @click="activeTab = 'Semua'" :class="{'bg-slate-100 text-slate-800': activeTab === 'Semua', 'text-slate-500 hover:bg-slate-50': activeTab !== 'Semua'}" class="px-4 py-2 rounded-xl text-xs font-bold transition">Semua</button>
                        <button @click="activeTab = 'Menunggu'" :class="{'bg-amber-100 text-amber-800': activeTab === 'Menunggu', 'text-slate-500 hover:bg-slate-50': activeTab !== 'Menunggu'}" class="px-4 py-2 rounded-xl text-xs font-bold transition">Menunggu</button>
                        <button @click="activeTab = 'Ditolak'" :class="{'bg-red-100 text-red-800': activeTab === 'Ditolak', 'text-slate-500 hover:bg-slate-50': activeTab !== 'Ditolak'}" class="px-4 py-2 rounded-xl text-xs font-bold transition">Ditolak</button>
                    </div>
                </div>

                <!-- Loading Skeleton -->
                <div v-if="isLoading" class="p-6 space-y-4">
                    <div v-for="n in 3" :key="n" class="h-12 bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse"></div>
                </div>

                <div v-else class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-50 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                                <th class="py-4 px-6">Nama Program</th>
                                <th class="py-4 px-6">Kategori</th>
                                <th class="py-4 px-6">Deadline</th>
                                <th class="py-4 px-6">Status</th>
                                <th class="py-4 px-6">Pelamar</th>
                                <th class="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
                            <tr v-for="program in filteredPrograms" :key="`${program.type}-${program.id}`" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition">
                                <!-- Title -->
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        <div class="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">
                                            {{ (program.title || '').slice(0,2) }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 dark:text-slate-200 leading-snug">{{ program.title }}</p>
                                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">ID: SCH-2026-{{ program.id }}</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Category -->
                                <td class="py-4 px-6 font-bold text-slate-500 dark:text-slate-400">
                                    {{ program.category }}
                                </td>

                                <!-- Deadline -->
                                <td class="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">
                                    {{ formatDeadline(program.deadline) }}
                                </td>

                                <!-- Status Badge (based on real deadline) -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100': getProgramStatus(program) === 'Aktif',
                                            'bg-amber-50 text-amber-700 border-amber-100': getProgramStatus(program) === 'Menunggu',
                                            'bg-red-50 text-red-700 border-red-100': getProgramStatus(program) === 'Ditolak',
                                            'bg-slate-50 text-slate-500 border-slate-100': getProgramStatus(program) === 'Non Aktif'
                                        }"
                                    >
                                        {{ getProgramStatus(program) }}
                                    </span>
                                </td>

                                <!-- Applicant Count -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 text-[10px] font-black text-indigo-700 dark:text-indigo-400">
                                        {{ getApplicantCount(program) }} pelamar
                                    </span>
                                </td>

                                <!-- Action Buttons -->
                                <td class="py-4 px-6 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <!-- View icon -->
                                        <button
                                            type="button"
                                            @click="handleViewProgram(program)"
                                            class="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                                            title="Lihat Detail"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <!-- Delete button -->
                                        <button
                                            type="button"
                                            @click="handleConfirmDelete(program)"
                                            class="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 transition cursor-pointer"
                                            title="Hapus Program"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <!-- Empty state -->
                            <tr v-if="listPrograms.length === 0 && !isLoading">
                                <td colspan="6" class="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                                    Belum ada program. Klik "+ Tambah Program Baru" untuk memulai.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ========================================= -->
            <!-- VIEW DETAIL MODAL (Read-Only)             -->
            <!-- ========================================= -->
            <transition name="fade">
                <div v-if="showDetailModal && selectedProgramDetail" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="showDetailModal = false"></div>
                    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-md w-full relative z-10 animate-scale text-left">
                        <!-- Header -->
                        <div class="flex justify-between items-start mb-5">
                            <div>
                                <span class="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase border"
                                    :class="selectedProgramDetail.type === 'Beasiswa'
                                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50'
                                        : 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800/50'"
                                >{{ selectedProgramDetail.type }}</span>
                                <h3 class="text-base font-extrabold text-slate-800 dark:text-white mt-2 leading-snug">{{ selectedProgramDetail.title }}</h3>
                            </div>
                            <button type="button" @click="showDetailModal = false" class="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 text-xl transition">×</button>
                        </div>

                        <!-- Detail info -->
                        <div v-if="getProgramStatus(selectedProgramDetail) === 'Ditolak'" class="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50 rounded-xl p-3 text-red-700 dark:text-red-400 text-xs font-bold flex gap-2">
                            <span>✖</span>
                            <p>Program ini ditolak oleh Admin Pusat. Anda tidak dapat mengajukan ulang program ini, silakan buat pengajuan program baru dari awal.</p>
                        </div>

                        <div class="space-y-3 text-xs">
                            <div class="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 dark:border-slate-800/60">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Kategori</span>
                                <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ selectedProgramDetail.category }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 dark:border-slate-800/60">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Deadline</span>
                                <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ formatDeadline(selectedProgramDetail.deadline) }}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 dark:border-slate-800/60">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Status</span>
                                <span class="col-span-2">
                                    <span class="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100': getProgramStatus(selectedProgramDetail) === 'Aktif',
                                            'bg-amber-50 text-amber-700 border-amber-100': getProgramStatus(selectedProgramDetail) === 'Menunggu',
                                            'bg-red-50 text-red-700 border-red-100': getProgramStatus(selectedProgramDetail) === 'Ditolak',
                                            'bg-slate-50 text-slate-500 border-slate-100': getProgramStatus(selectedProgramDetail) === 'Non Aktif'
                                        }"
                                    >{{ getProgramStatus(selectedProgramDetail) }}</span>
                                </span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 py-2 border-b border-slate-50 dark:border-slate-800/60">
                                <span class="font-bold text-slate-400 dark:text-slate-500">Pelamar</span>
                                <span class="col-span-2 font-bold text-indigo-600 dark:text-indigo-400">{{ getApplicantCount(selectedProgramDetail) }} orang terdaftar</span>
                            </div>

                            <!-- Raw data fields if available -->
                            <template v-if="selectedProgramDetail.rawData">
                                <div v-if="selectedProgramDetail.rawData.deskripsi" class="py-2">
                                    <p class="font-bold text-slate-400 dark:text-slate-500 mb-1">Deskripsi</p>
                                    <p class="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{{ selectedProgramDetail.rawData.deskripsi }}</p>
                                </div>
                                <div v-if="selectedProgramDetail.rawData.kuota_pendaftar" class="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 dark:border-slate-800/60">
                                    <span class="font-bold text-slate-400 dark:text-slate-500">Kuota</span>
                                    <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">{{ selectedProgramDetail.rawData.kuota_pendaftar }} orang</span>
                                </div>
                                <div v-if="selectedProgramDetail.rawData.nominal_pendanaan" class="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 dark:border-slate-800/60">
                                    <span class="font-bold text-slate-400 dark:text-slate-500">Nominal</span>
                                    <span class="col-span-2 font-bold text-slate-700 dark:text-slate-300">Rp {{ Number(selectedProgramDetail.rawData.nominal_pendanaan).toLocaleString('id-ID') }}</span>
                                </div>
                                <div v-if="selectedProgramDetail.rawData.link_informasi" class="grid grid-cols-3 gap-2 py-2 border-t border-slate-50 dark:border-slate-800/60">
                                    <span class="font-bold text-slate-400 dark:text-slate-500">Link Info</span>
                                    <a :href="selectedProgramDetail.rawData.link_informasi" target="_blank" class="col-span-2 font-bold text-indigo-600 dark:text-indigo-400 hover:underline truncate">{{ selectedProgramDetail.rawData.link_informasi }}</a>
                                </div>
                            </template>
                        </div>

                        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            <button type="button" @click="showDetailModal = false" class="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border border-slate-100 dark:border-slate-700 transition cursor-pointer">Tutup</button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- ========================================= -->
            <!-- DELETE CONFIRM MODAL                      -->
            <!-- ========================================= -->
            <transition name="fade">
                <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="showDeleteConfirm = false; programToDelete = null"></div>
                    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full relative z-10 animate-scale text-left">
                        <div class="flex items-center gap-4 mb-4">
                            <span class="h-12 w-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center text-xl shrink-0">🗑</span>
                            <div>
                                <h3 class="text-base font-extrabold text-slate-800 dark:text-white">Hapus Program</h3>
                                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                            </div>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-300 font-semibold mb-5">
                            Apakah Anda yakin ingin menghapus "<strong>{{ programToDelete?.title }}</strong>" secara permanen?
                        </p>
                        <div class="flex gap-3">
                            <button type="button" @click="showDeleteConfirm = false; programToDelete = null" class="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border dark:border-slate-700 transition cursor-pointer">Batal</button>
                            <button type="button" @click="handleDeleteProgram" :disabled="isDeleting" class="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
                            </button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- ========================================= -->
            <!-- CREATE PROGRAM MODAL (Multi-Step)         -->
            <!-- ========================================= -->
            <transition name="fade">
                <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="handleCancelCreate"></div>

                    <!-- Modal Shell -->
                    <div class="modal-container-scroll bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale max-h-[90vh] overflow-y-auto">
                        <!-- Header -->
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-extrabold text-slate-800 dark:text-white">Tambah Program Baru</h3>
                            <button type="button" @click="handleCancelCreate" class="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 text-xl transition">×</button>
                        </div>

                        <!-- Step Progress Indicator -->
                        <div class="flex items-center gap-3 mb-6">
                            <div class="flex items-center gap-2">
                                <div class="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black"
                                    :class="currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
                                >1</div>
                                <span class="text-[10px] font-bold" :class="currentStep >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'">Info Program</span>
                            </div>
                            <div class="flex-1 h-0.5 rounded-full" :class="currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'"></div>
                            <div class="flex items-center gap-2">
                                <div class="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black"
                                    :class="currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'"
                                >2</div>
                                <span class="text-[10px] font-bold" :class="currentStep >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'">Persyaratan</span>
                            </div>
                        </div>

                        <!-- ===== STEP 1: Program Info ===== -->
                        <div v-if="currentStep === 1">
                            <!-- Program Type Toggle -->
                            <div class="mb-6 relative flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1.5 shadow-inner">
                                <!-- Active Indicator -->
                                <div class="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-900 rounded-xl shadow-sm transition-transform duration-300 ease-in-out"
                                     :class="programType === 'Beasiswa' ? 'translate-x-0' : 'translate-x-full ml-[6px]'"></div>
                                
                                <button type="button" @click="programType = 'Beasiswa'" class="relative z-10 w-1/2 py-3 text-center text-xs font-black transition-colors duration-300"
                                    :class="programType === 'Beasiswa' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
                                    🎓 Beasiswa
                                </button>
                                <button type="button" @click="programType = 'Lomba'" class="relative z-10 w-1/2 py-3 text-center text-xs font-black transition-colors duration-300"
                                    :class="programType === 'Lomba' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
                                    🏆 Olimpiade
                                </button>
                            </div>

                            <!-- Beasiswa Form -->
                            <div v-if="programType === 'Beasiswa'" class="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Nama Beasiswa *</label>
                                    <input type="text" v-model="beasiswaForm.nama" required placeholder="Contoh: Beasiswa Sains Mandiri" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Deskripsi Lengkap *</label>
                                    <textarea v-model="beasiswaForm.deskripsi" required placeholder="Tulis rincian syarat dan pendanaan..." rows="3" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Tipe Beasiswa *</label>
                                        <select v-model="beasiswaForm.tipe_beasiswa" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm appearance-none cursor-pointer">
                                            <option value="Fully Funded">Fully Funded</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Kuota Pendaftar *</label>
                                        <input type="number" v-model="beasiswaForm.kuota_pendaftar" required min="1" placeholder="Misal: 50" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div class="relative">
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Nominal Pendanaan *</label>
                                        <div class="relative flex items-center">
                                            <span class="absolute left-4 text-xs font-bold text-slate-400">Rp</span>
                                            <input type="number" v-model="beasiswaForm.nominal_pendanaan" required min="0" placeholder="0" class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Link Pendaftaran Resmi *</label>
                                        <input type="url" v-model="beasiswaForm.link_informasi" required placeholder="https://..." class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Deadline *</label>
                                        <input type="date" v-model="beasiswaForm.deadline" :min="today" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Gambar Poster (Opsional)</label>
                                        <input type="file" accept="image/*" @change="e => beasiswaForm.posterFile = e.target.files[0]" class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 shadow-sm cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <!-- Lomba Form -->
                            <div v-else class="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Judul Olimpiade *</label>
                                    <input type="text" v-model="olimpiadeForm.judul" required placeholder="Contoh: Olimpiade Sains Nasional" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Deskripsi Lengkap *</label>
                                    <textarea v-model="olimpiadeForm.deskripsi" required placeholder="Tulis rincian lomba..." rows="3" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Kategori Lomba *</label>
                                        <select v-model="olimpiadeForm.tipe_lomba" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm appearance-none cursor-pointer">
                                            <option value="Sains">Sains</option>
                                            <option value="Teknologi">Teknologi</option>
                                            <option value="Seni">Seni</option>
                                            <option value="Umum">Umum</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Kuota Tim/Siswa *</label>
                                        <input type="number" v-model="olimpiadeForm.kuota" required min="1" placeholder="Misal: 100" class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div class="relative">
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Biaya Pendaftaran *</label>
                                        <div class="relative flex items-center">
                                            <span class="absolute left-4 text-xs font-bold text-slate-400">Rp</span>
                                            <input type="number" v-model="olimpiadeForm.biaya_pendaftaran" required min="0" placeholder="0" class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Link Pendaftaran Resmi *</label>
                                        <input type="url" v-model="olimpiadeForm.link_informasi" required placeholder="https://..." class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Deadline *</label>
                                        <input type="date" v-model="olimpiadeForm.deadline" :min="today" required class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none shadow-sm" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Gambar Poster (Opsional)</label>
                                        <input type="file" accept="image/*" @change="e => olimpiadeForm.posterFile = e.target.files[0]" class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white transition outline-none file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 shadow-sm cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <!-- Step 1 Footer -->
                            <div class="flex gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/60 mt-6">
                                <button type="button" @click="handleCancelCreate" class="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border dark:border-slate-700 transition cursor-pointer">Batal</button>
                                <button type="button" @click="goToStep2" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">Lanjut: Persyaratan →</button>
                            </div>
                        </div>

                        <!-- ===== STEP 2: Requirements ===== -->
                        <div v-if="currentStep === 2">
                            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">Centang dokumen yang wajib diunggah oleh pelamar:</p>

                            <!-- Default checklist -->
                            <div class="space-y-2 mb-4">
                                <label
                                    v-for="req in defaultRequirements"
                                    :key="req.id"
                                    class="flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition"
                                    :class="req.enabled ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'"
                                >
                                    <input type="checkbox" v-model="req.enabled" class="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500/20 cursor-pointer" />
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{{ req.label }}</span>
                                    <span class="ml-auto text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">Default</span>
                                </label>
                            </div>

                            <!-- Custom requirements -->
                            <div v-if="customRequirements.length > 0" class="space-y-2 mb-4">
                                <div
                                    v-for="req in customRequirements"
                                    :key="req.id"
                                    class="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50"
                                >
                                    <input type="checkbox" v-model="req.enabled" class="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500/20 cursor-pointer" />
                                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1">{{ req.label }}</span>
                                    <button type="button" @click="removeCustomRequirement(req.id)" class="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg transition cursor-pointer leading-none">×</button>
                                </div>
                            </div>

                            <!-- Add custom requirement -->
                            <div class="flex gap-2">
                                <input
                                    v-model="newCustomRequirement"
                                    type="text"
                                    placeholder="Tambah persyaratan kustom..."
                                    @keydown.enter.prevent="addCustomRequirement"
                                    class="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white dark:placeholder-slate-500 transition outline-none"
                                />
                                <button type="button" @click="addCustomRequirement" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">+ Tambah</button>
                            </div>

                            <!-- Step 2 Footer -->
                            <div class="flex gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/60 mt-6">
                                <button type="button" @click="currentStep = 1" class="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border dark:border-slate-700 transition cursor-pointer">← Kembali</button>
                                <button type="button" @click="handleCreateProgram" :disabled="isSaving" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                    {{ isSaving ? 'Menyimpan...' : '🚀 Buat Program' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </AuthenticatedLayout>
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

/* Hide scrollbar for Chrome, Safari and Opera */
.modal-container-scroll::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.modal-container-scroll {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>
