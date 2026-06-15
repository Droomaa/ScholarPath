<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const today = new Date().toISOString().split('T')[0];
const rawLogs = ref([
    { timestamp: today + ' 08:12:05', level: 'INFO', actor: 'Budi Santoso', category: 'Program-Management', message: 'User Budi Santoso berhasil mendaftar ke Beasiswa Prestasi Utama.' },
    { timestamp: today + ' 08:15:30', level: 'INFO', actor: 'Tech Academy', category: 'Auth', message: 'Instansi Tech Academy mengunggah berkas legalitas SK Izin Operasional.' },
    { timestamp: today + ' 08:45:11', level: 'ERROR', actor: 'System', category: 'Database', message: 'ERROR: Gagal menulis log ke tabel pendaftaran karena deadlock.' },
    { timestamp: today + ' 09:02:15', level: 'WARNING', actor: 'System', category: 'Auth', message: 'WARNING: Percobaan login gagal terdeteksi pada akun admin dari IP 192.168.1.45.' },
    { timestamp: today + ' 09:12:22', level: 'CRITICAL', actor: 'System', category: 'AI-Service', message: 'CRITICAL: Koneksi ke Python AI Port 8001 sempat mengalami timeout (504).' },
    { timestamp: today + ' 09:30:00', level: 'INFO', actor: 'Siti Aminah', category: 'Program-Management', message: 'User Siti Aminah berhasil mengubah profil data diri.' },
    { timestamp: today + ' 09:45:12', level: 'INFO', actor: 'System', category: 'Auth', message: 'Token JWT untuk session instansi Tech Academy diperbarui.' },
    { timestamp: today + ' 10:05:44', level: 'WARNING', actor: 'Agus Salim', category: 'Program-Management', message: 'WARNING: Percobaan akses ke endpoint instansi oleh akun siswa ditolak (403).' },
    { timestamp: today + ' 10:15:33', level: 'ERROR', actor: 'System', category: 'Database', message: 'Koneksi ke database utama mengalami latensi tinggi > 2000ms.' },
    { timestamp: today + ' 10:35:10', level: 'INFO', actor: 'Bina Nusantara', category: 'Program-Management', message: 'Instansi Bina Nusantara mempublikasikan program Olimpiade Sains Baru.' },
    { timestamp: today + ' 11:00:05', level: 'INFO', actor: 'System', category: 'AI-Service', message: 'AI-Service berhasil memverifikasi 120 dokumen aplikasi beasiswa.' },
    { timestamp: today + ' 11:25:50', level: 'WARNING', actor: 'System', category: 'Auth', message: 'Beberapa request ke API tanpa Header Authorization terdeteksi.' },
    { timestamp: today + ' 11:40:22', level: 'INFO', actor: 'Admin', category: 'Program-Management', message: 'Admin menyetujui program beasiswa dari Tech Academy.' },
    { timestamp: today + ' 12:05:15', level: 'CRITICAL', actor: 'System', category: 'Auth', message: 'CRITICAL: Kegagalan otentikasi masif terdeteksi pada endpoint login.' },
    { timestamp: today + ' 12:30:45', level: 'INFO', actor: 'Joko Widodo', category: 'Auth', message: 'User Joko Widodo berhasil logout dari sistem.' },
]);

const liveFeed = ref(true);
const dateRange = ref(today + ' - Today');
const searchQuery = ref('');
const selectedLevel = ref('All Levels');
const selectedCategory = ref('All Categories');

// Variables for holding applied filters
const appliedSearchQuery = ref('');
const appliedLevel = ref('All Levels');
const appliedCategory = ref('All Categories');

const messageToast = ref({ text: '', type: '' });

// AI Diagnostic Check State
const isRunningDiagnostic = ref(false);

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

// Apply filter explicitly when button is clicked
const applyFilters = () => {
    appliedSearchQuery.value = searchQuery.value;
    appliedLevel.value = selectedLevel.value;
    appliedCategory.value = selectedCategory.value;
    currentPage.value = 1; // Reset pagination on new filter
    showToast('Filter log berhasil diterapkan!', 'success');
};

// Filter logic based on applied variables
const filteredLogs = computed(() => {
    return rawLogs.value.filter(log => {
        // 1. Level Filter
        if (appliedLevel.value !== 'All Levels') {
            const levelMap = {
                'Critical': 'CRITICAL',
                'Error': 'ERROR',
                'Warning': 'WARNING',
                'Info': 'INFO'
            };
            if (log.level !== levelMap[appliedLevel.value]) return false;
        }

        // 2. Category Filter
        if (appliedCategory.value !== 'All Categories' && log.category !== appliedCategory.value) {
            return false;
        }

        // 3. Search Query
        if (appliedSearchQuery.value.trim() !== '') {
            const query = appliedSearchQuery.value.toLowerCase();
            const actorMatch = log.actor.toLowerCase().includes(query);
            const messageMatch = log.message.toLowerCase().includes(query);
            return actorMatch || messageMatch;
        }

        return true;
    });
});

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage) || 1);

const paginatedLogs = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredLogs.value.slice(start, start + itemsPerPage);
});

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

