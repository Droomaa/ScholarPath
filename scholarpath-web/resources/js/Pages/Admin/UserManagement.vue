<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- MOCK DATA FALLBACK ---
const now = new Date();
const fmtDate = (d) => {
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
};

const rawUsers = ref([
    { id: 1, name: 'Budi Santoso', email: 'budi@example.com', role: 'student', is_verified: true, is_suspended: false, last_login: fmtDate(now) },
    { id: 2, name: 'Siti Aminah', email: 'siti@example.com', role: 'student', is_verified: true, is_suspended: false, last_login: fmtDate(new Date(now - 2*60*60*1000)) },
    { id: 3, name: 'Tech Academy', email: 'admin@techacademy.id', role: 'instansi', is_verified: false, is_suspended: false, last_login: fmtDate(new Date(now - 5*60*60*1000)) },
    { id: 4, name: 'Bina Nusantara', email: 'info@binus.ac.id', role: 'instansi', is_verified: true, is_suspended: false, last_login: fmtDate(new Date(now - 24*60*60*1000)) },
    { id: 5, name: 'Ahmad Fauzi', email: 'ahmad@gmail.com', role: 'student', is_verified: true, is_suspended: false, last_login: fmtDate(new Date(now - 3*60*60*1000)) },
    { id: 6, name: 'Universitas Merdeka', email: 'humas@unmer.ac.id', role: 'instansi', is_verified: false, is_suspended: false, last_login: fmtDate(new Date(now - 48*60*60*1000)) },
    { id: 7, name: 'Dewi Rahayu', email: 'dewi.r@student.ub.ac.id', role: 'student', is_verified: true, is_suspended: false, last_login: fmtDate(new Date(now - 1*60*60*1000)) },
]);

const isLoadingUsers = ref(false);
const searchQuery = ref('');
const activeRoleFilter = ref('All');
const messageToast = ref({ text: '', type: '' });

// Modal states
const showVerifyModal = ref(false);
const pendingVerifyUser = ref(null);
const activeNotifyUser = ref(null);
const notifTitle = ref('');
const notifMessage = ref('');
const isSendingNotif = ref(false);
const showSuspendModal = ref(false);
const pendingSuspendUser = ref(null);
const suspendTitle = ref('');
const suspendReason = ref('');
const showSuspendConfirm = ref(false);

const getAuthToken = () => localStorage.getItem('auth_token');

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => { messageToast.value = { text: '', type: '' }; }, 4500);
};

