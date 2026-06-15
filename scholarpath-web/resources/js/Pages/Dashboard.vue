<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import RegistrationModal from '@/Components/RegistrationModal.vue';

const user = ref({
    id: parseInt(localStorage.getItem('auth_user_id')) || 0,
    name: localStorage.getItem('auth_name') || 'User',
    email: '',
    jenjang_id: null,
    keahlian: '',
    role: localStorage.getItem('auth_role') || 'student'
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
const latestPrograms = ref([]);
const activeTab = ref('All');
const isLoadingAI = ref(false);
const isLoadingPrograms = ref(false);
const errorAI = ref('');
const selectedLatestProgram = ref(null);
const predefinedPills = {
    'Interest Field': ['STEM', 'Arts & Humanities', 'Business', 'Law & policy', 'Medicine', 'Social Sciences', 'Science'],
    'Technical Skills': ['Software development', 'Visual arts and UX', 'research and analysis'],
    'Preferensi': ['Kompetisi', 'Beasiswa', 'Keduanya'],
    'Wilayah Tujuan': ['Dalam negeri', 'Luar negeri'],
    'Program Goals': ['Funding', 'Challenges', 'Networking', 'Mentorship', 'Global Reach', 'Skill Growth'],
    'Career Aspirations': ['Research & academia', 'Industry Professional', 'Entrepreneurship', 'Public Service', 'Healthcare', 'Education', 'Engineering', 'Creative Industries', 'Technology', 'Finance', 'Environmental Science']
};

const selectedPills = ref([]);
const customPillInput = ref('');
const currentStep = ref(1);

const allSelectedPills = computed(() => {
    return selectedPills.value;
});

const hasCompletedWizard = ref(localStorage.getItem('scholarpath_wizard_done') === 'true');

const filteredPrograms = computed(() => {
    if (activeTab.value === 'All') return latestPrograms.value;
    if (activeTab.value === 'Beasiswa') return latestPrograms.value.filter(p => p.type === 'Beasiswa');
    return latestPrograms.value.filter(p => p.type === 'Lomba' && p.category === activeTab.value);
});

const nextStep = () => { 
    if (currentStep.value < 4) {
        currentStep.value++; 
    } else if (currentStep.value === 4) {
        hasCompletedWizard.value = true;
        localStorage.setItem('scholarpath_wizard_done', 'true');
        currentStep.value = 5;
    }
};
const prevStep = () => { if (currentStep.value > 1) currentStep.value--; };

const togglePill = (pill) => {
    if (selectedPills.value.includes(pill)) {
        selectedPills.value = selectedPills.value.filter(p => p !== pill);
    } else {
        selectedPills.value.push(pill);
    }
};

const removePill = (pill) => {
    selectedPills.value = selectedPills.value.filter(p => p !== pill);
};

const addCustomPill = () => {
    const val = customPillInput.value.trim();
    if (val && !selectedPills.value.includes(val)) {
        selectedPills.value.push(val);
    }
    customPillInput.value = '';
};

const fetchAIRecommendations = async () => {
    const skillText = allSelectedPills.value.join(', ');
    if (!skillText && !customPillInput.value) {
        aiRecommendations.value = [];
        return;
    }
    
    isLoadingAI.value = true;
    
    try {
        const token = getAuthToken();
        if (token) {
            const beUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
            await axios.put(`${beUrl}/user/profile`, {
                keahlian: skillText || customPillInput.value
            }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }

        let filterType = '';
        if (selectedPills.value.includes('Beasiswa') && !selectedPills.value.includes('Kompetisi')) filterType = 'scholarship';
        else if (selectedPills.value.includes('Kompetisi') && !selectedPills.value.includes('Beasiswa')) filterType = 'competition';
        else if (activeTab.value === 'Beasiswa') filterType = 'scholarship';
        else if (activeTab.value === 'Lomba' || activeTab.value === 'Akademik' || activeTab.value === 'Non-Akademik') filterType = 'competition';

        // Prepare live programs from already fetched latestPrograms
        const livePrograms = latestPrograms.value.map(p => ({
            id: p.id,
            title: p.title,
            type: p.type === 'Beasiswa' ? 'scholarship' : 'competition',
            level: 'Nasional',
            category: p.category,
            description: p.description,
            status: 'active'
        }));

        const aiUrl = 'http://localhost:8001';
        const response = await axios.post(`${aiUrl}/api/match`, {
            user_skill: skillText || customPillInput.value,
            filter_type: filterType || undefined,
            top_k: 5,
            live_programs: livePrograms
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
            aiRecommendations.value = response.data.data.sort((a,b) => b.match_score_percentage - a.match_score_percentage).slice(0, 5);
        } else {
            aiRecommendations.value = [];
        }
    } catch (error) {
        console.warn("AI Microservice Error/Offline", error);
        aiRecommendations.value = [];
    } finally {
        isLoadingAI.value = false;
    }
};

const fetchStudentDashboard = async () => {
    const token = getAuthToken();
    if (!token) return;

    isLoadingPrograms.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const [resB, resO, resProfile] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
        ]);

        if (resProfile && resProfile.data && resProfile.data.data) {
            user.value.name = resProfile.data.data.name || user.value.name;
            const k = resProfile.data.data.keahlian || '';
            // Only parse if it's not a JSON string from Settings
            if (k && !k.trim().startsWith('{') && !k.trim().startsWith('[')) {
                const skills = k.split(',').map(s => s.trim()).filter(s => s && s.length < 30);
                skills.forEach(s => {
                    if (!selectedPills.value.includes(s)) selectedPills.value.push(s);
                });
            }
        }

        const mB = (resB.data.data || [])
            .filter(b => b.status === 'active' || b.status === 'approved')
            .map(b => ({
                id: b.id, title: b.nama, type: 'Beasiswa', category: 'Beasiswa', description: b.deskripsi, link: b.link_informasi,
                detailLabel: `Kuota: ${b.kuota_pendaftar}`, daysLeft: '12 hari tersisa', image: '/images/hero_student.png'
            }));
        const mO = (resO.data.data || [])
            .filter(o => o.status === 'active' || o.status === 'approved')
            .map(o => ({
                id: o.id, title: o.judul, type: 'Lomba', category: o.tipe_lomba || 'Akademik', description: o.deskripsi, link: o.link_informasi,
                detailLabel: `Biaya: Rp ${o.biaya_pendaftaran.toLocaleString('id-ID')}`, daysLeft: '28 hari tersisa', image: '/images/indonesian_students.png'
            }));
        latestPrograms.value = [...mB, ...mO].sort((a, b) => b.id - a.id);
    } catch (e) {
        console.error(e);
    } finally {
        isLoadingPrograms.value = false;
    }
    
    fetchAIRecommendations();
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
        selectedLatestProgram.value = null;
    } catch (error) {
        showToast('Program sudah ada di wishlist.', 'warning');
    }
};



