<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const user = ref({ id: 0, name: '', email: '' });
const instansiId = ref(null);
const isVerified = ref(false);

// Form Fields
const nama = ref('');
const alamat = ref('');
const deskripsi = ref('');
const emailResmi = ref('');
const nomorTelepon = ref('');
const website = ref('');
const instagram = ref('');
const linkedin = ref('');

const isLoading = ref(false);
const messageToast = ref({ text: '', type: '' });

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => localStorage.getItem('auth_token');

const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // 1. Get user profile details
        const resUser = await axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        user.value = resUser.data.data;

        // 2. Fetch all instansis to find this specific one
        const resAllInstansi = await axios.get(`${backendUrl}/instansi`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const matched = (resAllInstansi.data.data || []).find(i => i.user_id === user.value.id);
        if (matched) {
            instansiId.value = matched.id;
            nama.value = matched.nama || '';
            alamat.value = matched.alamat || '';
            isVerified.value = matched.is_verified || false;
            
            // Deserialize JSON from kontak field if exists
            const kontakRaw = matched.kontak || '';
            if (kontakRaw.startsWith('{')) {
                try {
                    const kontakObj = JSON.parse(kontakRaw);
                    emailResmi.value = kontakObj.email || '';
                    nomorTelepon.value = kontakObj.telepon || '';
                    website.value = kontakObj.website || '';
                    instagram.value = kontakObj.instagram || '';
                    linkedin.value = kontakObj.linkedin || '';
                    deskripsi.value = kontakObj.deskripsi || '';
                } catch (jsonErr) {
                    console.error('Failed to parse kontak JSON, falling back:', jsonErr);
                    nomorTelepon.value = kontakRaw;
                }
            } else {
                // Fallback for raw legacy kontak string (usually phone or email)
                nomorTelepon.value = kontakRaw;
                emailResmi.value = user.value.email || '';
            }
        } else {
            // New instansi fallback defaults
            nama.value = user.value.name;
            emailResmi.value = user.value.email;
        }
    } catch (e) {
        console.error('Failed to load instansi profile:', e);
    } finally {
        isLoading.value = false;
    }
};

const handleSaveProfile = async () => {
    const token = getAuthToken();
    if (!token) return;
    if (!instansiId.value) {
        showToast('Profil instansi tidak ditemukan.', 'error');
        return;
    }
    
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // Serialize extra fields into the kontak JSON structure
        const kontakData = {
            email: emailResmi.value,
            telepon: nomorTelepon.value,
            website: website.value,
            instagram: instagram.value,
            linkedin: linkedin.value,
            deskripsi: deskripsi.value
        };

        const payload = {
            nama: nama.value,
            alamat: alamat.value,
            kontak: JSON.stringify(kontakData)
        };
        
        await axios.put(`${backendUrl}/instansi/${instansiId.value}`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Profil Instansi berhasil diperbarui!');
        fetchProfile();
    } catch (e) {
        console.error('Failed to update instansi profile:', e);
        showToast('Gagal memperbarui profil instansi.', 'error');
    } finally {
        isLoading.value = false;
    }
};

// Calculate profile completeness percentage dynamically
const profileCompleteness = computed(() => {
    let score = 0;
    if (nama.value) score += 15;
    if (alamat.value) score += 15;
    if (deskripsi.value) score += 20;
    if (emailResmi.value) score += 10;
    if (nomorTelepon.value) score += 10;
    if (website.value) score += 10;
    if (instagram.value) score += 10;
    if (linkedin.value) score += 10;
    return score;
});

const previewProfile = () => {
    alert('Pratinjau profil lengkap publik sedang disiapkan.');
};
</script>