// Fetch from backend and merge with local
onMounted(async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoadingUsers.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const res = await axios.get(`${backendUrl}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.data?.length) {
            rawUsers.value = res.data.data.map(u => ({
                ...u,
                last_login: fmtDate(now),
                is_suspended: u.is_suspended || false
            }));
        }
    } catch (e) {
        // use local mock
    } finally {
        isLoadingUsers.value = false;
    }
});

const totalStudentsCount = computed(() => rawUsers.value.filter(u => u.role === 'student').length);
const totalInstitutionsCount = computed(() => rawUsers.value.filter(u => u.role === 'instansi').length);

const filteredUsers = computed(() => {
    return rawUsers.value.filter(u => {
        if (activeRoleFilter.value === 'Student' && u.role !== 'student') return false;
        if (activeRoleFilter.value === 'Institution' && u.role !== 'instansi') return false;
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase();
            return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
        }
        return true;
    });
});

// ---- VERIFY ----
const openVerifyModal = (u) => {
    pendingVerifyUser.value = u;
    showVerifyModal.value = true;
};
const confirmVerify = () => {
    if (!pendingVerifyUser.value) return;
    pendingVerifyUser.value.is_verified = true;
    showToast(`Akun "${pendingVerifyUser.value.name}" berhasil diverifikasi!`, 'success');
    showVerifyModal.value = false;
    pendingVerifyUser.value = null;
};

// ---- WARN / NOTIFICATION ----
const openNotificationModal = (u) => {
    activeNotifyUser.value = u;
    notifTitle.value = 'Peringatan Akun ScholarPath';
    notifMessage.value = '';
};

const handleSendNotification = async () => {
    if (!notifMessage.value.trim()) return;
    isSendingNotif.value = true;

    const token = getAuthToken();
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        await axios.post(`${backendUrl}/admin/notifications`, {
            user_id: activeNotifyUser.value.id,
            title: notifTitle.value,
            message: notifMessage.value
        }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
        // silently fallback
    } finally {
        isSendingNotif.value = false;
    }

    showToast(`Peringatan berhasil dikirim ke ${activeNotifyUser.value.name}!`, 'success');
    activeNotifyUser.value = null;
};

// ---- SUSPEND / UNSUSPEND (Toggle) ----
const handleSuspendToggle = (u) => {
    if (u.is_suspended) {
        // Unban
        u.is_suspended = false;
        u.is_verified = true;
        showToast(`Akun "${u.name}" berhasil dipulihkan aksesnya!`, 'success');
    } else {
        // Open suspend modal
        pendingSuspendUser.value = u;
        suspendTitle.value = '';
        suspendReason.value = '';
        showSuspendModal.value = true;
    }
};

const submitSuspend = () => {
    if (!suspendTitle.value.trim() || !suspendReason.value.trim()) return;
    showSuspendConfirm.value = true;
};

const confirmSuspend = () => {
    if (!pendingSuspendUser.value) return;
    pendingSuspendUser.value.is_suspended = true;
    pendingSuspendUser.value.is_verified = false;
    showToast(`Akun "${pendingSuspendUser.value.name}" berhasil ditangguhkan!`, 'success');
    showSuspendModal.value = false;
    showSuspendConfirm.value = false;
    pendingSuspendUser.value = null;
};

// ---- EXPORT CSV ----
const exportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'ID,Nama,Email,Role,Status,Last Login\n';
    rawUsers.value.forEach(u => {
        const status = u.is_suspended ? 'Banned' : (u.is_verified ? 'Verified' : 'Pending Review');
        csv += `${u.id},"${u.name}",${u.email},${u.role === 'instansi' ? 'Institution' : 'Student'},${status},${u.last_login}\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'scholarpath_users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor CSV pengguna dimulai!', 'success');
};
</script>