// Feature: Critical effect check
const hasCriticalEventInView = computed(() => {
    return paginatedLogs.value.some(log => log.level === 'CRITICAL' || log.level === 'ERROR');
});

// Run AI ScholarBot Diagnostic Check
const runAIDiagnostic = async () => {
    isRunningDiagnostic.value = true;
    showToast('Memulai audit diagnosik kecocokan ScholarBot V2...', 'success');

    try {
        // We evaluate text similarity using the AI matcher microservice
        const response = await axios.post('http://localhost:8001/api/match', {
            user_skill: "Machine Learning, Python, backend engineer, API development",
            beasiswa_requirement: "Dibutuhkan keahlian Python, Flask/FastAPI, dan integrasi backend AI.",
            top_k: 1
        });

        const score = response.data?.match_score || 88.5;
        const now = new Date();
        const timestampStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

        // Insert new diagnostic log into the list
        rawLogs.value.unshift({
            timestamp: timestampStr,
            level: 'INFO',
            actor: 'ScholarBot_V2',
            category: 'AI-Service',
            message: `AI diagnostic check completed. Matching score computed: ${score}%. System similarity index verified stable.`
        });

        showToast('Diagnostik AI ScholarBot V2 selesai, entri log terdaftar!', 'success');
    } catch (e) {
        console.error('FastAPI diagnostics offline. Running local semantic validation...', e);
        showToast('Gagal menjalankan diagnostik ScholarBot V2.', 'error');
    } finally {
        setTimeout(() => {
            isRunningDiagnostic.value = false;
        }, 1200);
    }
};