// ==========================================
// 2. DATA INSTANSI (INSTITUTION DASHBOARD)
// ==========================================
const isLoadingInstansi = ref(false);

// Dashboard Summary from API
const dashboardSummary = ref({
    total_applicants: 0,
    active_programs_count: 0,
    total_accepted: 0,
    top_program_name: '-',
    weekly_trend: [],
    pending_72h_count: 0,
    recent_activities: []
});

// Computed metrics from dashboard summary
const instansiStats = computed(() => {
    const total = dashboardSummary.value.total_applicants || 0;
    const accepted = dashboardSummary.value.total_accepted || 0;
    const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';
    return {
        totalApplicants: total,
        activePrograms: dashboardSummary.value.active_programs_count || 0,
        approvalRate: rate,
        topProgram: dashboardSummary.value.top_program_name || '-',
        pendingCount: dashboardSummary.value.pending_72h_count || 0
    };
});

const recentActivity = computed(() => {
    const activities = dashboardSummary.value.recent_activities || [];
    if (activities.length > 0) {
        return activities.slice(0, 4).map(a => ({
            name: a.student_name || a.name || 'Pelamar',
            action: a.action || 'applied for',
            program: a.program_title || a.program || '',
            time: a.time || a.created_at || 'baru saja'
        }));
    }
    return [];
});

