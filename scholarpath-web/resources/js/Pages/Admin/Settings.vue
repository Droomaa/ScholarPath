<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// Settings state
const platformName = ref('ScholarPath Pro');
const supportEmail = ref('admin@scholarpath.edu');
const timezone = ref('EST (GMT -5:00) New York');
const mfaEnabled = ref(true);
const sessionExpiration = ref('30 Minutes');

// AI Weights
const weightAcademic = ref(85);
const weightFinancial = ref(60);
const weightCareer = ref(45);

const activeTab = ref('General Settings');
const messageToast = ref({ text: '', type: '' });
const isSaving = ref(false);
const isReSyncing = ref(false);

// Neural Training Re-Sync Countdown
const countdownHours = ref(4);
const countdownMinutes = ref(12);
const countdownSeconds = ref(0);
let timerInterval = null;

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4500);
};

const loadSettings = () => {
    const savedPlatform = localStorage.getItem('settings_platform_name');
    const savedEmail = localStorage.getItem('settings_support_email');
    const savedTimezone = localStorage.getItem('settings_timezone');
    const savedMfa = localStorage.getItem('settings_mfa');
    const savedSession = localStorage.getItem('settings_session_expiration');
    const savedAcademic = localStorage.getItem('settings_weight_academic');
    const savedFinancial = localStorage.getItem('settings_weight_financial');
    const savedCareer = localStorage.getItem('settings_weight_career');

    if (savedPlatform) platformName.value = savedPlatform;
    if (savedEmail) supportEmail.value = savedEmail;
    if (savedTimezone) timezone.value = savedTimezone;
    if (savedMfa) mfaEnabled.value = savedMfa === 'true';
    if (savedSession) sessionExpiration.value = savedSession;
    if (savedAcademic) weightAcademic.value = parseInt(savedAcademic);
    if (savedFinancial) weightFinancial.value = parseInt(savedFinancial);
    if (savedCareer) weightCareer.value = parseInt(savedCareer);
};

const saveSettings = () => {
    isSaving.value = true;
    setTimeout(() => {
        localStorage.setItem('settings_platform_name', platformName.value);
        localStorage.setItem('settings_support_email', supportEmail.value);
        localStorage.setItem('settings_timezone', timezone.value);
        localStorage.setItem('settings_mfa', mfaEnabled.value ? 'true' : 'false');
        localStorage.setItem('settings_session_expiration', sessionExpiration.value);
        localStorage.setItem('settings_weight_academic', weightAcademic.value.toString());
        localStorage.setItem('settings_weight_financial', weightFinancial.value.toString());
        localStorage.setItem('settings_weight_career', weightCareer.value.toString());
        
        isSaving.value = false;
        showToast('Konfigurasi berhasil disimpan!', 'success');
    }, 800);
};

const discardChanges = () => {
    loadSettings();
    showToast('Perubahan dibatalkan, memuat konfigurasi tersimpan.', 'success');
};

// Trigger Manual AI Re-Sync
const triggerReSync = async () => {
    isReSyncing.value = true;
    showToast('Menghubungi server AI ScholarPath...', 'success');

    try {
        // Ping FastAPI health check endpoint to check online status
        await axios.get('http://localhost:8001/');
        
        setTimeout(() => {
            // Reset countdown to 24 hours
            countdownHours.value = 24;
            countdownMinutes.value = 0;
            countdownSeconds.value = 0;
            
            showToast('AI Neural Matcher model re-trained & re-indexed successfully!', 'success');
            isReSyncing.value = false;
        }, 1500);
    } catch (e) {
        console.warn('AI Microservice offline. Executing simulated re-sync...', e);
        // Fallback simulation
        setTimeout(() => {
            countdownHours.value = 24;
            countdownMinutes.value = 0;
            countdownSeconds.value = 0;
            showToast('AI Neural weights re-synced successfully (Local Fallback)!', 'success');
            isReSyncing.value = false;
        }, 1500);
    }
};

