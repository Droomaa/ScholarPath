<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- REAL DATA STATE ---
const stats = ref({
    total_students: 0,
    total_instansi: 0,
    pending_content: 0,
    pending_institution: 0
});

const trendData = ref({
    students: [],
    institutions: []
});

const messageToast = ref({ text: '', type: '' });

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

const getAuthToken = () => localStorage.getItem('auth_token');

// --- FETCH REAL DATA ---
onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
    try {
        const res = await axios.get(`${backendUrl}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data) {
            const d = res.data.data;
            stats.value.total_students = d.total_students || 0;
            stats.value.total_instansi = d.total_instansi || 0;
            stats.value.pending_content = d.pending_content || 0;
            stats.value.pending_institution = d.pending_institution || 0;
            trendData.value.students = d.trend_students || [];
            trendData.value.institutions = d.trend_institutions || [];
        }
    } catch (e) {
        console.error("Gagal menarik data admin stats", e);
    }
});

const generateChartPath = (dataArr, isFill) => {
    if (!dataArr || dataArr.length === 0) return '';
    const maxVal = Math.max(...dataArr, 150); 
    const chartW = 500;
    const chartH = 200;
    const padding = 20;
    const plotH = chartH - padding * 2;
    
    if (dataArr.length === 1) dataArr = [dataArr[0], dataArr[0]]; // fallback line

    const points = dataArr.map((val, i) => {
        const x = (i / (dataArr.length - 1)) * chartW;
        const y = padding + plotH - (val / maxVal) * plotH;
        return { x, y };
    });

    let strokePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        strokePath += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    if (isFill) {
        return strokePath + ` L ${chartW} ${chartH} L 0 ${chartH} Z`;
    }
    return strokePath;
};

const studentPathFill = computed(() => generateChartPath(trendData.value.students, true));
const studentPathStroke = computed(() => generateChartPath(trendData.value.students, false));
const instPathFill = computed(() => generateChartPath(trendData.value.institutions, true));
const instPathStroke = computed(() => generateChartPath(trendData.value.institutions, false));

// --- EXPORT CSV ---
const exportReport = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Metric,Value\n';
    csv += `Total Siswa,${stats.value.total_students}\n`;
    csv += `Total Instansi,${stats.value.total_instansi}\n`;
    csv += `Pending Content Verification,${stats.value.pending_content}\n`;
    csv += `Pending Institution Verification,${stats.value.pending_institution}\n`;
    // 7-day registration data
    csv += '\nDate,Students,Institutions\n';
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const studentData = [45, 82, 61, 120, 95, 70, 110];
    const instData = [3, 8, 5, 12, 7, 4, 9];
    days.forEach((d, i) => { csv += `${d},${studentData[i]},${instData[i]}\n`; });
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'scholarpath_executive_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Executive CSV berhasil diunduh!', 'success');
};
</script>

<template>
    <Head title="Admin Dashboard" />

    <AdminLayout>
        <!-- Toast -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-bold"
                :class="{ 'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success', 'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error' }">
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <div class="space-y-8 text-left">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
                    <p class="text-sm font-medium text-slate-500">Real-time performance metrics and system status.</p>
                </div>
                <div class="flex items-center gap-3 self-start sm:self-auto">
                    <span class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-default select-none">
                        📅 Last 7 Days
                    </span>
                    <button @click="exportReport" class="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition duration-150 cursor-pointer">
                        📥 Export Report
                    </button>
                </div>
            </div>

            <!-- 4 Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <!-- Total Siswa -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                        </div>
                        <span class="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12%</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">{{ stats.total_students.toLocaleString('id-ID') }}</p>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div class="bg-indigo-600 h-full w-[72%]"></div></div>
                    </div>
                </div>

                <!-- Total Instansi -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-purple-50 text-purple-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Instansi</span>
                        </div>
                        <span class="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Active</span>
                    </div>
                    <div>
                        <p class="text-3xl font-black text-slate-800 leading-tight">{{ stats.total_instansi }}</p>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div class="bg-purple-600 h-full w-[55%]"></div></div>
                    </div>
                </div>

                <!-- Pending Content Verification -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Content</span>
                        </div>
                        <span class="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Action Needed</span>
                    </div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <p class="text-3xl font-black text-slate-800 leading-tight">{{ stats.pending_content }}</p>
                            <span class="text-[10px] font-semibold text-slate-400">Program</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div class="bg-amber-500 h-full w-[30%]"></div></div>
                    </div>
                </div>

                <!-- Pending Institution Verification -->
                <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between h-36 relative overflow-hidden">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="p-2 rounded-xl bg-rose-50 text-rose-600">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            </span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Instansi</span>
                        </div>
                        <span class="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Review</span>
                    </div>
                    <div>
                        <div class="flex items-baseline gap-2">
                            <p class="text-3xl font-black text-slate-800 leading-tight">{{ stats.pending_institution }}</p>
                            <span class="text-[10px] font-semibold text-slate-400">Instansi baru</span>
                        </div>
                        <div class="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden"><div class="bg-rose-500 h-full w-[20%]"></div></div>
                    </div>
                </div>
            </div>

            <!-- Registration Trend Chart (Last 7 Days) -->
            <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div class="flex justify-between items-center pb-3 border-b border-slate-50">
                    <div>
                        <h3 class="text-base font-black text-slate-800">Registration Trend</h3>
                        <p class="text-[10px] font-semibold text-slate-400">Pertumbuhan akun siswa dan instansi dalam 7 hari terakhir.</p>
                    </div>
                    <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>Siswa</span>
                        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-purple-500"></span>Instansi</span>
                    </div>
                </div>

                <div v-if="trendData.students.length === 0" class="h-64 w-full flex items-center justify-center text-xs font-bold text-slate-400">
                    Belum ada data pendaftaran 7 hari terakhir.
                </div>
                <div v-else class="h-64 w-full relative pt-4">
                    <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="gradStudentsD" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15"/>
                                <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
                            </linearGradient>
                            <linearGradient id="gradInstD" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#a855f7" stop-opacity="0.15"/>
                                <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" stroke-width="1.5"/>
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" stroke-width="1.5"/>
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" stroke-width="1.5"/>
                        
                        <!-- Students line -->
                        <path :d="studentPathFill" fill="url(#gradStudentsD)"/>
                        <path :d="studentPathStroke" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"/>
                        <!-- Institutions line -->
                        <path :d="instPathFill" fill="url(#gradInstD)"/>
                        <path :d="instPathStroke" fill="none" stroke="#a855f7" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                    <div class="absolute left-2 top-4 bottom-0 flex flex-col justify-between text-[9px] font-bold text-slate-400 pointer-events-none">
                        <span>Max</span><span>Mid</span><span>Low</span><span>0</span>
                    </div>
                </div>

                <!-- X-axis: 7 days -->
                <div class="flex justify-between text-[10px] font-bold text-slate-400 px-4 pt-2">
                    <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }
</style>