// Dynamic SVG chart path from weekly_trend
const chartPath = computed(() => {
    const trend = dashboardSummary.value.weekly_trend;
    if (!trend || trend.length === 0) {
        // Default static path if no data
        return {
            fill: 'M 0 160 Q 100 130 200 120 T 400 60 T 500 90 L 500 200 L 0 200 Z',
            stroke: 'M 0 160 Q 100 130 200 120 T 400 60 T 500 90'
        };
    }

    const maxVal = Math.max(...trend, 1);
    const chartH = 200;
    const chartW = 500;
    const padding = 20;
    const plotH = chartH - padding * 2;

    const points = trend.map((val, i) => {
        const x = (i / (trend.length - 1)) * chartW;
        const y = padding + plotH - (val / maxVal) * plotH;
        return { x, y };
    });

    // Build smooth path using cubic bezier
    let strokePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        strokePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const fillPath = strokePath + ` L ${chartW} ${chartH} L 0 ${chartH} Z`;

    return { fill: fillPath, stroke: strokePath };
});

// Y-axis max label from weekly_trend
const chartMaxLabel = computed(() => {
    const trend = dashboardSummary.value.weekly_trend;
    if (!trend || trend.length === 0) return 150;
    return Math.max(...trend);
});

const handleExportCSV = () => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
    const token = getAuthToken();
    window.open(`${backendUrl}/instansi/export-csv?token=${token}`, '_blank');
};

const handleGoToPendingApplicants = () => {
    router.visit(route('pelamar'));
};

const fetchInstansiDashboard = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoadingInstansi.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

        // Try new dedicated dashboard-summary endpoint first
        try {
            const resSummary = await axios.get(`${backendUrl}/instansi/dashboard-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resSummary.data && resSummary.data.data) {
                dashboardSummary.value = resSummary.data.data;
                return; // Successfully loaded from dedicated endpoint
            }
        } catch (summaryErr) {
            console.warn('dashboard-summary endpoint not available, falling back to legacy endpoints:', summaryErr?.response?.status);
        }

        // Fallback: aggregate data from existing endpoints
        let instansiProfile = null;
        let userId = user.value.id;

        const resAllInstansi = await axios.get(`${backendUrl}/instansi`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (resAllInstansi.data && resAllInstansi.data.data) {
            instansiProfile = resAllInstansi.data.data.find(i => i.user_id === userId);
        }

        const resApp = await axios.get(`${backendUrl}/instansi/pendaftaran`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const applicants = resApp.data.data || [];

        const [resB, resO] = await Promise.all([
            axios.get(`${backendUrl}/beasiswa`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${backendUrl}/olimpiade`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        let beasiswas = resB.data.data || [];
        let olimpiades = resO.data.data || [];
        if (instansiProfile) {
            beasiswas = beasiswas.filter(b => b.instansi_id === instansiProfile.id);
            olimpiades = olimpiades.filter(o => o.instansi_id === instansiProfile.id);
        }

        const accepted = applicants.filter(a =>
            a.status_id === 2 || a.status_name === 'Interview' || a.status_name === 'Lulus' ||
            a.status_name === 'accept' || a.status_name === 'lolos'
        ).length;

        // Build weekly_trend from applicants (last 7 days)
        const today = new Date();
        const weeklyTrend = Array(7).fill(0);
        applicants.forEach(a => {
            if (a.tanggal_daftar) {
                const appDate = new Date(a.tanggal_daftar);
                const diffDays = Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays < 7) {
                    weeklyTrend[6 - diffDays]++;
                }
            }
        });

        // Recent activities from last 4 applicants
        const recentActs = applicants.slice(0, 4).map(a => ({
            name: a.student_name,
            action: 'applied for',
            program: a.program_title,
            time: a.tanggal_daftar ? new Date(a.tanggal_daftar).toLocaleDateString('id-ID') : 'baru saja'
        }));

        // Top program by applicant count
        const programCounts = {};
        applicants.forEach(a => {
            if (a.program_title) {
                programCounts[a.program_title] = (programCounts[a.program_title] || 0) + 1;
            }
        });
        const topProgram = Object.keys(programCounts).sort((a, b) => programCounts[b] - programCounts[a])[0] || '-';

        dashboardSummary.value = {
            total_applicants: applicants.length,
            active_programs_count: beasiswas.length + olimpiades.length,
            total_accepted: accepted,
            top_program_name: topProgram,
            weekly_trend: weeklyTrend,
            pending_72h_count: applicants.filter(a => a.status_id === 1 || a.status_name === 'Applied' || a.status_name === 'Daftar' || a.status_name === 'pending').length,
            recent_activities: recentActs
        };

    } catch (e) {
        console.error('Failed to load instansi dashboard data:', e);
    } finally {
        isLoadingInstansi.value = false;
    }
};

onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;

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

            if (user.value.role === 'instansi') {
                fetchInstansiDashboard();
            } else {
                if (hasCompletedWizard.value) {
                    currentStep.value = 5;
                }
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
                    <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Overview</h1>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Track institutional performance and scholarship outreach metrics.</p>
                </div>
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <span class="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl cursor-default select-none">
                        📅 Last 7 Days
                    </span>
                    <button
                        @click="handleExportCSV"
                        class="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition duration-150 cursor-pointer"
                    >
                        📥 Export Report
                    </button>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <template v-if="isLoadingInstansi">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div v-for="n in 3" :key="n" class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm h-36 animate-pulse">
                        <div class="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded mb-4"></div>
                        <div class="h-8 w-20 bg-slate-100 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </template>

            <template v-else>
                <!-- Stats Matrix Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Total Applicants -->
                    <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                        <div class="flex justify-between items-start">
                            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Applicants</span>
                            <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/50">+12%</span>
                        </div>
                        <div>
                            <p class="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                                {{ instansiStats.totalApplicants.toLocaleString('id-ID') }}
                            </p>
                            <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                                <div class="bg-indigo-600 h-full w-[70%] transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Programs -->
                    <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                        <div class="flex justify-between items-start">
                            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Programs</span>
                            <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">+5.4%</span>
                        </div>
                        <div>
                            <p class="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                                {{ instansiStats.activePrograms }}
                            </p>
                            <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                                <div class="bg-purple-600 h-full w-[55%] transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Approval Rate -->
                    <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                        <div class="flex justify-between items-start">
                            <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Approval Rate</span>
                            <span class="text-[10px] font-black text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800/50">-2.1%</span>
                        </div>
                        <div>
                            <p class="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                                {{ instansiStats.approvalRate }}%
                            </p>
                            <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                                <div class="bg-emerald-500 h-full transition-all duration-700" :style="{ width: Math.min(parseFloat(instansiStats.approvalRate), 100) + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chart Splits -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <!-- Applications Trend Chart (Dynamic SVG from weekly_trend) -->
                    <div class="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700/50">
                            <div>
                                <h3 class="text-base font-black text-slate-800 dark:text-white">Applications Trend</h3>
                                <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Daily application volume — last 7 days</p>
                            </div>
                            <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-indigo-600"></span>Applications</span>
                            </div>
                        </div>

                        <!-- Dynamic SVG Chart -->
                        <div class="h-64 w-full relative">
                            <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.25"/>
                                        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
                                    </linearGradient>
                                </defs>
                                <!-- Grid lines -->
                                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4"/>
                                <!-- Chart area fill -->
                                <path :d="chartPath.fill" fill="url(#grad1)"/>
                                <!-- Chart line stroke -->
                                <path :d="chartPath.stroke" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>

                            <!-- Y Axis labels -->
                            <div class="absolute left-2 top-0 h-full flex flex-col justify-between text-[9px] font-bold text-slate-400 pointer-events-none">
                                <span>{{ chartMaxLabel }}</span>
                                <span>{{ Math.round(chartMaxLabel * 0.67) }}</span>
                                <span>{{ Math.round(chartMaxLabel * 0.33) }}</span>
                                <span>0</span>
                            </div>
                        </div>
                        <!-- X Axis Days -->
                        <div class="flex justify-between text-[10px] font-bold text-slate-400 px-4">
                            <span>Sen</span>
                            <span>Sel</span>
                            <span>Rab</span>
                            <span>Kam</span>
                            <span>Jum</span>
                            <span>Sab</span>
                            <span>Min</span>
                        </div>
                    </div>

                    <!-- Recent Activity List -->
                    <div class="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-6">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700/50">
                            <h3 class="text-base font-black text-slate-800 dark:text-white">Recent Activity</h3>
                            <Link :href="route('pelamar')" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">View All</Link>
                        </div>

                        <div v-if="recentActivity.length > 0" class="space-y-4">
                            <div v-for="(act, idx) in recentActivity" :key="idx" class="flex gap-3 items-start">
                                <div class="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {{ act.name ? act.name.split(' ').map(n => n[0]).slice(0,2).join('') : '?' }}
                                </div>
                                <div class="flex-1 text-left space-y-0.5">
                                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {{ act.name }}
                                        <span class="text-slate-400 font-semibold ml-1">{{ act.action }}</span>
                                    </p>
                                    <p class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">{{ act.program }}</p>
                                    <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500">{{ act.time }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                            Belum ada aktivitas terbaru.
                        </div>
                    </div>
                </div>

                <!-- Bottom Split (Top Performing Program vs Action Required) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Top Performing Program -->
                    <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                        <div class="space-y-1 text-left">
                            <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Top Performing Program</span>
                            <h3 class="text-lg font-black text-slate-800 dark:text-white leading-tight">{{ instansiStats.topProgram }}</h3>
                        </div>

                        <div class="flex gap-8 pt-4">
                            <div class="text-left">
                                <p class="text-2xl font-black text-slate-800 dark:text-white">{{ instansiStats.totalApplicants.toLocaleString('id-ID') }}</p>
                                <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Applications</p>
                            </div>
                            <div class="text-left">
                                <p class="text-2xl font-black text-emerald-500">{{ instansiStats.approvalRate }}%</p>
                                <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Approval Rate</p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Required -->
                    <div class="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4">
                        <div class="flex items-start gap-3 text-left">
                            <span class="h-10 w-10 shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center text-lg font-black">!</span>
                            <div class="space-y-1">
                                <h3 class="text-base font-black text-red-950 dark:text-red-300">Action Required</h3>
                                <p class="text-xs text-red-700/80 dark:text-red-400/80 leading-relaxed font-bold">
                                    {{ instansiStats.pendingCount }} applications for active programs have been pending review for over 72 hours.
                                </p>
                            </div>
                        </div>

                        <div class="flex justify-end">
                            <button
                                @click="handleGoToPendingApplicants"
                                class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                            >
                                Review Pending
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- ======================================================= -->
        <!-- B. STUDENT (SISWA) DASHBOARD VIEW -->
        <!-- ======================================================= -->
        <div v-else class="space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Welcome back, {{ user.name }}! 👋
                    </h1>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Anda berada di peringkat 2% kandidat teraktif bulan ini. 3 beasiswa baru menanti ulasan Anda.
                    </p>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                    <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Smart Recommendations</h2>
                    <button v-if="aiRecommendations.length > 0 || currentStep > 1" @click="currentStep = 5" class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-xl transition cursor-pointer">
                        + Tambah Minat/Bakat Manual
                    </button>
                </div>

                <!-- Stepper Wizard: AI Profiling Input -->
                <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative min-h-[350px]">
                    
                    <!-- Stepper Progress Indicator -->
                    <div class="flex items-center justify-between mb-8 relative px-2">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-500" :style="`width: ${(currentStep - 1) * 25}%`"></div>
                        
                        <div v-for="step in 5" :key="step" 
                             class="relative z-10 flex flex-col items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-black transition-all duration-300"
                             :class="currentStep >= step ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'">
                            {{ step }}
                        </div>
                    </div>

                    <div class="relative w-full overflow-hidden min-h-[250px]">
                        <!-- Step 1: Kategori (Interest & Technical Skills) -->
                        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-x-8 opacity-0" enter-to-class="transform translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in absolute top-0 w-full" leave-from-class="transform translate-x-0 opacity-100" leave-to-class="transform -translate-x-8 opacity-0">
                            <div v-if="currentStep === 1" class="space-y-6 w-full">
                                <div class="space-y-2">
                                    <h3 class="text-lg font-black text-slate-800 dark:text-white">Step 1: Pilih Bidang & Keahlian</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Pilih satu atau lebih kategori yang mendeskripsikan minat Anda.</p>
                                </div>
                                <div v-for="category in ['Interest Field', 'Technical Skills']" :key="category" class="space-y-3">
                                    <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ category }}</p>
                                    <div class="flex flex-wrap gap-2">
                                        <button v-for="opt in predefinedPills[category]" :key="opt" @click="togglePill(opt)" class="px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer" :class="selectedPills.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">{{ opt }}</button>
                                    </div>
                                </div>
                                <div class="pt-4 flex justify-end border-t border-slate-50 dark:border-slate-800/60 mt-4">
                                    <button @click="nextStep" class="px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer">Selanjutnya ➔</button>
                                </div>
                            </div>
                        </transition>

                        <!-- Step 2: Preferensi -->
                        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-x-8 opacity-0" enter-to-class="transform translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in absolute top-0 w-full" leave-from-class="transform translate-x-0 opacity-100" leave-to-class="transform -translate-x-8 opacity-0">
                            <div v-if="currentStep === 2" class="space-y-6 w-full">
                                <div class="space-y-2">
                                    <h3 class="text-lg font-black text-slate-800 dark:text-white">Step 2: Preferensi Program</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tentukan jenis program apa yang sedang Anda cari.</p>
                                </div>
                                <div class="space-y-3">
                                    <div class="flex flex-wrap gap-3">
                                        <button v-for="opt in predefinedPills['Preferensi']" :key="opt" @click="togglePill(opt)" class="px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer" :class="selectedPills.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">{{ opt }}</button>
                                    </div>
                                </div>
                                <div class="pt-4 flex justify-between border-t border-slate-50 dark:border-slate-800/60 mt-4">
                                    <button @click="prevStep" class="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer">⬅ Kembali</button>
                                    <button @click="nextStep" class="px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer">Selanjutnya ➔</button>
                                </div>
                            </div>
                        </transition>

                        <!-- Step 3: Wilayah Tujuan -->
                        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-x-8 opacity-0" enter-to-class="transform translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in absolute top-0 w-full" leave-from-class="transform translate-x-0 opacity-100" leave-to-class="transform -translate-x-8 opacity-0">
                            <div v-if="currentStep === 3" class="space-y-6 w-full">
                                <div class="space-y-2">
                                    <h3 class="text-lg font-black text-slate-800 dark:text-white">Step 3: Wilayah Tujuan</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Apakah Anda mencari program lokal atau internasional?</p>
                                </div>
                                <div class="space-y-3">
                                    <div class="flex flex-wrap gap-3">
                                        <button v-for="opt in predefinedPills['Wilayah Tujuan']" :key="opt" @click="togglePill(opt)" class="px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer" :class="selectedPills.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">{{ opt }}</button>
                                    </div>
                                </div>
                                <div class="pt-4 flex justify-between border-t border-slate-50 dark:border-slate-800/60 mt-4">
                                    <button @click="prevStep" class="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer">⬅ Kembali</button>
                                    <button @click="nextStep" class="px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer">Selanjutnya ➔</button>
                                </div>
                            </div>
                        </transition>

                        <!-- Step 4: Goals & Aspirations -->
                        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-x-8 opacity-0" enter-to-class="transform translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in absolute top-0 w-full" leave-from-class="transform translate-x-0 opacity-100" leave-to-class="transform -translate-x-8 opacity-0">
                            <div v-if="currentStep === 4" class="space-y-6 w-full">
                                <div class="space-y-2">
                                    <h3 class="text-lg font-black text-slate-800 dark:text-white">Step 4: Goals & Karir</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tentukan tujuan akhir dan aspirasi karir Anda.</p>
                                </div>
                                <div v-for="category in ['Program Goals', 'Career Aspirations']" :key="category" class="space-y-3">
                                    <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ category }}</p>
                                    <div class="flex flex-wrap gap-2">
                                        <button v-for="opt in predefinedPills[category]" :key="opt" @click="togglePill(opt)" class="px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer" :class="selectedPills.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">{{ opt }}</button>
                                    </div>
                                </div>
                                <div class="pt-4 flex justify-between border-t border-slate-50 dark:border-slate-800/60 mt-4">
                                    <button @click="prevStep" class="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer">⬅ Kembali</button>
                                    <button @click="nextStep" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer">Selesai & Lihat Ringkasan ✨</button>
                                </div>
                            </div>
                        </transition>

                        <!-- Step 5: Summary & Custom Tags -->
                        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-x-8 opacity-0" enter-to-class="transform translate-x-0 opacity-100" leave-active-class="transition duration-200 ease-in absolute top-0 w-full" leave-from-class="transform translate-x-0 opacity-100" leave-to-class="transform -translate-x-8 opacity-0">
                            <div v-if="currentStep === 5" class="space-y-6 w-full">
                                <div class="space-y-2 text-center md:text-left">
                                    <h3 class="text-xl font-black text-slate-900 dark:text-white">Review Profile AI Anda</h3>
                                    <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold">Tinjau profil Anda atau tambahkan tag kustom secara manual sebelum memproses AI.</p>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <!-- Kiri: Review Panel -->
                                    <div class="bg-indigo-50/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 rounded-2xl p-5">
                                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Selected Pills</p>
                                        <transition-group name="pill-fade" tag="div" class="flex flex-wrap gap-2 min-h-[40px]">
                                            <span v-for="pill in allSelectedPills" :key="pill" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 text-xs font-bold shadow-sm transition-all duration-300">
                                                {{ pill }}
                                                <button @click="removePill(pill)" class="text-indigo-400 hover:text-red-500 ml-1 cursor-pointer transition">&times;</button>
                                            </span>
                                            <span v-if="allSelectedPills.length === 0" key="empty-state" class="text-xs text-slate-500 italic py-1">Belum ada pilihan yang dipilih.</span>
                                        </transition-group>
                                    </div>

                                    <!-- Kanan: Custom Input -->
                                    <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
                                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Custom Tags Manual</p>
                                        <div class="flex flex-col gap-3 w-full">
                                            <input
                                                v-model="customPillInput"
                                                @keyup.enter="addCustomPill"
                                                type="text"
                                                placeholder="Ketik minat khusus dan tekan Enter..."
                                                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white text-sm px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition shadow-sm"
                                            />
                                            <button @click="addCustomPill" class="w-full px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">
                                                + Tambah Custom Tag
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <button @click="prevStep" class="w-full sm:w-auto px-6 py-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold transition cursor-pointer">⬅ Edit Pilihan Sebelumnya</button>
                                    <button
                                        @click="fetchAIRecommendations"
                                        :disabled="isLoadingAI"
                                        class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        <span v-if="isLoadingAI" class="flex items-center justify-center gap-2">
                                            <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Sinkronisasi AI...
                                        </span>
                                        <span v-else class="flex items-center justify-center gap-2">
                                            ✨ Save Changes & Cari Rekomendasi
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>

                <div v-if="!isLoadingAI && aiRecommendations.length === 0 && allSelectedPills.length > 0" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-dashed rounded-3xl p-10 text-center shadow-sm">
                    <span class="text-4xl mb-3 block">📭</span>
                    <p class="text-sm font-bold text-slate-500 dark:text-slate-400">Tidak ada program yang cocok dengan minat dan bakat Anda saat ini. Silakan ubah preferensi kustomisasi Anda.</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <template v-if="isLoadingAI">
                        <div v-for="n in 3" :key="n" class="md:col-span-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-6 space-y-4 animate-pulse">
                            <div class="h-4 w-1/3 bg-slate-100 dark:bg-slate-700 rounded"></div>
                            <div class="h-8 w-3/4 bg-slate-100 dark:bg-slate-700 rounded"></div>
                        </div>
                    </template>
                    <template v-else-if="aiRecommendations.length > 0">
                        <div v-for="(rec, index) in aiRecommendations" :key="index" class="md:col-span-4 rounded-3xl border border-slate-100/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50': rec.match_score_percentage > 70,
                                            'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50': rec.match_score_percentage > 40 && rec.match_score_percentage <= 70,
                                            'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50': rec.match_score_percentage <= 40
                                        }"
                                    >
                                        {{ rec.match_score_percentage }}% Match
                                    </span>
                                    <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{{ rec.level || 'Nasional' }}</span>
                                </div>
                                <h3 class="text-lg font-extrabold text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                                    {{ rec.title }}
                                </h3>
                                <p class="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">{{ rec.type }}</p>
                                <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold line-clamp-3">
                                    {{ rec.description }}
                                </p>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Latest Programs -->
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Latest Programs</h2>

                    <div class="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                        <button
                            v-for="tab in ['All', 'Beasiswa', 'Akademik', 'Non-Akademik']"
                            :key="tab"
                            type="button"
                            @click="activeTab = tab"
                            class="px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none"
                            :class="activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
                        >
                            {{ tab }}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <template v-if="isLoadingPrograms">
                        <div v-for="n in 3" :key="n" class="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden p-5 animate-pulse">
                            <div class="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4"></div>
                        </div>
                    </template>
                    <template v-else-if="filteredPrograms.length > 0">
                        <div v-for="prog in filteredPrograms" :key="prog.id" class="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
                            <div>
                                <div class="aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 border border-slate-50 dark:border-slate-800 relative">
                                    <img :src="prog.image" :alt="prog.title" class="w-full h-full object-cover group-hover:scale-102 transition duration-300" />
                                    <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-white/20"
                                        :class="prog.type === 'Beasiswa' ? 'bg-rose-500' : 'bg-violet-500'"
                                    >
                                        {{ prog.type }}
                                    </span>
                                </div>
                                <div class="space-y-2 px-1">
                                    <div class="flex items-center justify-between text-[10px] font-bold">
                                        <span class="text-amber-600 dark:text-amber-400 uppercase">{{ prog.category }}</span>
                                        <span class="text-slate-400 dark:text-slate-500">{{ prog.daysLeft }}</span>
                                    </div>
                                    <h3 class="text-base font-extrabold text-slate-800 dark:text-white leading-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                        {{ prog.title }}
                                    </h3>
                                    <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold line-clamp-2">
                                        {{ prog.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="pt-5 px-1 flex items-center justify-between border-t border-slate-50 dark:border-slate-800 mt-4">
                                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">{{ prog.detailLabel }}</span>
                                <div class="flex gap-2">
                                    <button type="button" @click="selectedLatestProgram = prog" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer">
                                        Daftar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
                            <span class="text-4xl mb-3 block opacity-50">📂</span>
                            <p class="text-slate-500 dark:text-slate-400 font-bold text-sm">Belum ada program terbaru yang dipublikasikan.</p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Detail & Registration Modal -->
            <RegistrationModal
                :show="!!selectedLatestProgram"
                :program="selectedLatestProgram"
                @close="selectedLatestProgram = null"
                @success="showToast('Pendaftaran program berhasil terkirim!')"
                @wishlist="handleAddToWishlist($event)"
            />
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.pill-fade-enter-active, .pill-fade-leave-active { transition: all 0.3s ease; }
.pill-fade-enter-from, .pill-fade-leave-to { opacity: 0; transform: scale(0.9); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
.animate-scale { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