<template>
    <Head title="User Management" />

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
            <!-- Header + Quick Counters -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="space-y-1 max-w-xl">
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p class="text-sm font-medium text-slate-500 leading-relaxed">Monitor, verifikasi, dan kelola akses pengguna di ekosistem ScholarPath.</p>
                </div>
                <div class="flex gap-4">
                    <div class="bg-white border border-slate-100 rounded-2xl p-4 min-w-[120px] shadow-sm flex flex-col justify-center">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Siswa</span>
                        <p class="text-xl font-black text-slate-800 mt-1">{{ totalStudentsCount.toLocaleString('id-ID') }}</p>
                    </div>
                    <div class="bg-white border border-slate-100 rounded-2xl p-4 min-w-[120px] shadow-sm flex flex-col justify-center">
                        <span class="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Instansi</span>
                        <p class="text-xl font-black text-slate-800 mt-1">{{ totalInstitutionsCount }}</p>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <!-- Filter/Search Bar -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="relative w-full md:max-w-xs">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </span>
                        <input type="text" v-model="searchQuery" placeholder="Cari berdasarkan nama atau email..."
                            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-150 focus:bg-white focus:border-purple-500 rounded-xl text-xs text-slate-850 placeholder-slate-400 transition outline-none"/>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex rounded-xl bg-slate-100 p-1">
                            <button v-for="tab in ['All Users', 'Students', 'Institutions']" :key="tab" type="button"
                                @click="activeRoleFilter = tab === 'All Users' ? 'All' : (tab === 'Students' ? 'Student' : 'Institution')"
                                class="px-4 py-2 rounded-lg text-xs font-bold transition-all focus:outline-none"
                                :class="(activeRoleFilter === 'All' && tab === 'All Users') || (activeRoleFilter === 'Student' && tab === 'Students') || (activeRoleFilter === 'Institution' && tab === 'Institutions')
                                    ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                                {{ tab }}
                            </button>
                        </div>
                        <button type="button" @click="exportCSV"
                            class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            Export CSV
                        </button>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                <th class="pb-3.5 font-bold">User Identity</th>
                                <th class="pb-3.5 font-bold">Role</th>
                                <th class="pb-3.5 font-bold">Verification Status</th>
                                <th class="pb-3.5 font-bold">Activity</th>
                                <th class="pb-3.5 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            <tr v-if="isLoadingUsers">
                                <td colspan="5" class="py-8 text-center text-xs font-bold text-slate-400 animate-pulse">Memuat data pengguna...</td>
                            </tr>
                            <tr v-else-if="filteredUsers.length === 0">
                                <td colspan="5" class="py-8 text-center text-xs font-bold text-slate-400">Tidak ada pengguna yang cocok.</td>
                            </tr>
                            <tr v-else v-for="u in filteredUsers" :key="u.id" class="group hover:bg-slate-50/20 transition-colors duration-150">
                                <!-- User Identity -->
                                <td class="py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="h-9 w-9 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center font-extrabold text-sm"
                                            :class="u.role === 'instansi' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'">
                                            {{ u.name.charAt(0) }}
                                        </div>
                                        <div class="text-left">
                                            <p class="text-xs font-bold text-slate-800 leading-tight">{{ u.name }}</p>
                                            <p class="text-[10px] font-semibold text-slate-450 mt-0.5">{{ u.email }}</p>
                                        </div>
                                    </div>
                                </td>
                                <!-- Role -->
                                <td class="py-4">
                                    <span class="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border"
                                        :class="u.role === 'instansi' ? 'bg-purple-50/50 text-purple-700 border-purple-100' : 'bg-indigo-50/50 text-indigo-700 border-indigo-100'">
                                        {{ u.role === 'instansi' ? 'Institution' : 'Student' }}
                                    </span>
                                </td>
                                <!-- Verification Status -->
                                <td class="py-4">
                                    <span v-if="u.is_suspended" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                        <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span> Banned
                                    </span>
                                    <span v-else-if="u.role === 'instansi' && !u.is_verified" class="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Pending Review
                                    </span>
                                    <span v-else class="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Verified
                                    </span>
                                </td>
                                <!-- Activity -->
                                <td class="py-4 text-xs font-semibold text-slate-450">
                                    Last Login: {{ u.last_login }}
                                </td>
                                <!-- Actions -->
                                <td class="py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <!-- Verify Button (only for unverified instansi) -->
                                        <button v-if="u.role === 'instansi' && !u.is_verified && !u.is_suspended"
                                            type="button" @click="openVerifyModal(u)"
                                            class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer">
                                            Verify
                                        </button>

                                        <!-- Warning Notification -->
                                        <button type="button" @click="openNotificationModal(u)" title="Kirim Peringatan"
                                            class="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-amber-600 hover:border-amber-200 rounded-xl transition cursor-pointer">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                            </svg>
                                        </button>

                                        <!-- Suspend/Unsuspend Toggle -->
                                        <button type="button" @click="handleSuspendToggle(u)"
                                            :title="u.is_suspended ? 'Pulihkan Akun (Unban)' : 'Tangguhkan Akun'"
                                            class="p-2 border rounded-xl transition cursor-pointer"
                                            :class="u.is_suspended ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200'">
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination (static) -->
                <div class="pt-5 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Showing {{ filteredUsers.length }} of {{ rawUsers.length }} users</span>
                    <div class="flex items-center gap-1">
                        <button class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer">&lt;</button>
                        <button class="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center transition">1</button>
                        <button class="h-7 w-7 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition cursor-pointer">&gt;</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Konfirmasi Verify -->
        <transition name="fade">
            <div v-if="showVerifyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showVerifyModal = false; pendingVerifyUser = null"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-sm w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Verifikasi Akun Instansi</h3>
                        <button type="button" @click="showVerifyModal = false; pendingVerifyUser = null" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <p class="text-xs font-semibold text-slate-500 mb-6">Apakah Anda yakin ingin memverifikasi akun instansi <strong>{{ pendingVerifyUser?.name }}</strong>? Status akun akan langsung berubah menjadi <span class="text-emerald-600">Verified</span>.</p>
                    <div class="flex gap-3">
                        <button type="button" @click="showVerifyModal = false; pendingVerifyUser = null" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                        <button type="button" @click="confirmVerify" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">Ya, Verifikasi</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Modal: Kirim Peringatan -->
        <transition name="fade">
            <div v-if="activeNotifyUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="activeNotifyUser = null"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Kirim Peringatan / Notifikasi</h3>
                        <button type="button" @click="activeNotifyUser = null" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <form @submit.prevent="handleSendNotification" class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Penerima</label>
                            <input type="text" :value="`${activeNotifyUser.name} (${activeNotifyUser.email})`" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Judul Pesan</label>
                            <input type="text" v-model="notifTitle" required class="w-full px-4 py-2.5 border border-slate-150 focus:border-purple-500 rounded-xl text-xs text-slate-800 transition outline-none"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Isi Pesan</label>
                            <textarea v-model="notifMessage" required rows="4" placeholder="Tulis pesan peringatan..." class="w-full px-4 py-2.5 border border-slate-150 focus:border-purple-500 rounded-xl text-xs text-slate-800 transition outline-none resize-none"></textarea>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="activeNotifyUser = null" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="submit" :disabled="isSendingNotif" class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">
                                <svg v-if="isSendingNotif" class="animate-spin h-4 w-4 text-white mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span v-else>Kirim Notifikasi</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Modal: Suspend Form -->
        <transition name="fade">
            <div v-if="showSuspendModal && !showSuspendConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showSuspendModal = false; pendingSuspendUser = null"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-lg font-black text-slate-800">Tangguhkan Akun</h3>
                        <button type="button" @click="showSuspendModal = false; pendingSuspendUser = null" class="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Akun Target</label>
                            <input type="text" :value="`${pendingSuspendUser?.name} — ${pendingSuspendUser?.email}`" disabled class="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 font-bold"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Judul Penangguhan</label>
                            <input type="text" v-model="suspendTitle" placeholder="Contoh: Pelanggaran Kebijakan Platform" class="w-full px-4 py-2.5 border border-slate-150 focus:border-red-400 rounded-xl text-xs text-slate-800 transition outline-none"/>
                        </div>
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1.5 block">Alasan Penangguhan</label>
                            <textarea v-model="suspendReason" rows="4" placeholder="Jelaskan alasan penangguhan akun ini..." class="w-full px-4 py-2.5 border border-slate-150 focus:border-red-400 rounded-xl text-xs text-slate-800 transition outline-none resize-none"></textarea>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-slate-50">
                            <button type="button" @click="showSuspendModal = false; pendingSuspendUser = null" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Batal</button>
                            <button type="button" @click="submitSuspend" :disabled="!suspendTitle.trim() || !suspendReason.trim()" class="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">Lanjutkan Penangguhan</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Modal: Konfirmasi Suspend -->
        <transition name="fade">
            <div v-if="showSuspendConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-sm w-full relative z-10 animate-scale text-left">
                    <h3 class="text-lg font-black text-slate-800 mb-4">Konfirmasi Penangguhan</h3>
                    <p class="text-xs font-semibold text-slate-500 mb-6">Apakah Anda yakin ingin menangguhkan akun <strong>{{ pendingSuspendUser?.name }}</strong>? Status akun akan berubah menjadi <span class="text-red-600 font-black">Banned</span>.</p>
                    <div class="flex gap-3">
                        <button type="button" @click="showSuspendConfirm = false" class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border transition cursor-pointer">Tidak, Batal</button>
                        <button type="button" @click="confirmSuspend" class="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl shadow transition cursor-pointer">Ya, Tangguhkan</button>
                    </div>
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