<template>
    <Head title="Profil Instansi" />

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
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Form Wrapper wrapping both buttons and panels -->
            <form @submit.prevent="handleSaveProfile" class="space-y-8 text-left">
                
                <!-- Page Header with Save Button -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profil Instansi</h1>
                        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Kelola identitas dan informasi publik instansi Anda.</p>
                    </div>
                    <div class="flex items-center gap-3 self-start sm:self-auto">
                        <button type="button" @click="previewProfile" class="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer">
                            Preview Profil
                        </button>
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                        >
                            <svg v-if="isLoading" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Simpan Perubahan
                        </button>
                    </div>
                </div>

                <!-- Two-Column Form Layout -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    <!-- Left Column (Identitas, Kontak, Lokasi) -->
                    <div class="lg:col-span-8 space-y-6">
                        
                        <!-- Identitas Instansi Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                            <h3 class="text-sm font-black text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-2.5 uppercase tracking-wide">Identitas Instansi</h3>
                            
                            <div class="flex flex-col sm:flex-row gap-5 items-start">
                                <!-- Logo container box -->
                                <div class="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 group relative overflow-hidden">
                                    🏢
                                </div>
                                <div class="space-y-4 w-full">
                                    <!-- Nama Instansi -->
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Nama Instansi</label>
                                        <input
                                            type="text"
                                            v-model="nama"
                                            required
                                            placeholder="Contoh: Universitas Teknologi Nusantara"
                                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                        />
                                    </div>
                                    
                                    <!-- Deskripsi Instansi -->
                                    <div>
                                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Deskripsi Instansi</label>
                                        <textarea
                                            v-model="deskripsi"
                                            rows="4"
                                            placeholder="Tulis profil singkat instansi Anda..."
                                            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Kontak Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 class="text-sm font-black text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-2.5 uppercase tracking-wide">Kontak</h3>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Email Resmi -->
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Email Resmi</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 text-xs pointer-events-none">✉</span>
                                        <input
                                            type="email"
                                            v-model="emailResmi"
                                            required
                                            placeholder="info@instansi.ac.id"
                                            class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                        />
                                    </div>
                                </div>

                                <!-- Nomor Telepon -->
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Nomor Telepon</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 text-xs pointer-events-none">📞</span>
                                        <input
                                            type="text"
                                            v-model="nomorTelepon"
                                            required
                                            placeholder="+62 21 555 1234"
                                            class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <!-- Website -->
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Website</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 text-xs pointer-events-none">🌐</span>
                                    <input
                                        type="text"
                                        v-model="website"
                                        placeholder="www.instansi.ac.id"
                                        class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Lokasi Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 class="text-sm font-black text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-2.5 uppercase tracking-wide">Lokasi</h3>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <!-- Alamat Kantor Pusat -->
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Alamat Kantor Pusat</label>
                                    <textarea
                                        v-model="alamat"
                                        rows="4"
                                        placeholder="Jalan, Gedung, Kota, Provinsi, Kode Pos..."
                                        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none resize-none"
                                    ></textarea>
                                </div>
                                
                                <!-- Map Preview box -->
                                <div>
                                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Peta Lokasi</label>
                                    <div class="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold relative overflow-hidden group">
                                        <!-- Styled mockup map graphic -->
                                        <div class="absolute inset-0 opacity-10 dark:opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                        <span class="text-xl">🗺️</span>
                                        <span class="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Lihat Peta</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column (Status Verifikasi, Preview Card, Media Sosial) -->
                    <div class="lg:col-span-4 space-y-6">
                        
                        <!-- Status Verifikasi Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status Verifikasi</span>
                                <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide"
                                    :class="isVerified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50'"
                                >
                                    {{ isVerified ? 'TERVERIFIKASI' : 'BELUM VERIFIKASI' }}
                                </span>
                            </div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                                {{ isVerified 
                                    ? 'Akun instansi Anda telah diverifikasi oleh tim ScholarPath. Semua program yang Anda publikasikan akan tampil dengan badge verifikasi.' 
                                    : 'Akun Anda sedang dalam proses verifikasi. Beberapa fitur mungkin dibatasi sebelum verifikasi dokumen selesai.' }}
                            </p>
                            <a href="#" class="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition">
                                <span>📄 Dokumen Legalitas OK</span>
                                <span class="text-[9px] text-slate-400 dark:text-slate-500 font-normal">(Terverifikasi)</span>
                            </a>
                        </div>

                        <!-- Tampilan bagi Pelamar Preview Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                            <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tampilan bagi Pelamar</h4>
                            
                            <!-- Card Preview -->
                            <div class="border border-slate-150 dark:border-slate-800/60 rounded-2xl p-4 space-y-3.5 shadow-sm bg-slate-50/20 dark:bg-slate-800/30">
                                <div class="flex items-center gap-3">
                                    <div class="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center justify-center text-lg">
                                        🏢
                                    </div>
                                    <div>
                                        <h5 class="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">{{ nama || 'Nama Instansi Anda' }}</h5>
                                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500">Institusi Terverifikasi</p>
                                    </div>
                                </div>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                                    {{ deskripsi || 'Deskripsi profil singkat instansi Anda akan ditampilkan di sini untuk menarik pelamar berkualitas.' }}
                                </p>
                                
                                <!-- Progress completeness -->
                                <div class="space-y-1">
                                    <div class="flex justify-between items-center text-[9px] font-black">
                                        <span class="text-indigo-600 dark:text-indigo-400">{{ profileCompleteness }}% Kelengkapan Profil</span>
                                    </div>
                                    <div class="w-full bg-slate-150 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div class="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300" :style="{ width: profileCompleteness + '%' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Media Sosial Card -->
                        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                            <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Media Sosial</h4>
                            
                            <div class="space-y-3">
                                <!-- Instagram -->
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mb-1">Instagram URL</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 pointer-events-none">IG</span>
                                        <input
                                            type="text"
                                            v-model="instagram"
                                            placeholder="instagram.com/akun"
                                            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                        />
                                    </div>
                                </div>

                                <!-- LinkedIn -->
                                <div>
                                    <label class="text-[9px] font-bold text-slate-400 dark:text-slate-500 block mb-1">LinkedIn URL</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 pointer-events-none">LN</span>
                                        <input
                                            type="text"
                                            v-model="linkedin"
                                            placeholder="linkedin.com/company/nama"
                                            class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }

.animate-slideDown {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
