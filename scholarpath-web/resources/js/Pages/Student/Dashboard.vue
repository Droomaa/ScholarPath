<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import StudentLayout from '@/Layouts/StudentLayout.vue';
import Card from '@/Components/Card.vue';
import { Sparkles, ArrowUpRight, Clock, Building, Activity, Trophy, X, Heart, Loader2, ArrowRight } from '@lucide/vue';
import { backendApi } from '@/utils/api';
import axios from 'axios';

const page = usePage();
const programs = ref([]);
const activeTab = ref('beasiswa');
const wishlist = ref({});
const appliedPrograms = ref([]); // Tracks user applications
const matchScoreThreshold = ref(50);
const recommendations = ref([]);
const isLoadingRecommendations = ref(false);

const userProfile = ref(null);
const isProfileEmpty = computed(() => {
    if (!userProfile.value?.keahlian) return true;
    try {
        const parsed = JSON.parse(userProfile.value.keahlian);
        return !parsed.ai_query;
    } catch(e) {
        return true;
    }
});

// --- Apply Wizard State ---
const showApplyModal = ref(false);
const selectedProgram = ref(null);
const submitting = ref(false);
const applyStep = ref(1);
const agreeTerms = ref(false);
const applyAlasan = ref('');
const uploadedFiles = ref({});

// --- AI Wizard State ---
const showAiWizard = ref(false);
const aiStep = ref(1);
const isAiSimulating = ref(false);
const aiForm = ref({
    bidang: '',
    subKeahlian: '',
    preferensi: [],
    tujuan: '',
    inspirasi: ''
});

