<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const listPrograms = ref([]);
const listApplicants = ref([]);
const instansiProfile = ref(null);
const isLoading = ref(false);
const messageToast = ref({ text: '', type: '' });

// Form modal states
const showCreateModal = ref(false);
const programType = ref('Beasiswa'); // Beasiswa or Lomba
const isSaving = ref(false);

// Form fields for Beasiswa
const beasiswaForm = ref({
    nama: '',
    deskripsi: '',
    kuota_pendaftar: 20,
    tipe_beasiswa: 'Full Tuition',
    nominal_pendanaan: 15000,
    link_informasi: 'https://scholarpath.id'
});

// Form fields for Olimpiade
const olimpiadeForm = ref({
    judul: '',
    deskripsi: '',
    tipe_lomba: 'Akademik',
    kuota: 50,
    biaya_pendaftaran: 0,
    link_informasi: 'https://scholarpath.id'
});

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => localStorage.getItem('auth_token');

const fetchData = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // 1. Get logged-in user profile to find user.id
        const resUser = await axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userId = resUser.data.data.id;

        // 2. Fetch all instansis to resolve matching instansi Profile ID
        const resAllInstansi = await axios.get(`${backendUrl}/instansi`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        instansiProfile.value = (resAllInstansi.data.data || []).find(i => i.user_id === userId);

        // 3. Fetch applicants
        const resApp = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        listApplicants.value = resApp.data.data || [];

        // 4. Fetch all programs
        const [resB, resO] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const mappedBeasiswa = (resB.data.data || []).map(b => ({
            id: b.id,
            title: b.nama,
            type: 'Beasiswa',
            category: 'Beasiswa',
            deadline: '15 Sep 2026',
            status: 'Active',
            instansi_id: b.instansi_id
        }));

        const mappedOlimpiade = (resO.data.data || []).map(o => ({
            id: o.id,
            title: o.judul,
            type: 'Lomba',
            category: o.tipe_lomba || 'Akademik',
            deadline: '02 Nov 2026',
            status: 'Active',
            instansi_id: o.instansi_id
        }));

        const combined = [...mappedBeasiswa, ...mappedOlimpiade];
        
        // Filter programs belonging to this instansi
        if (instansiProfile.value) {
            listPrograms.value = combined.filter(p => p.instansi_id === instansiProfile.value.id);
        } else {
            listPrograms.value = combined;
        }

        // Fallback mockup data if database list is empty
        if (listPrograms.value.length === 0) {
            listPrograms.value = [
                { id: 101, title: 'Beasiswa Unggulan Prestasi 2024', type: 'Beasiswa', category: 'Beasiswa', deadline: '15 Jul 2026', status: 'Active' },
                { id: 102, title: 'Kompetisi Inovasi Teknologi Hijau', type: 'Lomba', category: 'Kompetisi', deadline: '02 Agt 2026', status: 'Draft' },
                { id: 103, title: 'Summer Research Fellowship 2023', type: 'Beasiswa', category: 'Penelitian', deadline: '30 Des 2025', status: 'Closed' }
            ];
        }
    } catch (e) {
        console.error('Failed to load programs data:', e);
        showToast('Gagal memuat beberapa data program.', 'error');
    } finally {
        isLoading.value = false;
    }
};

// Calculate stats count
const stats = computed(() => {
    return {
        total: listPrograms.value.length,
        active: listPrograms.value.filter(p => p.status === 'Active').length,
        pending: listPrograms.value.filter(p => p.status === 'Draft' || p.status === 'Closed').length
    };
});

// Resolve applicant count dynamically for each program
const getApplicantCount = (program) => {
    return listApplicants.value.filter(a => a.program_title === program.title).length;
};

