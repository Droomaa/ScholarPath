<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, router } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const aiRecommendations = ref([]);
const isLoading = ref(false);
const messageToast = ref({ text: '', type: 'success' });
const userKeahlian = ref('');

// User Profile Data for Application Form
const userProfile = ref({
    name: '',
    keahlian: '',
    email: '',
    institution: ''
});

// Detail modal & Application Form state
const selectedProgram = ref(null);
const isSubmittingAction = ref(false);
const showApplyForm = ref(false);
const applyForm = ref({
    resume: null,
    report_card: null,
    proposal: null,
    recommendation: null,
    alasan: ''
});

// Skills Update State
const isUpdatingSkills = ref(false);
const tempKeahlian = ref('');
const showUpdateSkillsForm = ref(false);

const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: 'success' };
    }, 4000);
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
        aiRecommendations.value = [];
        if (error.response && error.response.status === 400) {
            showToast('Lengkapi minat & keahlian Anda di Pengaturan Profil agar AI dapat memberikan rekomendasi!', 'error');
        } else {
            showToast('Gagal memuat rekomendasi AI. Pastikan layanan AI berjalan.', 'error');
        }
    } finally {
        isLoading.value = false;
    }
};

const topMatchScore = computed(() => {
    if (aiRecommendations.value.length > 0) {
        return Math.round(aiRecommendations.value[0].match_score);
    }
    return 0;
});

const refreshAnalysis = () => {
    showToast('Menganalisis ulang profil Anda...');
    fetchAIRecommendations();
};

const updateSkills = async () => {
    const token = getAuthToken();
    if (!token) return;
    isUpdatingSkills.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.put(`${backendUrl}/user/profile`, { keahlian: tempKeahlian.value }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        userKeahlian.value = tempKeahlian.value;
        userProfile.value.keahlian = tempKeahlian.value;
        showToast('Minat & Keahlian berhasil diperbarui!', 'success');
        fetchAIRecommendations();
    } catch (e) {
        showToast('Gagal memperbarui profil.', 'error');
    } finally {
        isUpdatingSkills.value = false;
    }
};

const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
        applyForm.value[fieldName] = file;
    }
};