const fetchData = async () => {
    try {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
        if (token) {
            backendApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch User Profile First
        try {
            const profileRes = await backendApi.get('/user/profile');
            userProfile.value = profileRes.data?.data || null;
            
            // Auto run AI if profile exists and recommendations empty
            if (!isProfileEmpty.value && recommendations.value.length === 0) {
                let aiQuery = '';
                try {
                    const parsed = JSON.parse(userProfile.value.keahlian);
                    aiQuery = parsed.ai_query || '';
                } catch(e) {}
                if (aiQuery) {
                    runSilentAiMatcher(aiQuery);
                }
            }
        } catch (err) {
            console.error("Failed to load profile", err);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const search = urlParams.get('search') || '';
        const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
        
        if (activeTab.value === 'beasiswa') {
            const res = await backendApi.get('/beasiswa' + searchParam);
            programs.value = (res.data?.data || []).map(b => ({
                ...b, id: b.id, judul: b.nama, type: 'beasiswa', color: 'brand', icon: Building
            }));
        } else if (activeTab.value === 'kompetisi') {
            const res = await backendApi.get('/olimpiade' + searchParam);
            programs.value = (res.data?.data || []).map(o => ({
                ...o, id: o.id, judul: o.judul, type: 'olimpiade', color: 'green', icon: Trophy
            }));
        }
        
        // Fetch user wishlist
        const wRes = await backendApi.get('/user/wishlist');
        const list = wRes.data?.data || [];
        const wMap = {};
        list.forEach(w => {
            if (w.beasiswa_id) wMap[`beasiswa_${w.beasiswa_id}`] = w.id;
            if (w.olimpiade_id) wMap[`olimpiade_${w.olimpiade_id}`] = w.id;
        });
        wishlist.value = wMap;

        // Fetch user applied programs
        const aRes = await backendApi.get('/user/pendaftaran').catch(() => ({ data: [] }));
        appliedPrograms.value = aRes.data?.data || [];
    } catch (e) {
        console.error("Failed to fetch programs", e);
    }
};

const toggleWishlist = async (prog) => {
    const key = `${prog.type}_${prog.id}`;
    try {
        if (wishlist.value[key]) {
            await backendApi.delete(`/user/wishlist/${wishlist.value[key]}`);
            delete wishlist.value[key];
        } else {
            const payload = prog.type === 'beasiswa' ? { beasiswa_id: prog.id } : { olimpiade_id: prog.id };
            const res = await backendApi.post('/user/wishlist', payload);
            wishlist.value[key] = res.data?.data?.id || Date.now();
        }
    } catch (e) {
        console.error('Failed to toggle wishlist', e);
    }
};

// --- AI Wizard Methods ---
const openAiWizard = () => {
    aiStep.value = 1;
    showAiWizard.value = true;
    aiForm.value = { bidang: '', subKeahlian: '', preferensi: [], tujuan: '', inspirasi: '' };
};

const nextAiStep = () => {
    if (aiStep.value < 5) {
        aiStep.value++;
    } else {
        runAiMatcher();
    }
};

const runAiMatcher = async () => {
    isAiSimulating.value = true;
    
    // Simulate complex algorithm computation for 1.5s
    setTimeout(async () => {
        isAiSimulating.value = false;
        showAiWizard.value = false;
        
        // Combine prompt for python AI matcher
        const query = `${aiForm.value.bidang} ${aiForm.value.subKeahlian} ${aiForm.value.tujuan} ${aiForm.value.inspirasi}`;
        
        try {
            isLoadingRecommendations.value = true;
            
            // Save to Golang Profile First
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
            
            // Get existing profile to merge keahlian
            let existingKeahlian = {};
            if (userProfile.value && userProfile.value.keahlian) {
                try { existingKeahlian = JSON.parse(userProfile.value.keahlian); } catch(e) {}
            }
            existingKeahlian.ai_query = query;
            
            await backendApi.put('/user/profile', {
                keahlian: JSON.stringify(existingKeahlian)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state so it doesn't show empty
            if (userProfile.value) {
                userProfile.value.keahlian = JSON.stringify(existingKeahlian);
            } else {
                userProfile.value = { keahlian: JSON.stringify(existingKeahlian) };
            }
            
            const res = await axios.post('http://localhost:8001/api/match', {
                user_skill: query,
                top_k: 10
            });
            let recs = res.data?.data || res.data || [];
            
            recs.sort((a,b) => (b.similarity_score || b.match_score) - (a.similarity_score || a.match_score));
            recommendations.value = recs;
        } catch (e) {
            console.error("AI matching failed", e);
            alert("Sistem Rekomendasi AI sedang offline.");
        } finally {
            isLoadingRecommendations.value = false;
        }
    }, 1500);
};

const runSilentAiMatcher = async (query) => {
    try {
        isLoadingRecommendations.value = true;
        const res = await axios.post('http://localhost:8001/api/match', {
            user_skill: query,
            top_k: 10
        });
        let recs = res.data?.data || res.data || [];
        recs.sort((a,b) => (b.similarity_score || b.match_score) - (a.similarity_score || a.match_score));
        recommendations.value = recs;
    } catch (e) {
        console.error("Silent AI matching failed", e);
    } finally {
        isLoadingRecommendations.value = false;
    }
};

const filteredRecommendations = computed(() => {
    return recommendations.value.filter(r => {
        const score = (r.similarity_score || r.match_score || 0);
        const normalizedScore = score <= 1 ? score * 100 : score;
        return normalizedScore >= matchScoreThreshold.value;
    });
});

const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0,00';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

// --- Apply Wizard Methods ---
const openApplyModal = (program) => {
    // Double Submission Protection
    const isApplied = appliedPrograms.value.find(p => p.program_id === program.id && p.program_type.toLowerCase() === program.type.toLowerCase() && ['pending','reviewing','accept','lolos','reject','tolak'].some(s => (p.status_name || p.status || '').toLowerCase().includes(s)));
    if (isApplied) {
        alert('Anda sudah mendaftar pada program ini dan statusnya sedang diproses atau sudah diputuskan.');
        return;
    }

    // Deadline Protection
    if (program.deadline && new Date() > new Date(program.deadline)) {
        alert('Mohon maaf, periode pendaftaran untuk program ini telah ditutup.');
        return;
    }

    selectedProgram.value = program;
    uploadedFiles.value = {};
    applyStep.value = 1;
    agreeTerms.value = false;
    applyAlasan.value = '';
    showApplyModal.value = true;
};

const handleFileSelect = (reqName, event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.type !== 'application/pdf') {
            alert('File wajib berformat PDF!');
            event.target.value = '';
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            alert('Ukuran file tidak boleh melampaui 100MB!');
            event.target.value = '';
            return;
        }
        uploadedFiles.value[reqName] = file;
    }
};

const submitApplication = async (statusLabel) => {
    try {
        submitting.value = true;
        
        let persyaratanList = [];
        if (selectedProgram.value.persyaratan_file) {
            try { persyaratanList = JSON.parse(selectedProgram.value.persyaratan_file) || []; } catch(e) {}
        }
        
        // Cek file wajib
        for (const req of persyaratanList) {
            if (!uploadedFiles.value[req]) {
                alert(`Anda harus mengunggah file untuk: ${req}`);
                submitting.value = false;
                return;
            }
        }

        const urls = {};
        for (const req of persyaratanList) {
            const formData = new FormData();
            formData.append('file', uploadedFiles.value[req]);
            const uploadRes = await backendApi.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            urls[req] = uploadRes.data.file_url;
        }

        const payload = {
            file_berkas: JSON.stringify(urls),
            status: statusLabel,
            alasan: applyAlasan.value
        };

        if (selectedProgram.value.type === 'beasiswa') {
            payload.beasiswa_id = selectedProgram.value.id;
        } else {
            payload.olimpiade_id = selectedProgram.value.id;
        }

        await backendApi.post('/user/pendaftaran', payload);
        
        if(statusLabel === 'Draft') {
            alert("Pendaftaran disimpan sebagai Draft!");
        } else {
            alert("Pendaftaran Berhasil Dikirim!");
            // Auto Unsaved
            const key = `${selectedProgram.value.type}_${selectedProgram.value.id}`;
            if (wishlist.value[key]) {
                await backendApi.delete(`/user/wishlist/${wishlist.value[key]}`).catch(()=>{});
            }
        }
        
        showApplyModal.value = false;
        fetchData(); // Refresh to update applied programs
    } catch (e) {
        console.error("Failed to submit application", e);
        alert("Gagal melakukan pendaftaran.");
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    fetchData();
});

watch(() => page.url, () => {
    fetchData();
});

watch(activeTab, () => {
    fetchData();
});
</script>

<template>
    <StudentLayout>
        <Head title="Student Dashboard" />

        <div class="max-w-7xl mx-auto space-y-8">
            <!-- AI Recommendation Box (Placeholder vs Filled) -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-2xl font-black text-slate-900 tracking-tight">AI Recommendations</h2>
                    <button v-if="recommendations.length > 0" @click="openAiWizard" class="px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-bold hover:bg-brand-200 transition-colors">
                        Re-run AI Matcher
                    </button>
                </div>

                <div v-if="isProfileEmpty" class="bg-gradient-to-br from-indigo-50 to-brand-50 rounded-3xl p-10 border border-brand-100/50 shadow-sm text-center relative overflow-hidden">
                    <div class="absolute -top-24 -left-24 w-64 h-64 bg-brand-200/40 rounded-full blur-3xl pointer-events-none"></div>
                    <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/10 mb-6 border border-slate-100">
                            <Sparkles class="w-10 h-10 text-brand-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-slate-900 mb-2">Belum ada rekomendasi AI</h3>
                        <p class="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">Profil Anda belum lengkap. Beritahu AI kami tentang minat dan keahlian Anda untuk menemukan beasiswa dan kompetisi yang paling cocok.</p>
                        <button @click="openAiWizard" class="px-8 py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2">
                            <Sparkles class="w-5 h-5" />
                            Cek Kecocokan Saya
                        </button>
                    </div>
                </div>

                <div v-else-if="isLoadingRecommendations" class="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <Loader2 class="w-10 h-10 text-brand-600 animate-spin" />
                        <h3 class="text-lg font-bold text-slate-900">Menganalisis Kecocokan...</h3>
                        <p class="text-sm text-slate-500">AI sedang mencocokkan profil Anda dengan ratusan program yang tersedia.</p>
                    </div>
                </div>

                <div v-else-if="recommendations.length === 0 && !isLoadingRecommendations" class="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles class="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 mb-2">Tidak ada rekomendasi cocok</h3>
                    <p class="text-slate-500 max-w-md mx-auto">Kami tidak menemukan program yang cocok dengan profil Anda saat ini. Coba perbarui profil Anda.</p>
                </div>

                <div v-else>
                    <div class="flex items-center gap-4 mb-4 justify-end">
                        <label class="text-sm font-bold text-slate-600">Threshold: {{ matchScoreThreshold }}%</label>
                        <input type="range" v-model.number="matchScoreThreshold" min="0" max="100" class="w-32 accent-brand-600" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card v-for="(rec, idx) in filteredRecommendations" :key="idx" class="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                                    <Sparkles class="w-5 h-5" />
                                </div>
                                <span class="px-2.5 py-1 rounded-md bg-green-50 text-green-600 text-xs font-extrabold border border-green-100">{{ rec.match_score.toFixed(0) }}% MATCH</span>
                            </div>
                            <h3 class="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{{ rec.beasiswa.nama || rec.beasiswa.judul }}</h3>
                            <p class="text-sm text-slate-500 mb-6 line-clamp-2">{{ rec.beasiswa.deskripsi }}</p>
                            <button @click="openApplyModal({...rec.beasiswa, judul: rec.beasiswa.nama || rec.beasiswa.judul, type: 'beasiswa'})" class="w-full py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                Apply Now
                            </button>
                        </Card>
                    </div>
                </div>
            </div>

            <!-- Horizontal Scroll Latest Programs -->
            <div class="mt-12">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-slate-900">Program Terbaru</h2>
                    <div class="flex gap-2">
                        <button @click="activeTab = 'beasiswa'" :class="activeTab === 'beasiswa' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">Beasiswa</button>
                        <button @click="activeTab = 'kompetisi'" :class="activeTab === 'kompetisi' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm">Olimpiade/Lomba</button>
                        <Link :href="route('dashboard')" class="px-4 py-2 rounded-full bg-slate-100 text-brand-700 text-sm font-bold hover:bg-brand-50 transition-colors ml-2 border border-slate-200">Lihat Semua</Link>
                    </div>
                </div>

                <div class="flex overflow-x-auto snap-x snap-mandatory space-x-6 pb-6 hide-scrollbar" v-if="programs.length > 0">
                    <Card v-for="prog in programs" :key="prog.type + prog.id" class="snap-center shrink-0 w-80 md:w-96 flex flex-col p-6 hover:shadow-xl transition-all duration-300 border-slate-100 bg-white">
                        <div class="flex items-center justify-between mb-4">
                            <span :class="`text-[10px] font-bold text-${prog.color}-600 uppercase tracking-wider bg-${prog.color}-50 px-2.5 py-1 rounded-md border border-${prog.color}-100`">{{ prog.type }}</span>
                            <button @click="toggleWishlist(prog)" class="text-slate-300 hover:text-red-500 transition-colors">
                                <Heart :class="{'fill-red-500 text-red-500': wishlist[`${prog.type}_${prog.id}`]}" class="w-6 h-6 transition-all" />
                            </button>
                        </div>
                        <h3 class="font-bold text-slate-900 mb-2 text-lg leading-tight line-clamp-2 min-h-[3rem]">{{ prog.judul }}</h3>
                        <p class="text-sm text-slate-500 mb-6 line-clamp-3 min-h-[4.5rem]">{{ prog.deskripsi }}</p>
                        <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                            <div class="text-xs font-bold text-slate-400">
                                Kuota: {{ prog.kuota_pendaftar || prog.kuota || '-' }}
                            </div>
                            <button @click="openApplyModal(prog)" class="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center">
                                Details <ArrowUpRight class="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </Card>
                </div>
                <div v-else class="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                    <p class="text-slate-500 font-medium">Belum ada program yang tersedia saat ini.</p>
                </div>
            </div>
        </div>

        <!-- 3-STEP APPLY WIZARD MODAL -->
        <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <!-- Modal Header -->
                <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">{{ applyStep }}</div>
                        <h2 class="text-lg font-black text-slate-900">
                            {{ applyStep === 1 ? 'Eligibility & Syarat Ketentuan' : applyStep === 2 ? 'Lengkapi Dokumen' : 'Konfirmasi Pendaftaran' }}
                        </h2>
                    </div>
                    <button @click="showApplyModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200">
                        <X class="w-6 h-6" />
                    </button>
                </div>
                
                <!-- Modal Body -->
                <div class="p-6 md:p-8 overflow-y-auto flex-1">
                    <!-- STEP 1 -->
                    <div v-if="applyStep === 1" class="space-y-6">
                        <h3 class="text-xl font-bold text-slate-900">{{ selectedProgram.judul }}</h3>
                        
                        <div class="space-y-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <span class="font-bold text-slate-900">Instansi Pembuat:</span> 
                                {{ selectedProgram.instansi?.name || selectedProgram.instansi?.username || 'Unknown' }}
                            </div>
                            <div>
                                <span class="font-bold text-slate-900">Deskripsi:</span> 
                                <p class="mt-1">{{ selectedProgram.deskripsi }}</p>
                            </div>
                            <div class="pt-2 border-t border-slate-200">
                                <div v-if="selectedProgram.type === 'beasiswa'">
                                    <p class="font-bold text-slate-700">Dana Pendanaan yang Diterima:</p>
                                    <p class="text-brand-600 font-black text-lg">{{ formatCurrency(selectedProgram.nominal_pendanaan) }}</p>
                                </div>
                                <div v-else>
                                    <p class="font-bold text-slate-700">Biaya Registrasi Pendaftaran:</p>
                                    <p class="text-green-600 font-black text-lg">{{ formatCurrency(selectedProgram.biaya_pendaftaran) }}</p>
                                </div>
                            </div>
                            <div>
                                <span class="font-bold text-slate-900">Tanggal Deadline:</span> 
                                {{ selectedProgram.deadline ? new Date(selectedProgram.deadline).toLocaleDateString('id-ID') : '-' }}
                            </div>
                        </div>

                        <div class="p-5 bg-amber-50 border border-amber-200 rounded-xl">
                            <h4 class="text-amber-800 font-bold mb-2">Syarat & Ketentuan Legal</h4>
                            <ul class="list-disc list-inside text-sm text-amber-700 space-y-1">
                                <li>Pendaftar wajib mengunggah dokumen asli dan tidak dimanipulasi.</li>
                                <li>Instansi berhak membatalkan kelulusan jika ditemukan kecurangan.</li>
                                <li>Pastikan data profil Anda sudah lengkap dan benar.</li>
                            </ul>
                        </div>
                        <label class="flex items-start gap-3 cursor-pointer group">
                            <div class="mt-0.5">
                                <input type="checkbox" v-model="agreeTerms" class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                            </div>
                            <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                Saya telah membaca dan menyetujui seluruh persyaratan yang ditetapkan oleh instansi penyelenggara program ini.
                            </span>
                        </label>
                    </div>

                    <!-- STEP 2 -->
                    <div v-if="applyStep === 2" class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-900 mb-2">Kenapa Anda tertarik mengikuti program ini?</label>
                            <textarea v-model="applyAlasan" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm" placeholder="Tuliskan motivasi Anda (Opsional namun disarankan)..."></textarea>
                        </div>
                        <div v-if="selectedProgram.persyaratan_file && JSON.parse(selectedProgram.persyaratan_file || '[]').length > 0">
                            <h4 class="text-sm font-bold text-slate-900 mb-3">Dokumen Wajib (PDF Max 100MB)</h4>
                            <div class="space-y-3">
                                <div v-for="req in JSON.parse(selectedProgram.persyaratan_file || '[]')" :key="req" class="p-4 border-2 rounded-xl" :class="uploadedFiles[req] ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'">
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-bold text-slate-700">{{ req }}</span>
                                        <input type="file" accept=".pdf" @change="e => handleFileSelect(req, e)" class="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3 -->
                    <div v-if="applyStep === 3" class="space-y-6 text-center">
                        <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 class="w-10 h-10" />
                        </div>
                        <h3 class="text-2xl font-black text-slate-900">Review Selesai</h3>
                        <p class="text-slate-600">Dokumen Anda sudah siap dikirim. Anda dapat menyimpannya sebagai Draft jika masih ingin merevisi nanti, atau Submit sekarang untuk diproses oleh Instansi.</p>
                    </div>
                </div>
                
                <!-- Modal Footer -->
                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button v-if="applyStep > 1" @click="applyStep--" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Kembali</button>
                        
                        <button v-if="applyStep === 1" @click="toggleWishlist(selectedProgram)" class="px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 border-2 border-slate-200 hover:bg-slate-100" :class="wishlist[`${selectedProgram.type}_${selectedProgram.id}`] ? 'text-red-500' : 'text-slate-600'">
                            <Heart class="w-5 h-5" :class="{'fill-current': wishlist[`${selectedProgram.type}_${selectedProgram.id}`]}" />
                            {{ wishlist[`${selectedProgram.type}_${selectedProgram.id}`] ? 'Unsaved' : 'Save Program' }}
                        </button>
                    </div>

                    <button v-if="applyStep === 1" @click="applyStep++" :disabled="!agreeTerms" class="px-6 py-2.5 rounded-xl font-bold text-white transition-colors" :class="agreeTerms ? 'bg-brand-600 hover:bg-brand-700' : 'bg-slate-300 cursor-not-allowed'">Daftar</button>
                    
                    <button v-if="applyStep === 2" @click="applyStep++" class="px-6 py-2.5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors">Review</button>

                    <div v-if="applyStep === 3" class="flex gap-3">
                        <button @click="submitApplication('Draft')" :disabled="submitting" class="px-6 py-2.5 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 transition-colors shadow-sm disabled:opacity-50">
                            Save Draft
                        </button>
                        <button @click="submitApplication('Pending')" :disabled="submitting" class="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
                            <span v-if="submitting"><Loader2 class="w-4 h-4 animate-spin" /> Mengirim...</span>
                            <span v-else>Submit Application</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MULTI-STEP AI MATCHER WIZARD -->
        <div v-if="showAiWizard" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div class="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
                
                <!-- Loading State Simulation -->
                <div v-if="isAiSimulating" class="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center p-8 text-center">
                    <div class="relative w-24 h-24 mb-8">
                        <div class="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div class="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Sparkles class="w-8 h-8 text-brand-600 animate-pulse" />
                        </div>
                    </div>
                    <h3 class="text-2xl font-black text-slate-900 mb-2">Menganalisis Profil...</h3>
                    <p class="text-sm text-slate-500 font-medium max-w-sm">Algoritma Cosine Similarity sedang mencocokkan keahlian Anda dengan ribuan program unggulan.</p>
                </div>

                <!-- Wizard Steps -->
                <div v-else>
                    <!-- Header -->
                    <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Sparkles class="w-5 h-5 text-brand-600" />
                            <span class="font-bold text-slate-900 text-sm tracking-wide">AI MATCHER</span>
                        </div>
                        <div class="flex gap-1">
                            <div v-for="i in 5" :key="i" class="w-2 h-2 rounded-full transition-colors" :class="i <= aiStep ? 'bg-brand-600' : 'bg-slate-200'"></div>
                        </div>
                    </div>

                    <div class="p-8">
                        <div v-if="aiStep === 1">
                            <h3 class="text-xl font-bold text-slate-900 mb-6">Pilih bidang fokus utama Anda:</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <label v-for="opt in ['STEM', 'Socio & Humanities', 'Arts', 'Science']" :key="opt" class="cursor-pointer">
                                    <input type="radio" v-model="aiForm.bidang" :value="opt" class="peer sr-only" />
                                    <div class="p-4 rounded-xl border-2 transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50 border-slate-200 hover:border-brand-300 font-bold text-slate-700 text-center">{{ opt }}</div>
                                </label>
                            </div>
                        </div>

                        <div v-if="aiStep === 2">
                            <h3 class="text-xl font-bold text-slate-900 mb-6">Apa spesialisasi teknis Anda?</h3>
                            <input type="text" v-model="aiForm.subKeahlian" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 text-lg font-medium" placeholder="Contoh: Software Development" autofocus />
                        </div>

                        <div v-if="aiStep === 3">
                            <h3 class="text-xl font-bold text-slate-900 mb-6">Pilih preferensi program Anda:</h3>
                            <div class="space-y-3">
                                <label class="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" value="Beasiswa" v-model="aiForm.preferensi" class="w-5 h-5 text-brand-600 rounded" />
                                    <span class="font-bold text-slate-700">Peluang Beasiswa</span>
                                </label>
                                <label class="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" value="Kompetisi" v-model="aiForm.preferensi" class="w-5 h-5 text-brand-600 rounded" />
                                    <span class="font-bold text-slate-700">Kompetisi / Olimpiade</span>
                                </label>
                            </div>
                        </div>

                        <div v-if="aiStep === 4">
                            <h3 class="text-xl font-bold text-slate-900 mb-6">Tujuan utama Anda mengikuti program?</h3>
                            <div class="grid grid-cols-1 gap-3">
                                <label v-for="opt in ['Networking & Relasi', 'Pengembangan Skill', 'Dukungan Finansial', 'Portfolio/Sertifikat']" :key="opt" class="cursor-pointer">
                                    <input type="radio" v-model="aiForm.tujuan" :value="opt" class="peer sr-only" />
                                    <div class="p-4 rounded-xl border-2 transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50 border-slate-200 font-bold text-slate-700">{{ opt }}</div>
                                </label>
                            </div>
                        </div>

                        <div v-if="aiStep === 5">
                            <h3 class="text-xl font-bold text-slate-900 mb-6">Inspirasi Karir Anda di masa depan?</h3>
                            <select v-model="aiForm.inspirasi" class="w-full px-4 py-4 rounded-xl border-2 border-slate-200 focus:border-brand-500 font-bold text-slate-700">
                                <option value="" disabled>Pilih Bidang Karir...</option>
                                <option>Engineering & Technology</option>
                                <option>Medical & Healthcare</option>
                                <option>Business & Management</option>
                                <option>Creative & Media</option>
                                <option>Education & Research</option>
                            </select>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <button @click="showAiWizard = false" class="px-4 py-2 font-bold text-slate-500 hover:text-slate-800">Batal</button>
                        <button @click="nextAiStep" class="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors flex items-center gap-2">
                            {{ aiStep === 5 ? 'Temukan Kecocokan' : 'Lanjutkan' }} <ArrowRight v-if="aiStep < 5" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </StudentLayout>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
