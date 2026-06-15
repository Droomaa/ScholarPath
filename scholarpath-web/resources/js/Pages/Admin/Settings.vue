<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, onUnmounted } from 'vue';

// --- Settings State ---
const platformName = ref('ScholarPath');
const supportEmail = ref('support@scholarpath.id');
const timezone = ref('WIB (GMT +7:00) Jakarta');
const mfaEnabled = ref(true);
const sessionExpiration = ref('30 Menit');

// Active tab (removed AI Configuration)
const activeTab = ref('General Settings');
const availableTabs = ['General Settings', 'Security', 'Notifications'];

const messageToast = ref({ text: '', type: '' });
const isSaving = ref(false);

// --- Real-Time WIB Clock ---
const wibClock = ref('');
let clockInterval = null;

const updateClock = () => {
    const now = new Date();
    // Convert to WIB (UTC+7)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (7 * 3600000));
    const h = wibTime.getHours().toString().padStart(2, '0');
    const m = wibTime.getMinutes().toString().padStart(2, '0');
    const s = wibTime.getSeconds().toString().padStart(2, '0');
    const day = wibTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    wibClock.value = `${h}:${m}:${s} WIB — ${day}`;
};

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

const loadSettings = () => {
    const saved = {
        platform: localStorage.getItem('settings_platform_name'),
        email: localStorage.getItem('settings_support_email'),
        mfa: localStorage.getItem('settings_mfa'),
        session: localStorage.getItem('settings_session_expiration'),
    };
    if (saved.platform) platformName.value = saved.platform;
    if (saved.email) supportEmail.value = saved.email;
    if (saved.mfa) mfaEnabled.value = saved.mfa === 'true';
    if (saved.session) sessionExpiration.value = saved.session;
};

const saveSettings = () => {
    isSaving.value = true;
    setTimeout(() => {
        localStorage.setItem('settings_platform_name', platformName.value);
        localStorage.setItem('settings_support_email', supportEmail.value);
        localStorage.setItem('settings_mfa', mfaEnabled.value ? 'true' : 'false');
        localStorage.setItem('settings_session_expiration', sessionExpiration.value);
        isSaving.value = false;
        showToast('Konfigurasi berhasil disimpan!', 'success');
    }, 800);
};

const discardChanges = () => {
    loadSettings();
    showToast('Perubahan dibatalkan, memuat konfigurasi tersimpan.', 'success');
};

onMounted(() => {
    loadSettings();
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval);
});
</script>