const selectProgramForDetails = async (programData, type) => {
    const token = getAuthToken();
    if (!token) return;
    
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
    try {
        const endpoint = type === 'Beasiswa' ? `/beasiswa/${programData.id}` : `/olimpiade/${programData.id}`;
        const res = await axios.get(`${backendUrl}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.data) {
            selectedProgram.value = { ...res.data.data, type };
        } else {
            selectedProgram.value = { ...programData, type };
        }
    } catch (e) {
        console.error("Gagal menarik detail riil program", e);
        selectedProgram.value = { ...programData, type };
    }
};

const handleApplyProgram = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    // Validation
    if (!applyForm.value.resume || !applyForm.value.report_card || !applyForm.value.proposal || !applyForm.value.recommendation || !applyForm.value.alasan) {
        showToast('Semua file dan alasan wajib diisi!', 'error');
        return;
    }

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

    isSubmittingAction.value = true;

    // 1. Sync Profile Data automatically before applying
    try {
        await axios.put(`${backendUrl}/user/profile`, {
            name: userProfile.value.name,
            keahlian: userProfile.value.keahlian
        }, { headers: { Authorization: `Bearer ${token}` } });
        localStorage.setItem('user_institution', userProfile.value.institution);
    } catch (profileError) {
        console.warn('Sync profile failed but proceeding to application:', profileError);
    }

    try {
        const formData = new FormData();
        if (selectedProgram.value.type === 'Beasiswa') {
            formData.append('beasiswa_id', selectedProgram.value.id);
        } else {
            formData.append('olimpiade_id', selectedProgram.value.id);
        }
        
        formData.append('alasan', applyForm.value.alasan);
        formData.append('resume', applyForm.value.resume);
        formData.append('report_card', applyForm.value.report_card);
        formData.append('proposal', applyForm.value.proposal);
        formData.append('recommendation', applyForm.value.recommendation);

        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.post(`${backendUrl}/pendaftaran`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        showToast('Pendaftaran Anda berhasil dikirim! Silakan cek status berkala pada riwayat pendaftaran.', 'success');
        showApplyForm.value = false;
        selectedProgram.value = null;
        applyForm.value = { resume: null, report_card: null, proposal: null, recommendation: null, alasan: '' };
        router.visit('/student/my-programs');
    } catch (error) {
        console.error('Error applying to program:', error);
        showToast('Gagal mengirim pendaftaran.', 'error');
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
                tempKeahlian.value = userKeahlian.value;
                userProfile.value.name = res.data.data.name || savedName;
                userProfile.value.keahlian = res.data.data.minat_bakat || res.data.data.keahlian || 'Belum diisi';
                userProfile.value.email = res.data.data.email || 'student@example.com';
                userProfile.value.institution = localStorage.getItem('user_institution') || 'Universitas Indonesia';
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
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300"
                :class="{
                    'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60': messageToast.type === 'success',
                    'bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-100 dark:border-red-800/60': messageToast.type === 'error'
                }"
            >
                <span class="h-5 w-5 rounded-full flex items-center justify-center text-xs"
                      :class="messageToast.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : 'bg-red-500 dark:bg-red-600 text-white'">
                      {{ messageToast.type === 'success' ? '✓' : '!' }}
                </span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8">
            <!-- Page Header (hidden in desktop if sidebar title handles it) -->
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Guide</h1>
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
                            <path class="text-emerald-400" stroke-dasharray="100" :stroke-dashoffset="100 - topMatchScore" stroke-linecap="round" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div class="text-center">
                            <span class="text-2xl font-black text-white">{{ topMatchScore }}%</span>
                        </div>
                    </div>
                    <p class="text-xs font-black text-white leading-tight">Top Match</p>
                    <p class="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mt-0.5">Profile Accuracy</p>
                </div>
            </div>

            <!-- Content Split (Matches vs Deep Dive) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Column: Recommendations -->
                <div class="lg:col-span-8 space-y-6">

                    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                        <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                            Top Recommendation Matches
                            <span v-if="aiRecommendations.length > 0" class="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100/50 dark:border-indigo-800/50">{{ aiRecommendations.length }} Matches</span>
                        </h3>
                        <!-- Filter Icon -->
                        <button class="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>

                    <!-- Loading state -->
                    <div v-if="isLoading" class="space-y-6">
                        <div v-for="n in 2" :key="n" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 animate-pulse">
                            <div class="h-36 w-36 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0"></div>
                            <div class="flex-1 space-y-4">
                                <div class="h-4 w-1/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div class="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                <div class="h-12 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else-if="aiRecommendations.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div class="text-4xl mb-4">🔍</div>
                        <h4 class="text-sm font-bold text-slate-800 dark:text-white">Belum ada rekomendasi</h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Lengkapi profil Anda dengan minat dan keahlian untuk mendapatkan rekomendasi AI.</p>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="(rec, idx) in aiRecommendations" :key="rec.beasiswa?.id || rec.olimpiade?.id" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/10 transition-all duration-200 group">
                            <!-- Visual image representation -->
                            <div class="h-36 w-full sm:w-36 rounded-2xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800 relative">
                                <img :src="idx === 0 ? '/images/hero_student.png' : '/images/indonesian_students.png'" class="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                                <span class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black tracking-wider">4d left</span>
                            </div>

                            <div class="flex-1 flex flex-col justify-between">
                                <div class="space-y-2">
                                    <div class="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 class="text-base font-extrabold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                                {{ rec.beasiswa?.nama || rec.olimpiade?.judul }}
                                            </h4>
                                            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                                {{ rec.location || 'Global Institution Partner' }}
                                            </p>
                                        </div>
                                        <div class="text-right shrink-0">
                                            <p class="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                                ${{ (rec.beasiswa?.nominal_pendanaan || rec.olimpiade?.hadiah || 15000).toLocaleString('en-US') }}
                                            </p>
                                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                                {{ rec.beasiswa?.tipe_beasiswa || 'Lomba' }}
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Tags list -->
                                    <div class="flex flex-wrap gap-2 pt-1">
                                        <span class="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400 text-[9px] font-extrabold">
                                            {{ Math.round(rec.match_score) }}% AI Match
                                        </span>
                                        <span v-for="tag in (rec.tags || ['STEM Focus', 'Leadership'])" :key="tag" class="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                                            {{ tag }}
                                        </span>
                                    </div>

                                    <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold pt-1">
                                        "{{ rec.beasiswa?.deskripsi || rec.olimpiade?.deskripsi }}"
                                    </p>
                                </div>

                                <div class="pt-4 flex justify-end">
                                    <button
                                        type="button"
                                        @click="selectProgramForDetails(rec.beasiswa || rec.olimpiade, rec.beasiswa ? 'Beasiswa' : 'Lomba')"
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
                    <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                        <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight pb-3 border-b border-slate-50 dark:border-slate-800/60 flex items-center gap-2">
                            <span>📊</span> Deep Dive Analysis
                        </h3>

                        <!-- Alignment metric list -->
                        <div class="space-y-6">
                            <!-- Metric 1 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800 dark:text-slate-200">Subject Alignment</span>
                                    <span class="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50 text-[9px] font-black uppercase">High</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-semibold">
                                    Your specialized coursework in Quantum Computing exactly mirrors the requirements for the "Silicon Future" grant.
                                </p>
                            </div>

                            <!-- Metric 2 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800 dark:text-slate-200">Leadership Score</span>
                                    <span class="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/50 text-[9px] font-black uppercase">Exceptional</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-semibold">
                                    President of "Students for Sustainable Tech" gives you a significant edge over 92% of other applicants.
                                </p>
                            </div>

                            <!-- Metric 3 -->
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-slate-800 dark:text-slate-200">Needs Alignment</span>
                                    <span class="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100/50 dark:border-purple-800/50 text-[9px] font-black uppercase">Balanced</span>
                                </div>
                                <p class="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 font-semibold">
                                    Financial criteria partially met. Your merit score compensates for the income-bracket variance.
                                </p>
                            </div>
                        </div>

                        <!-- AI Pro Tip Banner -->
                        <div class="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/80 dark:border-indigo-800/50 rounded-2xl p-4 space-y-1.5 text-left">
                            <span class="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <span>💡</span> AI Pro Tip
                            </span>
                            <p class="text-[11px] leading-relaxed text-indigo-900/90 dark:text-indigo-200/90 font-bold">
                                "Focus your personal essay on the AI Governance project. It's the most high-impact keyword for your top matches."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detail Modal -->
            <transition name="fade">
                <div v-if="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm">
                    <!-- Close on Backdrop click -->
                    <div class="absolute inset-0" @click="selectedProgram = null"></div>

                    <!-- Modal Shell -->
                    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500 dark:bg-rose-600 text-white">
                                {{ selectedProgram.type }}
                            </span>
                            <button type="button" @click="selectedProgram = null; showApplyForm = false;" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Content Detail (hides when showApplyForm is true) -->
                        <div v-if="!showApplyForm" class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <!-- Image Poster -->
                            <div v-if="selectedProgram.gambar_poster" class="h-48 w-full rounded-2xl overflow-hidden shrink-0 border border-slate-50 dark:border-slate-800">
                                <img :src="selectedProgram.gambar_poster" class="w-full h-full object-cover" />
                            </div>

                            <h3 class="text-xl font-extrabold text-slate-800 dark:text-white">
                                {{ selectedProgram.nama || selectedProgram.judul }}
                            </h3>
                            
                            <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                Dibuat: {{ selectedProgram.created_at ? new Date(selectedProgram.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                            </p>

                            <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
                                {{ selectedProgram.deskripsi }}
                            </p>
                            
                            <!-- Additional Metadata -->
                            <div class="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-bold">
                                <div class="flex justify-between">
                                    <span>Instansi / Pembuat</span>
                                    <span class="text-slate-800 dark:text-slate-200">{{ selectedProgram.instansi?.nama || 'Global Institution Partner' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Deadline</span>
                                    <span class="text-rose-600 dark:text-rose-400">{{ selectedProgram.deadline ? new Date(selectedProgram.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Nominal Pendanaan</span>
                                    <span class="text-slate-800 dark:text-slate-200">${{ (selectedProgram.nominal_pendanaan || 15000).toLocaleString('en-US') }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Ketentuan Beasiswa</span>
                                    <span class="text-slate-800 dark:text-slate-200">{{ selectedProgram.tipe_beasiswa || 'Tuition Support' }}</span>
                                </div>
                                <div v-if="selectedProgram.link_informasi" class="flex justify-between">
                                    <span>Link Informasi</span>
                                    <a :href="selectedProgram.link_informasi" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Kunjungi Situs →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Apply Form Section -->
                        <div v-else class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <h3 class="text-xl font-extrabold text-slate-800 dark:text-white">Application Form</h3>
                            
                            <!-- Auto-filled Profile -->
                            <div class="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-xs">
                                <p class="font-black text-indigo-800 dark:text-indigo-300 mb-2">Data Diri (Auto-filled)</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-indigo-900/80 dark:text-indigo-200/80 font-semibold">
                                    <div class="flex flex-col gap-1">
                                        <label class="text-[10px] font-black uppercase text-slate-500">Full Name</label>
                                        <input type="text" v-model="userProfile.name" class="rounded-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 px-3 py-2 text-slate-800 dark:text-white transition outline-none">
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <label class="text-[10px] font-black uppercase text-slate-500">Email Address</label>
                                        <input type="email" :value="userProfile.email" readonly disabled class="rounded-lg border-indigo-200 dark:border-indigo-800 bg-white/50 dark:bg-slate-800/50 px-3 py-2 cursor-not-allowed text-slate-500">
                                    </div>
                                    <div class="flex flex-col gap-1 md:col-span-2">
                                        <label class="text-[10px] font-black uppercase text-slate-500">University/Institution</label>
                                        <input type="text" v-model="userProfile.institution" class="rounded-lg border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 px-3 py-2 text-slate-800 dark:text-white transition outline-none">
                                    </div>
                                </div>
                            </div>

                            <!-- Upload Berkas -->
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Resume (Wajib)</label>
                                    <input type="file" @change="e => handleFileChange(e, 'resume')" accept=".pdf,.doc,.docx" class="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 transition"/>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">School Report Card (Wajib)</label>
                                    <input type="file" @change="e => handleFileChange(e, 'report_card')" accept=".pdf,.png,.jpg" class="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 transition"/>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project Proposal (Wajib)</label>
                                    <input type="file" @change="e => handleFileChange(e, 'proposal')" accept=".pdf,.doc,.docx" class="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 transition"/>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recommendation Letter (Wajib)</label>
                                    <input type="file" @change="e => handleFileChange(e, 'recommendation')" accept=".pdf,.jpg,.png" class="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800/50 transition"/>
                                </div>
                                <div class="space-y-1 pt-2">
                                    <label class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alasan Ketertarikan (Wajib)</label>
                                    <textarea v-model="applyForm.alasan" rows="3" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-xs px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Mengapa Anda tertarik dengan program ini?"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Buttons -->
                        <div class="flex gap-3 pt-6 mt-6 border-t border-slate-50 dark:border-slate-800/60">
                            <button
                                v-if="!showApplyForm"
                                type="button"
                                @click="selectedProgram = null"
                                class="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border border-slate-100 dark:border-slate-700 transition duration-200 cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                v-if="showApplyForm"
                                type="button"
                                @click="showApplyForm = false"
                                class="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl border border-slate-100 dark:border-slate-700 transition duration-200 cursor-pointer"
                            >
                                Kembali
                            </button>

                            <button
                                v-if="!showApplyForm"
                                type="button"
                                @click="showApplyForm = true"
                                class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md transition duration-200 cursor-pointer"
                            >
                                Apply Now
                            </button>
                            <button
                                v-if="showApplyForm"
                                type="button"
                                :disabled="isSubmittingAction"
                                @click="handleApplyProgram"
                                class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-2xl shadow-md transition duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                Submit Application
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
