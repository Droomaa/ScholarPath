<script setup>
import { ref, onMounted } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import InstitutionLayout from '@/Layouts/InstitutionLayout.vue';
import Card from '@/Components/Card.vue';
import { Calendar, Download, TrendingUp, ShieldCheck, TrendingDown, Users, CheckCircle, AlertCircle } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const totalApplicants = ref(0);
const activeProgramsCount = ref(0);
const reviewPendingCount = ref(0);
const oldPendingCount = ref(0);
const approvalRate = ref(0);
const recentApplicants = ref([]);

const timeAgo = (dateStr) => {
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return '1 hari yang lalu';
    return `${diffDays} hari yang lalu`;
};

const fetchData = async () => {
    try {
        const instansiRes = await backendApi.get('/instansi/me');
        const instansiId = instansiRes.data?.data?.id;

        const beasiswaRes = await backendApi.get('/beasiswa');
        const olimpiadeRes = await backendApi.get('/olimpiade');
        
        const instansiBeasiswa = (beasiswaRes.data?.data || []).filter(b => b.instansi_id === instansiId);
        const instansiOlimpiade = (olimpiadeRes.data?.data || []).filter(o => o.instansi_id === instansiId);
        
        activeProgramsCount.value = instansiBeasiswa.length + instansiOlimpiade.length;

        const pendaftaranRes = await backendApi.get('/instansi/pendaftaran');
        const applicants = pendaftaranRes.data?.data || [];
        totalApplicants.value = applicants.length;
        
        reviewPendingCount.value = applicants.filter(a => a.status_id === null || a.status_id === 1).length;
        
        oldPendingCount.value = applicants.filter(a => {
            if (a.status_id === 2 || a.status_id === 3) return false;
            const diffTime = Math.abs(new Date() - new Date(a.tanggal_daftar));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays >= 5;
        }).length;
        
        // Calculate approval rate
        const approvedCount = applicants.filter(a => a.status_id === 2).length;
        if (applicants.length > 0) {
            approvalRate.value = ((approvedCount / applicants.length) * 100).toFixed(1);
        } else {
            approvalRate.value = 0;
        }

        recentApplicants.value = applicants
            .sort((a, b) => new Date(b.tanggal_daftar) - new Date(a.tanggal_daftar));

    } catch (e) {
        console.error("Failed to load dashboard data", e);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <InstitutionLayout>
        <Head title="Institution Dashboard" />

        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
                    <p class="text-slate-500 mt-1">Track institutional performance and scholarship outreach metrics.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Calendar class="w-4 h-4 mr-2 text-slate-400" />
                        Last 7 Days
                    </button>
                    <div class="relative group">
                        <button class="flex items-center px-4 py-2 bg-brand-50 border border-brand-100 rounded-xl text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors shadow-sm">
                            <Download class="w-4 h-4 mr-2" />
                            Export Report
                        </button>
                        <div class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                            <div class="p-2 flex flex-col">
                                <button class="px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg font-bold transition-colors">Export as PDF (7 Days)</button>
                                <button class="px-4 py-2.5 text-sm text-left text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded-lg font-bold transition-colors">Export as CSV (7 Days)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Total Applicants -->
                <Card class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-brand-600">
                            <Users class="w-6 h-6" />
                        </div>
                        <span class="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <TrendingUp class="w-3 h-3 mr-1" /> +12%
                        </span>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Applicants</p>
                    <h2 class="text-4xl font-black text-slate-900">{{ totalApplicants }}</h2>
                    <div class="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                        <div class="bg-brand-500 h-1.5 rounded-full w-[70%]"></div>
                    </div>
                </Card>

                <!-- Active Programs -->
                <Card class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldCheck class="w-6 h-6" />
                        </div>
                        <span class="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <TrendingUp class="w-3 h-3 mr-1" /> +5.4%
                        </span>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Active Programs</p>
                    <h2 class="text-4xl font-black text-slate-900">{{ activeProgramsCount }}</h2>
                    <div class="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                        <div class="bg-green-500 h-1.5 rounded-full w-[45%]"></div>
                    </div>
                </Card>

                <!-- Approval Rate -->
                <Card class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <CheckCircle class="w-6 h-6" />
                        </div>
                        <span class="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                            <TrendingDown class="w-3 h-3 mr-1" /> -2.1%
                        </span>
                    </div>
                    <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Approval Rate</p>
                    <h2 class="text-4xl font-black text-slate-900">{{ approvalRate }}%</h2>
                    <div class="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                        <div class="bg-blue-500 h-1.5 rounded-full w-[64.8%]"></div>
                    </div>
                </Card>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Chart Area -->
                <Card class="lg:col-span-2 p-6 flex flex-col">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h3 class="text-lg font-bold text-slate-900">Applications Trend</h3>
                            <p class="text-sm text-slate-500">Daily volume across all active programs (7 Days)</p>
                        </div>
                        <div class="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-brand-500 mr-2"></span> STEM</span>
                            <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-indigo-300 mr-2"></span> Arts</span>
                        </div>
                    </div>
                    
                    <div class="flex-1 relative min-h-[250px] w-full flex items-end">
                        <!-- Abstract CSS Chart Placeholder -->
                        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzZkMjhkOSIgc3RvcC1vcGFjaXR5PSIwLjIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM2ZDI4ZDkiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik0wLDYwIFEzMCw5MCA1MCw1MCBUNTEwLDMwIFQxMDAwLDkwIEwxMDAwLDEwMCBMMCwxMDBaIiBmaWxsPSJ1cmwoI2cpIi8+PHBhdGggZD0iTTAsNjAgUTMwLDkwIDUwLDUwIFQ1MTAsMzAgVDEwMDAsOTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZkMjhkOSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHBhdGggZD0iTTAsMjAgUTMwLDEwIDUwLDYwIFQ1MTAsODAgVDEwMDAsNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2E1YjRkMSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+')] bg-no-repeat bg-bottom bg-cover opacity-80"></div>
                        
                        <!-- X Axis Labels -->
                        <div class="w-full flex justify-between text-xs text-slate-400 font-medium pt-4 border-t border-slate-100 z-10 mt-auto">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </Card>

                <!-- Recent Activity -->
                <Card class="p-6 flex flex-col">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <Link :href="route('institution.applicants')" class="text-sm font-bold text-brand-600 hover:text-brand-700">View All</Link>
                    </div>
                    
                    <div class="flex-1 space-y-6 overflow-y-auto max-h-80 pr-2">
                        <div v-for="applicant in recentApplicants" :key="applicant.pendaftaran_id" class="flex gap-4 items-center">
                            <img :src="'https://ui-avatars.com/api/?name=' + applicant.student_name + '&background=f1f5f9'" class="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div class="flex-1 min-w-0">
                                <p class="text-sm text-slate-800 font-medium truncate"><span class="font-bold">{{ applicant.student_name }}</span> applied for</p>
                                <p class="text-sm font-bold text-brand-600 truncate">{{ applicant.program_title }}</p>
                                <p class="text-xs text-slate-400 mt-1">{{ timeAgo(applicant.tanggal_daftar) }}</p>
                            </div>
                            <Link :href="route('institution.applicants')" class="px-3 py-1.5 bg-slate-50 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-bold transition-colors">
                                View Profile
                            </Link>
                        </div>
                        <div v-if="recentApplicants.length === 0" class="text-sm text-slate-500 text-center py-4">Belum ada pelamar baru.</div>
                    </div>
                </Card>
            </div>

            <div class="grid grid-cols-1 gap-6">
                <!-- Action Required -->
                <Card v-if="oldPendingCount > 0" class="p-6 bg-red-50/50 border border-red-100 flex items-start gap-4">
                    <div class="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                        <AlertCircle class="w-6 h-6" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-red-700 mb-2">Action Required</h3>
                        <p class="text-sm text-red-900/80 mb-4 leading-relaxed font-medium">
                            {{ oldPendingCount }} applications have been pending for 5 days or more. Please review them promptly.
                        </p>
                        <Link :href="route('institution.applicants')" class="inline-flex px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors">
                            Review Pending
                        </Link>
                    </div>
                </Card>
                <Card v-else class="p-6 bg-green-50/50 border border-green-100 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-green-100 text-green-600 rounded-xl shrink-0">
                            <CheckCircle class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-green-700 mb-1">All Caught Up!</h3>
                            <p class="text-sm text-green-900/80 font-medium">No applications are currently pending for more than 5 days.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </InstitutionLayout>
</template>