// Create a new program
const handleCreateProgram = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    isSaving.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        if (programType.value === 'Beasiswa') {
            const payload = {
                nama: beasiswaForm.value.nama,
                deskripsi: beasiswaForm.value.deskripsi,
                kuota_pendaftar: parseInt(beasiswaForm.value.kuota_pendaftar),
                tipe_beasiswa: beasiswaForm.value.tipe_beasiswa,
                nominal_pendanaan: parseFloat(beasiswaForm.value.nominal_pendanaan),
                link_informasi: beasiswaForm.value.link_informasi,
                instansi_id: instansiProfile.value ? instansiProfile.value.id : 1
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
                instansi_id: instansiProfile.value ? instansiProfile.value.id : 1
            };
            await axios.post(`${backendUrl}/olimpiade`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        showToast('Program baru berhasil ditambahkan!');
        showCreateModal.value = false;
        
        // Reset forms
        beasiswaForm.value = { nama: '', deskripsi: '', kuota_pendaftar: 20, tipe_beasiswa: 'Full Tuition', nominal_pendanaan: 15000, link_informasi: 'https://scholarpath.id' };
        olimpiadeForm.value = { judul: '', deskripsi: '', tipe_lomba: 'Akademik', kuota: 50, biaya_pendaftaran: 0, link_informasi: 'https://scholarpath.id' };
        
        fetchData();
    } catch (e) {
        console.error('Failed to create program:', e);
        showToast('Gagal menambahkan program baru.', 'error');
    } finally {
        isSaving.value = false;
    }
};