<template>
    <Head title="Settings" />

    <AdminLayout>
        <!-- Toast -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold"
                :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success', 'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error' }">
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8 text-left max-w-5xl">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                    <p class="text-sm font-medium text-slate-500">Konfigurasi parameter platform, keamanan akses, dan template komunikasi ScholarPath.</p>
                </div>
                <div class="flex items-center gap-2 self-start sm:self-auto bg-slate-100 border border-slate-200/50 rounded-xl px-3.5 py-1.5 text-xs font-black text-slate-650">
                    <span>v2.4.1</span>
                </div>
            </div>

            <!-- Settings Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                <!-- Left Sidebar -->
                <div class="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-1">
                    <button
                        v-for="tab in availableTabs"
                        :key="tab"
                        type="button"
                        @click="activeTab = tab"
                        class="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 focus:outline-none"
                        :class="activeTab === tab
                            ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100/50'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent'">
                        <span>{{ tab }}</span>
                        <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>

                <!-- Right Content -->
                <div class="lg:col-span-9 space-y-6">

                    <!-- General Settings Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">General Settings</h3>
                            <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-purple-50 text-purple-700 border border-purple-100">Active Configuration</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Platform Name</label>
                                <input type="text" v-model="platformName" placeholder="Nama platform..."
                                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-800 font-bold transition outline-none"/>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Support Email</label>
                                <input type="email" v-model="supportEmail" placeholder="Email bantuan sistem..."
                                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-800 font-bold transition outline-none"/>
                            </div>
                        </div>

                        <!-- WIB Timezone (locked) -->
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">System Timezone</label>
                            <div class="flex items-center gap-3">
                                <div class="flex-1 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 font-bold flex items-center justify-between">
                                    <span>🕐 WIB (GMT +7:00) Jakarta — Terkunci</span>
                                    <span class="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Locked</span>
                                </div>
                            </div>
                            <!-- Real-time WIB digital clock -->
                            <div class="mt-3 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl flex items-center justify-between relative overflow-hidden">
                                <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#9333ea,transparent_60%)] opacity-40"></div>
                                <div class="relative z-10">
                                    <p class="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-1">Waktu Sistem Saat Ini</p>
                                    <p class="text-xl font-black text-white font-mono tracking-wider leading-none">{{ wibClock.split(' — ')[0] }}</p>
                                </div>
                                <div class="relative z-10 text-right">
                                    <p class="text-[9px] font-semibold text-indigo-300">{{ wibClock.split(' — ')[1] }}</p>
                                    <span class="inline-block mt-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Security & Access Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">Security &amp; Access</h3>

                        <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div class="space-y-0.5">
                                <h4 class="text-xs font-black text-slate-800">Multi-Factor Authentication (MFA)</h4>
                                <p class="text-[11px] font-semibold text-slate-400">Paksa semua admin menggunakan 2FA keamanan.</p>
                            </div>
                            <button type="button" @click="mfaEnabled = !mfaEnabled"
                                class="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                :class="mfaEnabled ? 'bg-purple-600' : 'bg-slate-200'">
                                <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                    :class="mfaEnabled ? 'translate-x-5' : 'translate-x-0'"></span>
                            </button>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div class="space-y-0.5">
                                <h4 class="text-xs font-black text-slate-800">Session Expiration</h4>
                                <p class="text-[11px] font-semibold text-slate-400">Auto logout setelah periode tidak aktif.</p>
                            </div>
                            <input type="text" v-model="sessionExpiration"
                                class="w-32 text-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-purple-500 transition"/>
                        </div>
                    </div>

                    <!-- Communication Templates Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">Communication Templates</h3>
                        <div class="space-y-3">
                            <!-- Template 1 -->
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div class="flex items-center gap-3.5 text-left">
                                    <div class="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">✓</div>
                                    <div class="space-y-0.5">
                                        <h4 class="text-xs font-black text-slate-800">Scholarship Approval Email</h4>
                                        <p class="text-[11px] font-semibold text-slate-400">Dikirim saat aplikasi beasiswa siswa berhasil.</p>
                                        <div class="flex gap-2.5 pt-1.5 text-[8.5px] font-black uppercase text-slate-450 tracking-wider">
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">Email</span>
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">SMS</span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" @click="showToast('Template editor coming soon!', 'success')" class="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-450 hover:text-slate-700">📝</button>
                            </div>
                            <!-- Template 2 -->
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div class="flex items-center gap-3.5 text-left">
                                    <div class="h-8 w-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">⚠</div>
                                    <div class="space-y-0.5">
                                        <h4 class="text-xs font-black text-slate-800">Security Alert Notification</h4>
                                        <p class="text-[11px] font-semibold text-slate-400">Dikirim saat terdeteksi percobaan login mencurigakan.</p>
                                        <div class="flex gap-2.5 pt-1.5 text-[8.5px] font-black uppercase text-slate-450 tracking-wider">
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">Email</span>
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">SMS</span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" @click="showToast('Template editor coming soon!', 'success')" class="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-450 hover:text-slate-700">📝</button>
                            </div>
                            <!-- Template 3 -->
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div class="flex items-center gap-3.5 text-left">
                                    <div class="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">🏛</div>
                                    <div class="space-y-0.5">
                                        <h4 class="text-xs font-black text-slate-800">Institution Verification Result</h4>
                                        <p class="text-[11px] font-semibold text-slate-400">Dikirim saat instansi disetujui atau ditolak admin.</p>
                                        <div class="flex gap-2.5 pt-1.5 text-[8.5px] font-black uppercase text-slate-450 tracking-wider">
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">Email</span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" @click="showToast('Template editor coming soon!', 'success')" class="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-450 hover:text-slate-700">📝</button>
                            </div>
                        </div>
                    </div>

                    <!-- Save Buttons -->
                    <div class="flex justify-end items-center gap-4 pt-4 border-t border-slate-200/60">
                        <button type="button" @click="discardChanges" class="px-5 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold transition cursor-pointer">
                            Discard Changes
                        </button>
                        <button type="button" @click="saveSettings" :disabled="isSaving"
                            class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/10 hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2">
                            <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Save Configuration</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
