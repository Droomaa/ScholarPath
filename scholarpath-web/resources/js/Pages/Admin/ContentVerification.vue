<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const queue = ref([]);
const activeItem = ref(null);
const activeItemDetails = ref(null);
const isLoadingQueue = ref(false);
const isLoadingDetails = ref(false);
const messageToast = ref({ text: '', type: '' });
const isActioning = ref(false);

// Revision Modal
const showRevisionModal = ref(false);
const revisionFeedback = ref('');

// AI Quality Analysis
const aiScore = ref(0);
const aiFeedback = ref([]);
const isAnalyzingAI = ref(false);

const getAuthToken = () => localStorage.getItem('auth_token');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4500);
};

// Fetch list of pending verifications
const fetchQueue = async () => {
    const token = getAuthToken();
    if (!token) return;

    isLoadingQueue.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/admin/verification-queue`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.data) {
            // Filter only content items (Scholarship Content or Competition Content)
            queue.value = response.data.data.filter(item => 
                item.type === 'Scholarship Content' || item.type === 'Competition Content'
            );

            // Select first item by default if nothing is selected yet
            if (queue.value.length > 0 && !activeItem.value) {
                selectItem(queue.value[0]);
            }
        }
    } catch (error) {
        console.error('Failed to fetch content verification queue:', error);
        // Fallback mockup
        queue.value = [
            { id: 101, name: 'Global Excellence Scholarship 2024 (Stanford University)', type: 'Scholarship Content', submission_date: '24 Oct 2023', status: 'PENDING' },
            { id: 102, name: 'Stem Innovation Grant (MIT Research Labs)', type: 'Scholarship Content', submission_date: '23 Oct 2023', status: 'PENDING' },
            { id: 103, name: 'Creative Arts Fellowship (Parsons School of Design)', type: 'Scholarship Content', submission_date: '22 Oct 2023', status: 'PENDING' },
            { id: 104, name: 'Future Diplomats Award (Georgetown University)', type: 'Competition Content', submission_date: '21 Oct 2023', status: 'PENDING' }
        ];
        if (!activeItem.value) {
            selectItem(queue.value[0]);
        }
    } finally {
        isLoadingQueue.value = false;
    }
};

const selectItem = async (item) => {
    activeItem.value = item;
    const token = getAuthToken();
    if (!token) return;

    isLoadingDetails.value = true;
    activeItemDetails.value = null;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        let url = '';
        if (item.type === 'Scholarship Content') {
            url = `${backendUrl}/beasiswa/${item.id}`;
        } else {
            url = `${backendUrl}/olimpiade/${item.id}`;
        }

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.data) {
            activeItemDetails.value = response.data.data;
            runAIAnalysis(response.data.data, item.type);
        }
    } catch (error) {
        console.error('Failed to load item details:', error);
        // Mock details for standard items
        if (item.id === 101 || item.type === 'Scholarship Content') {
            activeItemDetails.value = {
                id: item.id,
                nama: item.name || 'Global Excellence Scholarship 2024',
                deskripsi: 'The Global Excellence Scholarship is designed to support high-achieving students from developing nations who demonstrate exceptional leadership potential and academic rigor. Our program covers full tuition, living expenses, and provides a dedicated research stipend.',
                kuota_pendaftar: 25,
                tipe_beasiswa: 'Penuh (Full)',
                nominal_pendanaan: 45000,
                link_informasi: 'https://stanford.edu/scholarship-global',
                instansi_id: 1
            };
        } else {
            activeItemDetails.value = {
                id: item.id,
                judul: item.name || 'Future Diplomats Award',
                deskripsi: 'A national model UN type competition evaluating international relations debate skills and diplomatic resolution drafting.',
                kuota: 150,
                tipe_lomba: 'Akademik',
                biaya_pendaftaran: 150000,
                link_informasi: 'https://georgetown.edu/diplomats',
                instansi_id: 2
            };
        }
        runAIAnalysis(activeItemDetails.value, item.type);
    } finally {
        isLoadingDetails.value = false;
    }
};

// Client-side AI verification engine to evaluate content and compute match metrics
const runAIAnalysis = async (details, type) => {
    isAnalyzingAI.value = true;
    
    // Attempt real connection to AI server if running locally
    try {
        const desc = details.deskripsi || '';
        const matchResponse = await axios.post('http://localhost:8001/api/match', {
            user_skill: "Post-graduate leadership STEM research global education",
            beasiswa_requirement: desc,
            top_k: 1
        });
        
        if (matchResponse.data && matchResponse.data.match_score !== undefined) {
            aiScore.value = matchResponse.data.match_score;
        } else {
            calculateClientAIScore(desc, type);
        }
    } catch (e) {
        // Fallback to sophisticated heuristic analyzer
        calculateClientAIScore(details.deskripsi || '', type);
    } finally {
        isAnalyzingAI.value = false;
    }
};

const calculateClientAIScore = (text, type) => {
    let score = 50;
    const feedbackList = [];

    // 1. Length check
    if (text.length > 200) {
        score += 15;
        feedbackList.push("Struktur deskripsi kaya dan memadai.");
    } else {
        score -= 10;
        feedbackList.push("Deskripsi terlalu pendek, tambahkan rincian manfaat.");
    }

    // 2. Keyword coverage
    const keywords = ['tuition', 'biaya', 'full', 'gratis', 'persyaratan', 'kriteria', 'prestasi', 'dolar', 'scholarship', 'eligibility', 'research'];
    let matches = 0;
    keywords.forEach(kw => {
        if (text.toLowerCase().includes(kw)) matches++;
    });
    
    score += (matches * 3);
    if (matches >= 3) {
        feedbackList.push("Mengandung kata kunci struktural penting.");
    } else {
        feedbackList.push("Kekurangan rincian kata kunci kelayakan.");
    }

    // 3. Formality checker
    const formalWords = ['desain', 'penerima', 'merupakan', 'disediakan', 'diharapkan', 'designed', 'academic', 'leadership'];
    let formalMatches = 0;
    formalWords.forEach(w => {
        if (text.toLowerCase().includes(w)) formalMatches++;
    });
    score += (formalMatches * 2);

    // Limit score
    if (score > 98) score = 98;
    if (score < 30) score = 30;

    aiScore.value = score;
    aiFeedback.value = feedbackList;
};

// Approve Content
const handleApprove = async () => {
    const token = getAuthToken();
    if (!token || !activeItem.value) return;

    isActioning.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        let url = '';
        if (activeItem.value.type === 'Scholarship Content') {
            url = `${backendUrl}/admin/verify/beasiswa/${activeItem.value.id}`;
        } else {
            url = `${backendUrl}/admin/verify/olimpiade/${activeItem.value.id}`;
        }

        await axios.put(url, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showToast(`Program "${activeItem.value.name}" berhasil disetujui!`, 'success');
        
        // Remove item from list and select another
        const index = queue.value.findIndex(i => i.id === activeItem.value.id);
        queue.value.splice(index, 1);
        activeItem.value = null;
        activeItemDetails.value = null;
        
        if (queue.value.length > 0) {
            selectItem(queue.value[0]);
        }
    } catch (error) {
        console.error('Failed to approve content:', error);
        showToast('Gagal memproses persetujuan program.', 'error');
    } finally {
        isActioning.value = false;
    }
};

// Send Revision Request
const handleRequestRevision = async () => {
    if (!revisionFeedback.value.trim()) return;

    const token = getAuthToken();
    if (!token || !activeItem.value || !activeItemDetails.value) return;

    isActioning.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // Fetch target user ID of the institution that published this program
        // We'll notify the institution publisher. We map target user ID based on instansi_id or fallback to a notification
        const targetUserId = activeItemDetails.value.instansi_id || 1; // Fallback or look up user id
        
        await axios.post(`${backendUrl}/admin/notifications`, {
            user_id: targetUserId,
            title: `Revisi Diperlukan: ${activeItem.value.name}`,
            message: `Konten program Anda memerlukan revisi sebelum disetujui: ${revisionFeedback.value}`
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        showToast(`Permintaan revisi telah dikirim ke pembuat program!`, 'success');
        showRevisionModal.value = false;
        revisionFeedback.value = '';

        // Remove item from queue list
        const index = queue.value.findIndex(i => i.id === activeItem.value.id);
        queue.value.splice(index, 1);
        activeItem.value = null;
        activeItemDetails.value = null;
        
        if (queue.value.length > 0) {
            selectItem(queue.value[0]);
        }
    } catch (error) {
        console.error('Failed to send revision request:', error);
        showToast('Gagal mengirim permintaan revisi.', 'error');
    } finally {
        isActioning.value = false;
    }
};

onMounted(() => {
    fetchQueue();
});
</script>

<template>
    <Head title="Content Verification" />

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

        <div class="space-y-8 text-left">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Content Verification Queue</h1>
                    <p class="text-sm font-medium text-slate-500">Review and manage pending scholarship and competition submissions from verified institutions.</p>
                </div>
                
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter Queue
                    </button>
                    <button class="px-4 py-2.5 bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold rounded-xl shadow-md transition duration-150 cursor-pointer flex items-center gap-1.5">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Review History
                    </button>
                </div>
            </div>

            <!-- Main Layout Split -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Panel: Active Submission details -->
                <div class="lg:col-span-8 space-y-6">
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[480px] flex flex-col justify-between relative">
                        <!-- Loader visual -->
                        <div v-if="isLoadingDetails" class="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                            <div class="text-center space-y-3">
                                <svg class="animate-spin h-8 w-8 text-purple-600 mx-auto" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p class="text-xs font-bold text-slate-400">Loading submission details...</p>
                            </div>
                        </div>

                        <!-- No Item selected -->
                        <div v-else-if="!activeItemDetails" class="flex-1 flex items-center justify-center py-16 text-slate-400 font-bold text-sm">
                            Pilih item dari antrean sebelah kanan untuk memulai peninjauan.
                        </div>

                        <!-- Details Loaded -->
                        <div v-else class="space-y-6">
                            <!-- Title info card -->
                            <div class="flex justify-between items-start">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-2">
                                        <div class="h-6 w-6 rounded bg-purple-150 text-purple-600 flex items-center justify-center">
                                            🎓
                                        </div>
                                        <h3 class="text-lg font-black text-slate-800 leading-tight">
                                            {{ activeItemDetails.nama || activeItemDetails.judul }}
                                        </h3>
                                    </div>
                                    <p class="text-xs font-semibold text-slate-450 pl-8">
                                        {{ activeItem.type === 'Scholarship Content' ? 'Stanford University • International Office' : 'Academic Institution • Dept Lomba' }}
                                    </p>
                                </div>
                                <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                    Pending 2h
                                </span>
                            </div>

                            <!-- Two Columns Details layout -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-b border-slate-50 py-6">
                                <!-- Program Details -->
                                <div class="space-y-4">
                                    <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400">Program Details</h4>
                                    
                                    <div class="space-y-2.5 text-xs font-bold">
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Award Amount</span>
                                            <span class="text-purple-600">
                                                {{ activeItem.type === 'Scholarship Content' 
                                                    ? `$${(activeItemDetails.nominal_pendanaan || 45000).toLocaleString('en-US')} / year`
                                                    : `Rp ${(activeItemDetails.biaya_pendaftaran || 150000).toLocaleString('id-ID')}` }}
                                            </span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Eligibility</span>
                                            <span class="text-slate-700">
                                                {{ activeItem.type === 'Scholarship Content' 
                                                    ? (activeItemDetails.tipe_beasiswa || 'Post-graduate') 
                                                    : (activeItemDetails.tipe_lomba || 'Akademik') }}
                                            </span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-slate-400">Quota</span>
                                            <span class="text-slate-700">
                                                {{ activeItem.type === 'Scholarship Content' 
                                                    ? activeItemDetails.kuota_pendaftar 
                                                    : activeItemDetails.kuota }} slots
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Hero Image Preview -->
                                    <div class="pt-3">
                                        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Hero Image Preview</span>
                                        <div class="aspect-[16/8] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative flex items-center justify-center">
                                            <img src="/images/hero_student.png" alt="Preview" class="w-full h-full object-cover opacity-80" />
                                            <span class="absolute bottom-2 left-2 px-2.5 py-0.5 rounded bg-slate-900/60 text-white text-[9px] font-bold backdrop-blur-sm">
                                                Hero Image Preview
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description Excerpt -->
                                <div class="space-y-4 flex flex-col justify-between">
                                    <div class="space-y-3">
                                        <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400">Description Excerpt</h4>
                                        <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <p class="text-xs leading-relaxed text-slate-500 font-semibold text-justify">
                                                {{ activeItemDetails.deskripsi }}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="pt-4">
                                        <a :href="activeItemDetails.link_informasi" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-750 hover:underline">
                                            Read full submission
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions Row -->
                            <div class="flex flex-col sm:flex-row gap-4 pt-2">
                                <button 
                                    type="button" 
                                    @click="handleApprove"
                                    :disabled="isActioning"
                                    class="w-full sm:w-1/2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Approve Program
                                </button>
                                <button 
                                    type="button" 
                                    @click="showRevisionModal = true"
                                    :disabled="isActioning"
                                    class="w-full sm:w-1/2 py-3.5 px-4 bg-white hover:bg-red-50 text-red-650 hover:text-red-700 disabled:opacity-50 rounded-2xl border border-red-200 hover:border-red-300 transition flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                                >
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Request Revision
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel: Queue List & Guidelines -->
                <div class="lg:col-span-4 space-y-6">
                    
                    <!-- Queue List -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div class="flex justify-between items-center pb-2">
                            <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider">Queue ({{ Math.max(0, queue.length - 1) }} more)</h3>
                        </div>

                        <div class="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                            <div v-for="item in queue" :key="item.id" 
                                @click="selectItem(item)"
                                class="p-3.5 border rounded-2xl cursor-pointer transition duration-150 flex items-center justify-between text-left group"
                                :class="activeItem?.id === item.id 
                                    ? 'bg-purple-50/50 border-purple-250 shadow-sm' 
                                    : 'border-slate-100 hover:bg-slate-50/50 hover:border-slate-200'"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="h-8.5 w-8.5 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                                        :class="item.type === 'Scholarship Content' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'"
                                    >
                                        {{ item.name.charAt(0) }}
                                    </div>
                                    <div class="space-y-0.5">
                                        <p class="text-xs font-bold text-slate-800 truncate max-w-[150px] leading-tight">{{ item.name }}</p>
                                        <p class="text-[9px] font-semibold text-slate-400">Submitted: {{ item.submission_date }}</p>
                                    </div>
                                </div>
                                <svg class="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <!-- AI Analysis Engine Guidelines Card -->
                    <div class="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#9333ea,transparent_55%)] opacity-50"></div>
                        
                        <div class="relative z-10 text-left">
                            <span class="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">AI Matching Index</span>
                            <div class="flex items-center gap-3 mt-2">
                                <div class="text-3xl font-black text-white leading-tight">
                                    {{ isAnalyzingAI ? 'Analyzing...' : `${aiScore}%` }}
                                </div>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                    :class="aiScore > 75 ? 'bg-emerald-500/25 text-emerald-200' : 'bg-amber-500/25 text-amber-200'"
                                >
                                    {{ aiScore > 75 ? 'High Quality' : 'Needs Review' }}
                                </span>
                            </div>
                            
                            <div class="mt-4 pt-4 border-t border-white/10 space-y-2">
                                <p class="text-[10px] font-bold uppercase text-indigo-200 tracking-wider">AI Evaluation Feedback</p>
                                <div v-if="isAnalyzingAI" class="space-y-1.5">
                                    <div class="h-3 w-3/4 bg-white/15 rounded animate-pulse"></div>
                                    <div class="h-3 w-1/2 bg-white/15 rounded animate-pulse"></div>
                                </div>
                                <ul v-else class="space-y-1.5 text-xs text-white/80 font-medium">
                                    <li v-for="(f, i) in aiFeedback" :key="i" class="flex items-start gap-1.5">
                                        <span class="text-indigo-400">✦</span> {{ f }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Review Guidelines Checklist -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <h4 class="text-xs font-black text-slate-800 uppercase tracking-wider text-left">Review Guidelines</h4>
                        <p class="text-[11px] font-semibold text-slate-450 leading-relaxed text-justify">
                            Ensure all submissions meet ScholarPath's premium academic standards.
                        </p>
                        
                        <div class="space-y-2.5 text-xs text-slate-700 font-bold">
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>Institutional ID Verified</span>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>No Spelled Errors</span>
                            </div>
                            <div class="flex items-center gap-2.5">
                                <span class="h-5 w-5 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">✓</span>
                                <span>High-Res Media Included</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Stats matrix row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        ✓
                    </div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Approved Today</span>
                        <p class="text-sm font-black text-slate-850">24 items</p>
                    </div>
                </div>

                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                        🕒
                    </div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Avg. Wait Time</span>
                        <p class="text-sm font-black text-slate-850">4.2 hours</p>
                    </div>
                </div>

                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-red-50 text-red-650 flex items-center justify-center font-bold text-sm shrink-0">
                        ⚠
                    </div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Revision Rate</span>
                        <p class="text-sm font-black text-slate-850">12% rate</p>
                    </div>
                </div>

                <div class="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3">
                    <div class="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                        📈
                    </div>
                    <div class="text-left">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Active</span>
                        <p class="text-sm font-black text-slate-850">842 items</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Compose Revision Modal -->
        <transition name="fade">
            <div v-if="showRevisionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showRevisionModal = false"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Ajukan Umpan Balik Revisi</h3>
                        <button type="button" @click="showRevisionModal = false" class="text-slate-400 hover:text-slate-600 transition text-xl">&times;</button>
                    </div>

                    <form @submit.prevent="handleRequestRevision" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Program Target</label>
                            <input
                                type="text"
                                :value="activeItem?.name"
                                disabled
                                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"
                            />
                        </div>

                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Keterangan / Instruksi Revisi</label>
                            <textarea
                                v-model="revisionFeedback"
                                required
                                rows="5"
                                placeholder="Jelaskan bagian mana saja yang perlu direvisi atau diperbaiki oleh pihak instansi..."
                                class="w-full px-4 py-2.5 border border-slate-150 focus:border-purple-500 rounded-xl text-xs text-slate-855 transition outline-none resize-none"
                            ></textarea>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
                            <button
                                type="button"
                                @click="showRevisionModal = false"
                                class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                :disabled="isActioning"
                                class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer flex items-center justify-center gap-2"
                            >
                                <svg v-if="isActioning" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Kirim Permintaan Revisi
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
