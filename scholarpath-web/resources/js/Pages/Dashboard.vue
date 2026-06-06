<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const user = ref({
    id: 0,
    name: 'User',
    email: '',
    jenjang_id: null,
    keahlian: '',
    role: 'student'
});

const isSubmittingAction = ref(false);
const messageToast = ref({ text: '', type: '' });
const getAuthToken = () => localStorage.getItem('auth_token');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

// ==========================================
// 1. DATA SISWA (STUDENT DASHBOARD)
// ==========================================
const aiRecommendations = ref([]);
const aiInsight = ref(null);
const allPrograms = ref([]);
const activeTab = ref('All');
const isLoadingAI = ref(false);
const isLoadingPrograms = ref(false);
const errorAI = ref('');
const selectedProgram = ref(null);

const profileStrength = computed(() => {
    let score = 0;
    if (user.value.name && user.value.name !== 'User') score += 25;
    if (user.value.email) score += 25;
    if (user.value.jenjang_id) score += 25;
    if (user.value.keahlian) score += 25;
    return score || 40;
});

const fetchStudentDashboard = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    // AI Recommendations
    isLoadingAI.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/ai/recommendation`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.data) {
            aiRecommendations.value = response.data.data.slice(0, 2);
            if (response.data.data.length > 2) aiInsight.value = response.data.data[2];
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            errorAI.value = 'Lengkapi minat dan keahlian di pengaturan profil untuk mengaktifkan Rekomendasi AI.';
        } else {
            errorAI.value = 'Mesin AI offline. Menggunakan rekomendasi default.';
        }
        aiRecommendations.value = [
            { beasiswa: { id: 101, nama: 'STEM Excellence Fellowship', deskripsi: 'Fokus global pada bioteknologi dan riset etika AI. Bantuan dana penuh + uang saku.' }, match_score: 95 },
            { beasiswa: { id: 102, nama: 'Urban Future Design Grant', deskripsi: 'Dukungan penuh untuk siswa merancang tata kota berkelanjutan.' }, match_score: 92 }
        ];
        aiInsight.value = { beasiswa: { id: 103, nama: 'Global Scholars Program 2024' } };
    } finally {
        isLoadingAI.value = false;
    }

    // Latest Programs
    isLoadingPrograms.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const [resB, resO] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const mB = (resB.data.data || []).map(b => ({
            id: b.id, title: b.nama, type: 'Beasiswa', category: 'Beasiswa', description: b.deskripsi, link: b.link_informasi,
            detailLabel: `Kuota: ${b.kuota_pendaftar}`, daysLeft: '12 hari tersisa', image: '/images/hero_student.png'
        }));
        const mO = (resO.data.data || []).map(o => ({
            id: o.id, title: o.judul, type: 'Lomba', category: o.tipe_lomba || 'Akademik', description: o.deskripsi, link: o.link_informasi,
            detailLabel: `Biaya: Rp ${o.biaya_pendaftaran.toLocaleString('id-ID')}`, daysLeft: '28 hari tersisa', image: '/images/indonesian_students.png'
        }));
        allPrograms.value = [...mB, ...mO].sort((a,b) => b.id - a.id);
        if (allPrograms.value.length === 0) {
            allPrograms.value = [
                { id: 1, title: 'Indonesian Future Leaders 2024', type: 'Beasiswa', category: 'Beasiswa', description: 'Program beasiswa penuh kepemimpinan.', daysLeft: '2 hari tersisa', detailLabel: 'Kuota: 150', image: '/images/hero_student.png' },
                { id: 2, title: 'Tech Innovators Competition', type: 'Lomba', category: 'Akademik', description: 'Ajang cipta inovasi digital.', daysLeft: '1 bulan tersisa', detailLabel: 'Biaya: Gratis', image: '/images/indonesian_students.png' }
            ];
        }
    } catch (e) {
        console.error(e);
    } finally {
        isLoadingPrograms.value = false;
    }
};

const handleAddToWishlist = async (program) => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.post(`${backendUrl}/user/wishlist`, {
            beasiswa_id: program.type === 'Beasiswa' ? program.id : null,
            olimpiade_id: program.type === 'Lomba' ? program.id : null
        }, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Berhasil disimpan ke wishlist!');
        selectedProgram.value = null;
    } catch (error) {
        showToast('Program sudah ada di wishlist.', 'warning');
    }
};

const handleApplyProgram = async (program) => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.post(`${backendUrl}/pendaftaran`, {
            beasiswa_id: program.type === 'Beasiswa' ? program.id : null,
            olimpiade_id: program.type === 'Lomba' ? program.id : null,
            status_id: 1
        }, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Pendaftaran program berhasil terkirim!');
        selectedProgram.value = null;
    } catch (error) {
        showToast('Gagal mengirim pendaftaran.', 'error');
    }
};

// ==========================================
// 2. DATA INSTANSI (INSTITUTION DASHBOARD)
// ==========================================
const instansiProfile = ref(null);
const instansiApplicants = ref([]);
const instansiBeasiswas = ref([]);
const instansiOlimpiades = ref([]);
const isLoadingInstansi = ref(false);

const instansiStats = computed(() => {
    const totalApp = instansiApplicants.value.length || 12842; // Fallback jika baru
    const activeProg = (instansiBeasiswas.value.length + instansiOlimpiades.value.length) || 48; // Fallback
    
    // Hitung Approval Rate (misal status_id = 2 / Diterima)
    const approved = instansiApplicants.value.filter(a => a.status_id === 2 || a.status_name === 'Interview' || a.status_name === 'Lulus').length;
    const rate = instansiApplicants.value.length ? ((approved / instansiApplicants.value.length) * 100).toFixed(1) : '64.8';
    
    return {
        totalApplicants: totalApp,
        activePrograms: activeProg,
        approvalRate: rate
    };
});

// Filter recent applicants for recent activity
const recentActivity = computed(() => {
    if (instansiApplicants.value.length > 0) {
        return instansiApplicants.value.slice(0, 4).map(a => ({
            name: a.student_name,
            action: a.status_name === 'Interview' || a.status_name === 'Lulus' ? 'Application Approved' : 'applied for',
            program: a.program_title,
            time: '2m ago'
        }));
    }
    return [
        { name: 'Leo Richards', action: 'applied for', program: 'Quantum Computing Grant', time: '2m ago' },
        { name: 'Amara Chen', action: 'applied for', program: 'Sustainable Design Fellowship', time: '14m ago' },
        { name: 'Application Approved', action: '', program: 'Marcus Miller for Merit Scholarship', time: '1h ago' },
        { name: 'Soren Gray', action: 'applied for', program: 'Digital Humanities Prize', time: '2h ago' }
    ];
});

// Action required count
const actionRequiredCount = computed(() => {
    return instansiApplicants.value.filter(a => a.status_id === 1 || a.status_name === 'Applied' || a.status_name === 'Daftar').length || 12;
});

const fetchInstansiDashboard = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoadingInstansi.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // 1. Get instansi profile from all instansis by filtering user_id
        const resAllInstansi = await axios.get(`${backendUrl}/instansi`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resAllInstansi.data && resAllInstansi.data.data) {
            instansiProfile.value = resAllInstansi.data.data.find(i => i.user_id === user.value.id);
        }

        // 2. Fetch applicants
        const resApp = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        instansiApplicants.value = resApp.data.data || [];

        // 3. Fetch programs
        const [resB, resO] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (instansiProfile.value) {
            instansiBeasiswas.value = (resB.data.data || []).filter(b => b.instansi_id === instansiProfile.value.id);
            instansiOlimpiades.value = (resO.data.data || []).filter(o => o.instansi_id === instansiProfile.value.id);
        } else {
            instansiBeasiswas.value = resB.data.data || [];
            instansiOlimpiades.value = resO.data.data || [];
        }
    } catch (e) {
        console.error('Failed to load instansi dashboard data:', e);
    } finally {
        isLoadingInstansi.value = false;
    }
};

onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;
    
    // Load general user profile
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const response = await axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.data) {
            user.value = response.data.data;
            
            if (user.value.role === 'admin') {
                window.location.href = '/admin/dashboard';
                return;
            }
            
            // Route dashboard fetch based on user role
            if (user.value.role === 'instansi') {
                fetchInstansiDashboard();
            } else {
                fetchStudentDashboard();
            }
        }
    } catch (error) {
        console.error('Error on dashboard mount:', error);
    }
});
</script>

<template>
    <Head :title="user.role === 'instansi' ? 'Instansi Dashboard' : 'Siswa Dashboard'" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold transition-all duration-300"
                :class="{
                    'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success',
                    'bg-amber-50 text-amber-800 border-amber-100': messageToast.type === 'warning',
                    'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <!-- ======================================================= -->
        <!-- A. INSTITUTION (INSTANSI) DASHBOARD VIEW -->
        <!-- ======================================================= -->
        <div v-if="user.role === 'instansi' || user.role === 'admin'" class="space-y-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
                    <p class="text-sm font-medium text-slate-500">Track institutional performance and scholarship outreach metrics.</p>
                </div>
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                        📅 Last 30 Days
                    </button>
                    <button class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                        📥 Export Report
                    </button>
                </div>
            </div>

            <!-- Stats Matrix Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Applicants -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applicants</span>
                        <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">
                            {{ instansiStats.totalApplicants.toLocaleString('id-ID') }}
                        </p>
                        <!-- Loader visual line representing progress -->
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-indigo-600 h-full w-[70%]"></div>
                        </div>
                    </div>
                </div>

                <!-- Active Programs -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Programs</span>
                        <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">+5.4%</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">
                            {{ instansiStats.activePrograms }}
                        </p>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-purple-600 h-full w-[55%]"></div>
                        </div>
                    </div>
                </div>

                <!-- Approval Rate -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                    <div class="flex justify-between items-start">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Rate</span>
                        <span class="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">-2.1%</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">
                            {{ instansiStats.approvalRate }}%
                        </p>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                            <div class="bg-emerald-500 h-full w-[65%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart Splits -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Applications Trend Chart -->
                <div class="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                        <div>
                            <h3 class="text-base font-black text-slate-800">Applications Trend</h3>
                            <p class="text-[10px] font-semibold text-slate-400">Daily volume across all active scholarship programs</p>
                        </div>
                        <!-- Legend dots -->
                        <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-indigo-600"></span>STEM</span>
                            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-purple-600"></span>Arts</span>
                        </div>
                    </div>

                    <!-- Custom Interactive SVG Chart -->
                    <div class="h-64 w-full relative">
                        <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.2"/>
                                    <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
                                </linearGradient>
                            </defs>
                            <!-- Grid lines -->
                            <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                            <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                            <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                            <!-- Chart Area path fill -->
                            <path d="M 0 160 Q 100 130 200 120 T 400 60 T 500 90 L 500 200 L 0 200 Z" fill="url(#grad1)"/>
                            <!-- Line stroke paths -->
                            <path d="M 0 160 Q 100 130 200 120 T 400 60 T 500 90" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>
                            <path d="M 0 140 Q 120 160 250 90 T 450 110 T 500 80" fill="none" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                        
                        <!-- Y Axis labels -->
                        <div class="absolute left-2 top-0 h-full flex flex-col justify-between text-[9px] font-bold text-slate-400 pointer-events-none">
                            <span>150</span>
                            <span>100</span>
                            <span>50</span>
                            <span>0</span>
                        </div>
                    </div>
                    <!-- X Axis Days -->
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 px-4">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>

                <!-- Recent Activity List -->
                <div class="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                        <h3 class="text-base font-black text-slate-800">Recent Activity</h3>
                        <span class="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">View All</span>
                    </div>

                    <div class="space-y-4">
                        <div v-for="(act, idx) in recentActivity" :key="idx" class="flex gap-3 items-start">
                            <div class="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center text-xs">
                                👤
                            </div>
                            <div class="flex-1 text-left space-y-0.5">
                                <p class="text-xs font-bold text-slate-800">
                                    {{ act.name }}
                                    <span class="text-slate-400 font-semibold ml-1">{{ act.action }}</span>
                                </p>
                                <p class="text-[10px] font-bold text-indigo-600 truncate max-w-[180px]">{{ act.program }}</p>
                                <p class="text-[9px] font-bold text-slate-400">{{ act.time }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Split (Top Performing Program vs Action Required) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Top Performing Program -->
                <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div class="space-y-1 text-left">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Top Performing Program</span>
                        <h3 class="text-lg font-black text-slate-800 leading-tight">Engineering Innovation Fund</h3>
                    </div>
                    
                    <div class="flex gap-8 pt-4">
                        <div class="text-left">
                            <p class="text-2xl font-black text-slate-800">3,102</p>
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Applications</p>
                        </div>
                        <div class="text-left">
                            <p class="text-2xl font-black text-emerald-500">9.2</p>
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quality Score</p>
                        </div>
                    </div>
                </div>

                <!-- Action Required -->
                <div class="bg-red-50/50 border border-red-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
                    <div class="flex items-start gap-3 text-left">
                        <span class="h-10 w-10 shrink-0 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-lg">!</span>
                        <div class="space-y-1">
                            <h3 class="text-base font-black text-red-950">Action Required</h3>
                            <p class="text-xs text-red-700/80 leading-relaxed font-bold">
                                {{ actionRequiredCount }} applications for active programs have been pending review for over 72 hours.
                            </p>
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <Link :href="route('pelamar')" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition">
                            Review Pending
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <!-- ======================================================= -->
        <!-- B. STUDENT (SISWA) DASHBOARD VIEW (PREVIOUSLY COMPLETED) -->
        <!-- ======================================================= -->
        <div v-else class="space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {{ user.name }}! 👋
                    </h1>
                    <p class="text-sm font-medium text-slate-500 leading-relaxed">
                        Anda berada di peringkat 2% kandidat teraktif bulan ini. 3 beasiswa baru menanti ulasan Anda.
                    </p>
                </div>

                <div class="bg-white border border-slate-100/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm w-full md:w-auto md:min-w-[240px]">
                    <div class="relative h-14 w-14 shrink-0 flex items-center justify-center">
                        <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-slate-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="text-emerald-500 transition-all duration-500" stroke-dasharray="100" :stroke-dashoffset="100 - profileStrength" stroke-linecap="round" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span class="text-xs font-black text-slate-800">{{ profileStrength }}%</span>
                    </div>
                    <div class="text-left">
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Strength</p>
                        <p class="text-xs font-bold text-slate-700 mt-0.5">Lengkapi profil untuk rekomendasi maksimal</p>
                        <Link :href="route('profile.edit')" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition">Atur Profil →</Link>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-black text-slate-900 tracking-tight">Smart Recommendations</h2>
                    <span class="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">View All Matches</span>
                </div>

                <div v-if="errorAI && !user.keahlian" class="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-sm">
                    <div class="h-12 w-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">✨</div>
                    <div class="space-y-1">
                        <p class="text-sm font-bold text-indigo-950">{{ errorAI }}</p>
                        <p class="text-xs font-semibold text-indigo-600/80">Masukkan bidang minat Anda di menu pengaturan profil.</p>
                    </div>
                    <Link :href="route('profile.edit')" class="sm:ml-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0">
                        Atur Minat Sekarang
                    </Link>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <template v-if="isLoadingAI">
                        <div v-for="n in 3" :key="n" class="md:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 space-y-4 animate-pulse">
                            <div class="h-4 w-1/3 bg-slate-100 rounded"></div>
                            <div class="h-8 w-3/4 bg-slate-100 rounded"></div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="rec in aiRecommendations" :key="rec.beasiswa.id" class="md:col-span-4 rounded-3xl border border-slate-100/80 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                                        {{ rec.match_score }}% Match
                                    </span>
                                </div>
                                <h3 class="text-lg font-extrabold text-slate-800 leading-tight group-hover:text-indigo-600 transition">
                                    {{ rec.beasiswa.nama }}
                                </h3>
                                <p class="text-xs leading-relaxed text-slate-500 font-semibold line-clamp-3">
                                    {{ rec.beasiswa.deskripsi }}
                                </p>
                            </div>
                            <div class="pt-6">
                                <button
                                    type="button"
                                    @click="selectedProgram = { ...rec.beasiswa, type: 'Beasiswa' }"
                                    class="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 transition duration-200 cursor-pointer"
                                >
                                    Detail Program
                                </button>
                            </div>
                        </div>

                        <div v-if="aiInsight" class="md:col-span-4 rounded-3xl bg-indigo-600 text-white p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#818cf8,transparent_55%)] opacity-60"></div>
                            <div class="space-y-4 relative z-10">
                                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200">
                                    <span>✨ AI Insight</span>
                                </div>
                                <p class="text-sm font-bold leading-relaxed text-white/90">
                                    Profil terbaru Anda memiliki kecocokan yang sangat tinggi untuk program beasiswa riset digital.
                                </p>
                            </div>
                            <div class="pt-6 relative z-10">
                                <button
                                    type="button"
                                    @click="selectedProgram = { ...aiInsight.beasiswa, type: 'Beasiswa' }"
                                    class="w-full py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                                >
                                    Analyze Compatibility
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Latest Programs -->
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 class="text-lg font-black text-slate-900 tracking-tight">Latest Programs</h2>
                    
                    <div class="flex rounded-xl bg-slate-100 p-1">
                        <button
                            v-for="tab in ['All', 'Beasiswa', 'Akademik', 'Non-Akademik']"
                            :key="tab"
                            type="button"
                            @click="activeTab = tab"
                            class="px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none"
                            :class="activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
                        >
                            {{ tab }}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <template v-if="isLoadingPrograms">
                        <div v-for="n in 3" :key="n" class="rounded-3xl border border-slate-100 bg-white overflow-hidden p-5 animate-pulse">
                            <div class="aspect-[16/9] w-full bg-slate-100 rounded-2xl mb-4"></div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-for="prog in filteredPrograms" :key="prog.id" class="rounded-3xl border border-slate-100 bg-white overflow-hidden p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div>
                                <div class="aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 border border-slate-50 relative">
                                    <img :src="prog.image" :alt="prog.title" class="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-white/20"
                                        :class="prog.type === 'Beasiswa' ? 'bg-rose-500' : 'bg-violet-500'"
                                    >
                                        {{ prog.type }}
                                    </span>
                                </div>
                                <div class="space-y-2 px-1">
                                    <div class="flex items-center justify-between text-[10px] font-bold">
                                        <span class="text-amber-600 uppercase">{{ prog.category }}</span>
                                        <span class="text-slate-400">{{ prog.daysLeft }}</span>
                                    </div>
                                    <h3 class="text-base font-extrabold text-slate-800 leading-tight line-clamp-1 group-hover:text-indigo-600 transition">
                                        {{ prog.title }}
                                    </h3>
                                    <p class="text-xs leading-relaxed text-slate-500 font-semibold line-clamp-2">
                                        {{ prog.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="pt-5 px-1 flex items-center justify-between border-t border-slate-50 mt-4">
                                <span class="text-[10px] font-bold text-slate-400">{{ prog.detailLabel }}</span>
                                <button type="button" @click="selectedProgram = prog" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                                    Detail <span>→</span>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Detail Modal -->
            <transition name="fade">
                <div v-if="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="selectedProgram = null"></div>
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white bg-rose-500">
                                {{ selectedProgram.type }}
                            </span>
                            <button type="button" @click="selectedProgram = null" class="text-slate-400 hover:text-slate-600 transition">×</button>
                        </div>
                        <div class="space-y-4">
                            <h3 class="text-xl font-extrabold text-slate-800">{{ selectedProgram.title || selectedProgram.nama }}</h3>
                            <p class="text-xs leading-relaxed text-slate-500 font-semibold">{{ selectedProgram.description || selectedProgram.deskripsi }}</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-50">
                            <button type="button" @click="handleAddToWishlist(selectedProgram)" class="w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 text-xs font-bold rounded-2xl border cursor-pointer">Simpan Wishlist</button>
                            <button type="button" @click="handleApplyProgram(selectedProgram)" class="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl shadow cursor-pointer">Daftar Sekarang</button>
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
</style>