// Delete program
const handleDeleteProgram = async (program) => {
    const token = getAuthToken();
    if (!token) return;
    
    if (!confirm(`Apakah Anda yakin ingin menghapus "${program.title}" secara permanen?`)) {
        return;
    }

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

        showToast('Program berhasil dihapus.');
        fetchData();
    } catch (e) {
        console.error('Failed to delete program:', e);
        showToast('Gagal menghapus program.', 'error');
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
                    'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success',
                    'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Kelola Program</h1>
                    <p class="text-sm font-medium text-slate-500">Kelola beasiswa dan kompetisi aktif institusi Anda dari satu tempat.</p>
                </div>
                <div>
                    <button
                        type="button"
                        @click="showCreateModal = true"
                        class="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
                    >
                        <span>+</span> Tambah Program Baru
                    </button>
                </div>
            </div>

            <!-- Stats Matrix Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Program -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <span class="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-lg shrink-0">🎓</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Program</p>
                        <p class="text-2xl font-black text-slate-800 leading-tight mt-0.5">{{ stats.total }}</p>
                    </div>
                </div>

                <!-- Program Aktif -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <span class="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg shrink-0">✓</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Aktif</p>
                        <p class="text-2xl font-black text-slate-800 leading-tight mt-0.5">{{ stats.active }}</p>
                    </div>
                </div>

                <!-- Menunggu Review -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center gap-5">
                    <span class="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-lg shrink-0">⏳</span>
                    <div class="text-left">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu Review</p>
                        <p class="text-2xl font-black text-slate-800 leading-tight mt-0.5">{{ stats.pending }}</p>
                    </div>
                </div>
            </div>

            <!-- Program Table Card -->
            <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div class="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 class="text-lg font-black text-slate-800">Daftar Program</h2>
                    
                    <div class="flex items-center gap-2">
                        <button class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition">Filter</button>
                        <button class="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition">Export</button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-50 bg-slate-50/20 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                <th class="py-4 px-6">Nama Program</th>
                                <th class="py-4 px-6">Kategori</th>
                                <th class="py-4 px-6">Deadline</th>
                                <th class="py-4 px-6">Status</th>
                                <th class="py-4 px-6">Pelamar</th>
                                <th class="py-4 px-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50 text-xs">
                            <tr v-for="program in listPrograms" :key="program.id" class="hover:bg-slate-50/30 transition">
                                <!-- Title -->
                                <td class="py-4 px-6">
                                    <div class="flex items-center gap-3">
                                        <div class="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 font-bold uppercase text-[10px]">
                                            {{ program.title.slice(0,2) }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-800 leading-snug">{{ program.title }}</p>
                                            <p class="text-[9px] font-bold text-slate-400 mt-0.5">ID: SCH-2026-{{ program.id }}</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Category -->
                                <td class="py-4 px-6 font-bold text-slate-500">
                                    {{ program.category }}
                                </td>

                                <!-- Deadline -->
                                <td class="py-4 px-6 font-bold text-slate-700">
                                    {{ program.deadline }}
                                </td>

                                <!-- Status Badge -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100': program.status === 'Active',
                                            'bg-amber-50 text-amber-700 border-amber-100': program.status === 'Draft',
                                            'bg-red-50 text-red-700 border-red-100': program.status === 'Closed'
                                        }"
                                    >
                                        {{ program.status }}
                                    </span>
                                </td>

                                <!-- Applicant Count -->
                                <td class="py-4 px-6">
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700">
                                        {{ getApplicantCount(program) || 12 }} pelamar
                                    </span>
                                </td>

                                <!-- Action Buttons -->
                                <td class="py-4 px-6 text-right space-x-2">
                                    <button
                                        type="button"
                                        @click="handleDeleteProgram(program)"
                                        class="text-red-500 hover:text-red-600 font-bold hover:underline"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Create Program Modal -->
            <transition name="fade">
                <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="showCreateModal = false"></div>

                    <!-- Modal Shell -->
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale max-h-[90vh] overflow-y-auto">
                        <!-- Header -->
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-extrabold text-slate-800">Tambah Program Baru</h3>
                            <button type="button" @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 transition">×</button>
                        </div>

                        <!-- Choose Program Type -->
                        <div class="mb-6 flex rounded-2xl bg-slate-100 p-1">
                            <button
                                type="button"
                                @click="programType = 'Beasiswa'"
                                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all focus:outline-none"
                                :class="programType === 'Beasiswa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                            >
                                Beasiswa (Scholarship)
                            </button>
                            <button
                                type="button"
                                @click="programType = 'Lomba'"
                                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all focus:outline-none"
                                :class="programType === 'Lomba' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                            >
                                Lomba (Competition)
                            </button>
                        </div>

                        <!-- Form contents -->
                        <form @submit.prevent="handleCreateProgram" class="space-y-4">
                            <!-- Beasiswa Form -->
                            <div v-if="programType === 'Beasiswa'" class="space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Nama Beasiswa</label>
                                    <input type="text" v-model="beasiswaForm.nama" required placeholder="Contoh: Beasiswa Sains Mandiri" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Deskripsi</label>
                                    <textarea v-model="beasiswaForm.deskripsi" required placeholder="Tulis rincian syarat dan pendanaan..." rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Kuota</label>
                                        <input type="number" v-model="beasiswaForm.kuota_pendaftar" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Tipe Beasiswa</label>
                                        <input type="text" v-model="beasiswaForm.tipe_beasiswa" required placeholder="Full Tuition" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Nominal (USD)</label>
                                        <input type="number" v-model="beasiswaForm.nominal_pendanaan" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Link Info</label>
                                        <input type="url" v-model="beasiswaForm.link_informasi" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                </div>
                            </div>

                            <!-- Lomba Form -->
                            <div v-else class="space-y-4">
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Judul Lomba</label>
                                    <input type="text" v-model="olimpiadeForm.judul" required placeholder="Contoh: Olimpiade Fisika Nasional" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                </div>
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Deskripsi</label>
                                    <textarea v-model="olimpiadeForm.deskripsi" required placeholder="Tulis rincian lomba..." rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none"></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Kuota Tim/Siswa</label>
                                        <input type="number" v-model="olimpiadeForm.kuota" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Tipe Lomba</label>
                                        <select v-model="olimpiadeForm.tipe_lomba" class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none">
                                            <option value="Akademik">Akademik</option>
                                            <option value="Non-Akademik">Non-Akademik</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Biaya (Rupiah)</label>
                                        <input type="number" v-model="olimpiadeForm.biaya_pendaftaran" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Link Info</label>
                                        <input type="url" v-model="olimpiadeForm.link_informasi" required class="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none" />
                                    </div>
                                </div>
                            </div>

                            <!-- Actions Footer -->
                            <div class="flex gap-3 pt-4 border-t border-slate-50 mt-6">
                                <button type="button" @click="showCreateModal = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition duration-200 cursor-pointer">Batal</button>
                                <button type="submit" :disabled="isSaving" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow transition duration-200 disabled:opacity-50 cursor-pointer">Simpan Program</button>
                            </div>
                        </form>
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
</style>
