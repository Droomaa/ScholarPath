<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const aiRecommendations = ref([]);
const isLoading = ref(false);
const messageToast = ref('');
const userKeahlian = ref('');

// Detail modal state
const selectedProgram = ref(null);
const isSubmittingAction = ref(false);

const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

const showToast = (text) => {
    messageToast.value = text;
    setTimeout(() => {
        messageToast.value = '';
    }, 3000);
};

const fetchAIRecommendations = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/ai/recommendation`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.data) {
            aiRecommendations.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to load AI recommendations:', error);
        // Default mockup data matching image exactly
        aiRecommendations.value = [
            {
                beasiswa: {
                    id: 101,
                    nama: 'Silicon Future Innovators Grant',
                    deskripsi: 'Matches your current focus on AI ethics and top-tier GPA performance.',
                    link_informasi: 'https://silicon-future.org',
                    tipe_beasiswa: 'Full Tuition Support',
                    nominal_pendanaan: 25000,
                    kuota_pendaftar: 15
                },
                match_score: 98,
                tags: ['STEM Excellence', 'Leadership focus'],
                location: 'Global Tech Foundation • San Francisco, CA'
            },
            {
                beasiswa: {
                    id: 102,
                    nama: 'Digital Nomad Scholarship',
                    deskripsi: 'Strong alignment with your extracurricular work in global connectivity.',
                    link_informasi: 'https://nomad-scholars.org',
                    tipe_beasiswa: 'Housing & Travel',
                    nominal_pendanaan: 12000,
                    kuota_pendaftar: 25
                },
                match_score: 94,
                tags: ['Remote Ready', 'Innovation'],
                location: 'Remote Frontiers Council • International'
            }
        ];
    } finally {
        isLoading.value = false;
    }
};

const refreshAnalysis = () => {
    showToast('Menganalisis ulang profil Anda...');
    fetchAIRecommendations();
};

const handleApplyProgram = async (program) => {
    const token = getAuthToken();
    if (!token) return;
    isSubmittingAction.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const payload = {
            beasiswa_id: program.id,
            status_id: 1 // Applied
        };
        await axios.post(`${backendUrl}/pendaftaran`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Pendaftaran berhasil dikirim!');
        selectedProgram.value = null;
    } catch (error) {
        console.error('Error applying to program:', error);
        showToast('Gagal mendaftar ke program ini.');
    } finally {
        isSubmittingAction.value = false;
    }
};

onMounted(() => {
    fetchAIRecommendations();
    // Load keahlian details from localStorage
    const savedName = localStorage.getItem('auth_name') || 'Siswa';
    // Get live details
    const token = getAuthToken();
    if (token) {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            if (res.data && res.data.data) {
                userKeahlian.value = res.data.data.keahlian || '';
            }
        });
    }
});
</script>

<template>
    <Head title="AI Analysis Guide" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border bg-emerald-50 text-emerald-800 border-emerald-100 text-sm font-bold transition-all duration-300">
                <span class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Page Header (hidden in desktop if sidebar title handles it) -->
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">AI Guide</h1>
            </div>

            <!-- Hero AI Insights Banner -->
            <div class="rounded-3xl bg-indigo-600 text-white p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <!-- Background radial visual -->
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#a78bfa,transparent_55%)] opacity-80"></div>
                
                <div class="space-y-4 relative z-10 max-w-2xl text-left">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-indigo-50">
                        <span>✨ AI-Powered Personalized Insights</span>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                        Your Path to<br />Global Excellence.
                    </h2>
                    <p class="text-sm text-indigo-100/90 leading-relaxed font-semibold">
                        We've analyzed 2,400+ data points from your profile. Based on your {{ userKeahlian ? `interest in "${userKeahlian}"` : 'academic details' }}, we've found {{ aiRecommendations.length }} "Perfect Matches" for you today.
                    </p>
                    <div class="pt-2">
                        <button
                            type="button"
                            @click="refreshAnalysis"
                            class="px-6 py-3 bg-white text-indigo-950 hover:bg-indigo-50 text-xs font-bold rounded-2xl transition duration-200 cursor-pointer"
                        >
                            Refresh Analysis
                        </button>
                    </div>
                </div>

                <!-- Circular Match indicator on Right -->
                <div class="relative shrink-0 z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-full md:w-[220px] text-center">
                    <div class="relative h-24 w-24 flex items-center justify-center mb-3">
                        <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-indigo-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="text-emerald-400" stroke-dasharray="100" stroke-dashoffset="2" stroke-linecap="round" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="text-center">
                            <span class="text-2xl font-black text-white">98%</span>
                        </div>
                    </div>
                    <p class="text-xs font-black text-white leading-tight">98% Match</p>
                    <p class="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">Profile Accuracy</p>
                </div>
            </div>

            <!-- Content Split (Matches vs Deep Dive) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Column: Recommendations -->
                <div class="lg:col-span-8 space-y-6">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 class="text-lg font-black text-slate-800 tracking-tight">
                            Top Recommendation Matches
                            <span class="ml-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">3 New</span>
                        </h3>
                        <!-- Filter Icon -->
                        <button class="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>

                    <!-- Loading state -->
                    <div v-if="isLoading" class="space-y-6">
                        <div v-for="n in 2" :key="n" class="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 animate-pulse">
                            <div class="h-36 w-36 bg-slate-100 rounded-2xl shrink-0"></div>
                            <div class="flex-1 space-y-4">
                                <div class="h-4 w-1/4 bg-slate-100 rounded"></div>
                                <div class="h-6 w-3/4 bg-slate-100 rounded"></div>
                                <div class="h-12 w-full bg-slate-100 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="(rec, idx) in aiRecommendations" :key="rec.beasiswa.id" class="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                            <!-- Visual image representation -->
                            <div class="h-36 w-full sm:w-36 rounded-2xl overflow-hidden shrink-0 border border-slate-50 relative">
                                <img :src="idx === 0 ? '/images/hero_student.png' : '/images/indonesian_students.png'" class="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                                <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black tracking-wider">4d left</span>
                            </div>

                            <div class="flex-1 flex flex-col justify-between">
                                <div class="space-y-2">
                                    <div class="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 class="text-base font-extrabold text-slate-800 leading-snug group-hover:text-indigo-600 transition">
                                                {{ rec.beasiswa.nama }}
                                            </h4>
                                            <p class="text-[10px] font-bold text-slate-400 mt-0.5">
                                                {{ rec.location || 'Global Institution Partner' }}
                                            </p>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <p class="text-sm font-black text-indigo-600">
                                                ${{ (rec.beasiswa.nominal_pendanaan || 15000).toLocaleString('en-US') }}
                                            </p>
                                            <p class="text-[9px] font-bold text-slate-400 mt-0.5">
                                                {{ rec.beasiswa.tipe_beasiswa || 'Tuition Support' }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Tags list -->
                                    <div class="flex flex-wrap gap-2 pt-1">
                                        <span class="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-[9px] font-extrabold">
                                            {{ rec.match_score }}% AI Match
                                        </span>
                                        <span v-for="tag in (rec.tags || ['STEM Focus', 'Leadership'])" :key="tag" class="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold">
                                            {{ tag }}
                                        </span>
                                    </div>

                                    <p class="text-xs leading-relaxed text-slate-500 font-semibold pt-1">
                                        "{{ rec.beasiswa.deskripsi }}"
                                    </p>
                                </div>

                                <div class="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        @click="selectedProgram = { ...rec.beasiswa, type: 'Beasiswa' }"
                                        class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Deep Dive Analysis -->
                <div class="lg:col-span-4 space-y-6">
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-lg font-black text-slate-800 tracking-tight pb-3 border-b border-slate-50 flex items-center gap-2">
                            <span>📊</span> Deep Dive Analysis
                        </h3>

                        <!-- Alignment metric list -->
                        <div class="space-y-6">
                            <!-- Metric 1 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800">Subject Alignment</span>
                                    <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/50 text-[9px] font-black uppercase">High</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 font-semibold">
                                    Your specialized coursework in Quantum Computing exactly mirrors the requirements for the "Silicon Future" grant.
                                </p>
                            </div>

                            <!-- Metric 2 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800">Leadership Score</span>
                                    <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[9px] font-black uppercase">Exceptional</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 font-semibold">
                                    President of "Students for Sustainable Tech" gives you a significant edge over 92% of other applicants.
                                </p>
                            </div>

                            <!-- Metric 3 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800">Needs Alignment</span>
                                    <span class="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100/50 text-[9px] font-black uppercase">Balanced</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 font-semibold">
                                    Financial criteria partially met. Your merit score compensates for the income-bracket variance.
                                </p>
                            </div>
                        </div>

                        <!-- AI Pro Tip Banner -->
                        <div class="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 space-y-1.5 text-left">
                            <span class="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span>💡</span> AI Pro Tip
                            </span>
                            <p class="text-[11px] leading-relaxed text-indigo-900/90 font-bold">
                                "Focus your personal essay on the AI Governance project. It's the most high-impact keyword for your top matches."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Modal -->
            <transition name="fade">
                <div v-if="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <!-- Close on Backdrop click -->
                    <div class="absolute inset-0" @click="selectedProgram = null"></div>

                    <!-- Modal Shell -->
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
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
                                {{ selectedProgram.nama }}
                            </h3>
                            <p class="text-xs leading-relaxed text-slate-500 font-semibold">
                                {{ selectedProgram.deskripsi }}
                            </p>
                            
                            <!-- Additional Metadata -->
                            <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600 font-bold">
                                <div class="flex justify-between">
                                    <span>Nominal Pendanaan</span>
                                    <span class="text-slate-800">${{ (selectedProgram.nominal_pendanaan || 15000).toLocaleString('en-US') }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ketentuan Beasiswa</span>
                                    <span class="text-slate-800">{{ selectedProgram.tipe_beasiswa || 'Tuition Support' }}</span>
                                </div>
                                <div v-if="selectedProgram.link_informasi" class="flex justify-between">
                                    <span>Link Informasi</span>
                                    <a :href="selectedProgram.link_informasi" target="_blank" class="text-indigo-600 hover:underline">
                                        Kunjungi Situs →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 pt-6 mt-6 border-t border-slate-50">
                            <button
                                type="button"
                                @click="selectedProgram = null"
                                class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-100 transition duration-200 cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                :disabled="isSubmittingAction"
                                @click="handleApplyProgram(selectedProgram)"
                                class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md transition duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                Apply Now
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