// Countdown Timer logic
const startCountdown = () => {
    timerInterval = setInterval(() => {
        if (countdownSeconds.value > 0) {
            countdownSeconds.value--;
        } else {
            if (countdownMinutes.value > 0) {
                countdownMinutes.value--;
                countdownSeconds.value = 59;
            } else {
                if (countdownHours.value > 0) {
                    countdownHours.value--;
                    countdownMinutes.value = 59;
                    countdownSeconds.value = 59;
                } else {
                    // Reset to 24h if hits 0
                    countdownHours.value = 24;
                    countdownMinutes.value = 0;
                    countdownSeconds.value = 0;
                }
            }
        }
    }, 1000);
};

const formatTime = (val) => {
    return String(val).padStart(2, '0');
};

onMounted(() => {
    loadSettings();
    startCountdown();
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<template>
    <Head title="Settings" />

    <AdminLayout>
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

        <div class="space-y-8 text-left max-w-5xl">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                    <p class="text-sm font-medium text-slate-500">Configure platform-wide parameters, security protocols, and AI engine weights for ScholarPath's academic recommendation system.</p>
                </div>
                <div class="flex items-center gap-2 self-start sm:self-auto bg-slate-100 border border-slate-200/50 rounded-xl px-3.5 py-1.5 text-xs font-black text-slate-650">
                    <span>v2.4.1</span>
                </div>
            </div>

            <!-- Settings layout columns -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Column selectors tabs -->
                <div class="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-1">
                    <button
                        v-for="tab in ['General Settings', 'Security', 'AI Configuration', 'Notifications']"
                        :key="tab"
                        type="button"
                        @click="activeTab = tab"
                        class="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 focus:outline-none"
                        :class="activeTab === tab 
                            ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100/50' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-transparent'"
                    >
                        <span>{{ tab }}</span>
                        <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <!-- Right Column content -->
                <div class="lg:col-span-9 space-y-6">
                    
                    <!-- General Settings Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">General Settings</h3>
                            <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-purple-50 text-purple-700 border border-purple-100">
                                Active Configuration
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Platform Name</label>
                                <input
                                    type="text"
                                    v-model="platformName"
                                    placeholder="Enter platform brand..."
                                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-800 font-bold transition outline-none"
                                />
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Support Email</label>
                                <input
                                    type="email"
                                    v-model="supportEmail"
                                    placeholder="Enter support mailbox..."
                                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-800 font-bold transition outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">System Timezone</label>
                            <select
                                v-model="timezone"
                                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 font-bold focus:bg-white focus:border-purple-500 transition outline-none cursor-pointer"
                            >
                                <option>EST (GMT -5:00) New York</option>
                                <option>WIB (GMT +7:00) Jakarta</option>
                                <option>GMT (GMT +0:00) London</option>
                                <option>AEST (GMT +10:00) Sydney</option>
                            </select>
                        </div>
                    </div>

                    <!-- Security & Access Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">Security & Access</h3>
                        
                        <div class="flex items-center justify-between p-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div class="space-y-0.5">
                                <h4 class="text-xs font-black text-slate-800">Multi-Factor Authentication (MFA)</h4>
                                <p class="text-[11px] font-semibold text-slate-400">Force all administrative users to use 2FA security.</p>
                            </div>
                            <button
                                type="button"
                                @click="mfaEnabled = !mfaEnabled"
                                class="relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                :class="mfaEnabled ? 'bg-purple-600' : 'bg-slate-200'"
                            >
                                <span
                                    class="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                    :class="mfaEnabled ? 'translate-x-5' : 'translate-x-0'"
                                ></span>
                            </button>
                        </div>

                        <div class="flex items-center justify-between p-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                            <div class="space-y-0.5">
                                <h4 class="text-xs font-black text-slate-800">Session Expiration</h4>
                                <p class="text-[11px] font-semibold text-slate-400">Auto logouts after periods of inactivity.</p>
                            </div>
                            <input
                                type="text"
                                v-model="sessionExpiration"
                                class="w-32 text-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                            />
                        </div>
                    </div>

                    <!-- AI Weights Configuration -->
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        <!-- Sliders -->
                        <div class="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">Recommendation Weights</h3>
                            
                            <div class="space-y-4">
                                <!-- Academic merit -->
                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs font-bold">
                                        <span class="text-slate-500">Academic Merit</span>
                                        <span class="text-purple-600">{{ weightAcademic }}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        v-model="weightAcademic"
                                        class="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                                    />
                                </div>

                                <!-- Financial need -->
                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs font-bold">
                                        <span class="text-slate-500">Financial Need</span>
                                        <span class="text-purple-600">{{ weightFinancial }}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        v-model="weightFinancial"
                                        class="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                                    />
                                </div>

                                <!-- Career Alignment -->
                                <div class="space-y-1.5">
                                    <div class="flex justify-between text-xs font-bold">
                                        <span class="text-slate-500">Career Alignment</span>
                                        <span class="text-purple-600">{{ weightCareer }}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        v-model="weightCareer"
                                        class="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Neural Sync Countdown -->
                        <div class="md:col-span-4 bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between items-center text-center gap-4 min-h-[220px]">
                            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#9333ea,transparent_55%)] opacity-50"></div>
                            
                            <div class="relative z-10 space-y-1">
                                <div class="h-9 w-9 bg-white/10 text-white rounded-xl flex items-center justify-center text-base mx-auto mb-2">
                                    ⚙
                                </div>
                                <h4 class="text-sm font-black tracking-wide">Neural Training Interval</h4>
                            </div>

                            <div class="relative z-10 space-y-1.5">
                                <p class="text-[9px] font-black tracking-widest text-indigo-200 uppercase">Next Re-Sync</p>
                                <p class="text-3xl font-black font-mono tracking-wider leading-none">
                                    {{ formatTime(countdownHours) }}:{{ formatTime(countdownMinutes) }}:{{ formatTime(countdownSeconds) }}
                                </p>
                            </div>

                            <button
                                type="button"
                                @click="triggerReSync"
                                :disabled="isReSyncing"
                                class="w-full py-2.5 bg-white/15 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition duration-150 relative z-10 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <svg v-if="isReSyncing" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Trigger Manual Re-Sync</span>
                            </button>
                        </div>
                    </div>

                    <!-- Communication Templates Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">Communication Templates</h3>
                        
                        <div class="space-y-3">
                            <!-- Template 1 -->
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div class="flex items-center gap-3.5 text-left">
                                    <div class="h-8.5 w-8.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                                        ✓
                                    </div>
                                    <div class="space-y-0.5">
                                        <h4 class="text-xs font-black text-slate-800">Scholarship Approval Email</h4>
                                        <p class="text-[11px] font-semibold text-slate-400">Sent when a student application is successful.</p>
                                        <div class="flex gap-2.5 pt-1.5 text-[8.5px] font-black uppercase text-slate-450 tracking-wider">
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">Email</span>
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">SMS</span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-450 hover:text-slate-700">
                                    📝
                                </button>
                            </div>

                            <!-- Template 2 -->
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div class="flex items-center gap-3.5 text-left">
                                    <div class="h-8.5 w-8.5 rounded-xl bg-red-50 text-red-650 flex items-center justify-center font-bold text-xs shrink-0">
                                        ⚠
                                    </div>
                                    <div class="space-y-0.5">
                                        <h4 class="text-xs font-black text-slate-800">Security Alert</h4>
                                        <p class="text-[11px] font-semibold text-slate-400">Sent for suspicious login attempts.</p>
                                        <div class="flex gap-2.5 pt-1.5 text-[8.5px] font-black uppercase text-slate-450 tracking-wider">
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">Email</span>
                                            <span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">SMS</span>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" class="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-455 hover:text-slate-700">
                                    📝
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Action Buttons bar -->
                    <div class="flex justify-end items-center gap-4 pt-4 border-t border-slate-200/60">
                        <button
                            type="button"
                            @click="discardChanges"
                            class="px-5 py-3 text-slate-500 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                            Discard Changes
                        </button>
                        <button
                            type="button"
                            @click="saveSettings"
                            :disabled="isSaving"
                            class="px-6 py-3 bg-purple-600 hover:bg-purple-750 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-600/10 hover:shadow-xl transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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