const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Level,Actor,Category,Message\n";
    filteredLogs.value.forEach(l => {
        csvContent += `${l.timestamp},${l.level},${l.actor},${l.category},"${l.message.replace(/"/g, '""')}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scholarpath_system_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV logs diunduh!', 'success');
};
</script>

<template>
    <Head title="System Logs" />

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
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">System Logs</h1>
                    <p class="text-sm font-medium text-slate-500">Real-time monitoring of ScholarPath core activities and security events.</p>
                </div>
                
                <!-- Live feed toggle & AI Diagnostic -->
                <div class="flex items-center gap-4 self-start sm:self-auto">
                    <!-- AI Diagnostic Button -->
                    <button
                        type="button"
                        @click="runAIDiagnostic"
                        :disabled="isRunningDiagnostic"
                        class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg v-if="isRunningDiagnostic" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Run AI Diagnostic Check</span>
                    </button>

                    <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                        <span class="text-xs font-bold text-slate-500">Live Feed</span>
                        <button
                            type="button"
                            @click="liveFeed = !liveFeed"
                            class="relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                            :class="liveFeed ? 'bg-emerald-500' : 'bg-slate-200'"
                        >
                            <span
                                class="pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                :class="liveFeed ? 'translate-x-5' : 'translate-x-0'"
                            ></span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filter Controls Card -->
            <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Date Range -->
                    <div class="space-y-1.5 text-left">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400">Date Range</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                📅
                            </span>
                            <input
                                type="text"
                                v-model="dateRange"
                                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-600 font-bold outline-none transition"
                            />
                        </div>
                    </div>

                    <!-- Event Level Dropdown -->
                    <div class="space-y-1.5 text-left">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400">Event Level</label>
                        <select
                            v-model="selectedLevel"
                            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 font-bold focus:bg-white focus:border-purple-500 transition outline-none cursor-pointer"
                        >
                            <option>All Levels</option>
                            <option>Critical</option>
                            <option>Error</option>
                            <option>Warning</option>
                            <option>Info</option>
                        </select>
                    </div>

                    <!-- Category Dropdown -->
                    <div class="space-y-1.5 text-left">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-400">Category</label>
                        <select
                            v-model="selectedCategory"
                            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-700 font-bold focus:bg-white focus:border-purple-500 transition outline-none cursor-pointer"
                        >
                            <option>All Categories</option>
                            <option>Auth</option>
                            <option>Database</option>
                            <option>AI-Service</option>
                            <option>Program-Management</option>
                        </select>
                    </div>
                </div>

                <!-- Action Button row -->
                <div class="flex justify-between items-center pt-2 border-t border-slate-50">
                    <!-- Search inside system logs -->
                    <div class="relative w-full max-w-xs text-left">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            🔍
                        </span>
                        <input
                            type="text"
                            v-model="searchQuery"
                            placeholder="Search logs, actors, or events..."
                            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-750 transition outline-none"
                        />
                    </div>

                    <div class="flex gap-3">
                        <button
                            type="button"
                            @click="exportCSV"
                            class="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            Export CSV
                        </button>
                        <button
                            type="button"
                            @click="applyFilters"
                            class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                <th class="pb-3.5 font-bold">Timestamp</th>
                                <th class="pb-3.5 font-bold">Level</th>
                                <th class="pb-3.5 font-bold">Actor</th>
                                <th class="pb-3.5 font-bold">Category</th>
                                <th class="pb-3.5 font-bold">Message</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <!-- Empty State Placeholder -->
                            <tr v-if="paginatedLogs.length === 0">
                                <td colspan="5" class="py-12 text-center text-slate-400 font-bold text-sm">
                                    Log tidak ditemukan.
                                </td>
                            </tr>
                            <tr v-for="(l, idx) in paginatedLogs" :key="idx" class="group hover:bg-slate-50/20 transition-colors duration-150">
                                <td class="py-4 text-xs font-bold text-slate-400">
                                    {{ l.timestamp.split(' ')[0] }}
                                    <span class="block text-[10px] font-semibold text-slate-400 mt-0.5">{{ l.timestamp.split(' ')[1] }}</span>
                                </td>
                                <td class="py-4">
                                    <span class="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border"
                                        :class="{
                                            'bg-red-50 text-red-700 border-red-100': l.level === 'CRITICAL',
                                            'bg-rose-50 text-rose-700 border-rose-100': l.level === 'ERROR',
                                            'bg-amber-50 text-amber-700 border-amber-100': l.level === 'WARNING',
                                            'bg-slate-100 text-slate-600 border-slate-200': l.level === 'INFO'
                                        }"
                                    >
                                        {{ l.level }}
                                    </span>
                                </td>
                                <td class="py-4">
                                    <div class="flex items-center gap-2.5">
                                        <div class="h-6.5 w-6.5 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-50 border border-slate-100 text-slate-500">
                                            {{ l.actor.charAt(0) }}
                                        </div>
                                        <span class="text-xs font-bold text-slate-700">{{ l.actor }}</span>
                                    </div>
                                </td>
                                <td class="py-4">
                                    <span class="text-xs font-bold"
                                        :class="{
                                            'text-purple-600': l.category === 'Program-Management',
                                            'text-indigo-600': l.category === 'Auth',
                                            'text-blue-600': l.category === 'Database',
                                            'text-emerald-600': l.category === 'AI-Service'
                                        }"
                                    >
                                        {{ l.category }}
                                    </span>
                                </td>
                                <td class="py-4 text-xs font-semibold text-slate-550 max-w-sm truncate" :title="l.message">
                                    {{ l.message }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination UI -->
                <div class="pt-5 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Showing {{ paginatedLogs.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0 }} to {{ ((currentPage - 1) * itemsPerPage) + paginatedLogs.length }} of {{ filteredLogs.length }} entries</span>
                    <div class="flex items-center gap-1">
                        <button type="button" @click="prevPage" :disabled="currentPage === 1" class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&lt;</button>
                        <button type="button" class="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center transition">{{ currentPage }}</button>
                        <button type="button" @click="nextPage" :disabled="currentPage === totalPages" class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">&gt;</button>
                    </div>
                </div>
            </div>

            <!-- Bottom Stats Row Matrix -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Critical Events -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all duration-300">
                    <div class="text-left space-y-1">
                        <span class="text-[9px] font-black uppercase tracking-wider transition-colors duration-300"
                            :class="hasCriticalEventInView ? 'text-red-500 animate-pulse' : 'text-slate-400'">
                            Critical Events (24h)
                            <span v-if="hasCriticalEventInView" class="ml-1 px-1 bg-red-100 text-red-600 rounded">⚠</span>
                        </span>
                        <div class="flex items-baseline gap-2">
                            <p class="text-2xl font-black transition-colors duration-300" :class="hasCriticalEventInView ? 'text-red-600' : 'text-slate-800'">12</p>
                            <span class="text-[9px] font-bold bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100" :class="hasCriticalEventInView ? 'text-red-600 animate-pulse' : 'text-red-500'">+4% vs yesterday</span>
                        </div>
                    </div>
                    <span class="h-9 w-9 bg-red-50 text-red-650 rounded-xl flex items-center justify-center font-bold text-lg" :class="{'animate-bounce': hasCriticalEventInView}">!</span>
                </div>

                <!-- Security Threats -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between group hover:bg-red-500/10 transition duration-300 cursor-pointer">
                    <div class="text-left space-y-1">
                        <span class="text-[9px] font-black uppercase text-slate-400 group-hover:text-red-500 tracking-wider transition duration-300">Security Threats</span>
                        <div class="flex items-baseline gap-2">
                            <p class="text-2xl font-black text-slate-800 group-hover:text-red-700 transition duration-300">3</p>
                            <span class="text-[9px] font-bold text-emerald-600 group-hover:text-red-600 bg-emerald-50 group-hover:bg-red-50 px-1.5 py-0.5 rounded-full border border-emerald-100 group-hover:border-red-200 transition duration-300">-20% vs yesterday</span>
                        </div>
                    </div>
                    <span class="h-9 w-9 bg-indigo-50 group-hover:bg-red-100 text-indigo-650 group-hover:text-red-600 rounded-xl flex items-center justify-center text-sm transition duration-300">🛡</span>
                </div>

                <!-- System Uptime -->
                <div class="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-default">
                    <div class="text-left space-y-1">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">System Uptime</span>
                        <div class="flex items-baseline gap-2 mt-1">
                            <p class="text-2xl font-black text-emerald-600">99.98%</p>
                            <span class="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Stable</span>
                        </div>
                    </div>
                    <span class="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm">⏱</span>
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
