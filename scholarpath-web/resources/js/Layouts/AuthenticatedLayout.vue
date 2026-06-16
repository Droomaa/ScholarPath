<script setup>
import { ref, computed, onMounted } from 'vue';
import { Link, useForm, router, usePage } from '@inertiajs/vue3';
import axios from 'axios';

// ============================================================
// INERTIA SHARED PROPS — Single Source of Truth for Auth State
// ============================================================
const page = usePage();
const authUser = computed(() => page.props.auth?.user || {});
const institutionStatus = computed(() => authUser.value?.status || 'pending');
const hasUploadedDocs = computed(() => authUser.value?.has_uploaded_docs || false);
const isInstansi = computed(() => authUser.value?.role?.toLowerCase() === 'instansi');
const isApproved = computed(() => institutionStatus.value === 'approved' || institutionStatus.value === 'active');
const isPending = computed(() => institutionStatus.value === 'pending' || institutionStatus.value === 'unverified');
const isRejected = computed(() => institutionStatus.value === 'rejected');
const isLocked = computed(() => isInstansi.value && !isApproved.value);

const showingMobileMenu = ref(false);
const formLogout = useForm({});

const handleLogout = () => {
    // Clear Go backend JWT from localStorage first
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_name');
    localStorage.removeItem('auth_user_id');

    // Submit Laravel logout
    formLogout.post(route('logout'));
};

const userProfile = ref({
    name: '',
    role: 'Student',
    keahlian: '',
    foto: '',
    theme: 'light',
});

// ==============================================================
// VERIFICATION DOCS UPLOAD — 2 mandatory PDF files
// ==============================================================
const fileIzin = ref(null);      // SK Izin Operasional
const fileLegalitas = ref(null); // Dokumen NIB
const isSubmittingVerification = ref(false);
const verificationErrorMsg = ref('');

const submitVerificationDocs = async () => {
    verificationErrorMsg.value = '';

    // Strict double-file check — keduanya wajib dipilih
    if (!fileIzin.value || !fileLegalitas.value) {
        verificationErrorMsg.value = 'Kedua dokumen wajib dipilih sebelum mengirim berkas!';
        return;
    }

    // Validasi ukuran file maksimal 5MB per file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileIzin.value.size > maxSize) {
        verificationErrorMsg.value = 'File SK Izin melebihi batas maksimal 5MB. Pilih file yang lebih kecil.';
        return;
    }
    if (fileLegalitas.value.size > maxSize) {
        verificationErrorMsg.value = 'File NIB melebihi batas maksimal 5MB. Pilih file yang lebih kecil.';
        return;
    }

    // Validasi tipe file — hanya PDF
    if (fileIzin.value.type !== 'application/pdf') {
        verificationErrorMsg.value = 'File SK Izin harus berformat PDF.';
        return;
    }
    if (fileLegalitas.value.type !== 'application/pdf') {
        verificationErrorMsg.value = 'File NIB harus berformat PDF.';
        return;
    }

    isSubmittingVerification.value = true;
    try {
        // Prioritaskan go_token dari Inertia props (dibuat oleh Laravel middleware)
        // Fallback ke localStorage jika login melalui Go API langsung
        const token = page.props.auth?.go_token || localStorage.getItem('auth_token');

        if (!token) {
            verificationErrorMsg.value = 'Sesi login tidak valid. Silakan logout dan login kembali.';
            isSubmittingVerification.value = false;
            return;
        }

        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080');

        // === SATU ENDPOINT: POST /api/instansi/upload-docs ===
        // Backend mengidentifikasi instansi dari JWT (user_id) secara OTOMATIS
        // Tidak perlu kirim instansi_id dari frontend — eliminates 'Instansi tidak ditemukan' bug
        const formData = new FormData();
        formData.append('sk_document', fileIzin.value);        // c.FormFile("sk_document") di Go
        formData.append('legal_document', fileLegalitas.value); // c.FormFile("legal_document") di Go

        await axios.post(`${backendUrl}/api/instansi/upload-docs`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });

        // Reload seluruh page props Inertia agar has_uploaded_docs = true terefleksi di layout
        router.reload();
    } catch (e) {
        const serverMsg = e?.response?.data?.error || e?.response?.data?.message;
        verificationErrorMsg.value = serverMsg
            || `Gagal mengunggah dokumen (${e?.response?.status || 'Network Error'}). Periksa koneksi dan coba lagi.`;
        console.error('[VerificationDocs] Upload failed — Status:', e?.response?.status, '| Data:', e?.response?.data);
    } finally {
        isSubmittingVerification.value = false;
    }
};

const isDarkMode = ref(false);

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        isDarkMode.value = true;
    } else {
        document.documentElement.classList.remove('dark');
        isDarkMode.value = false;
    }
    localStorage.setItem('theme', theme);
};

const toggleDarkMode = async () => {
    const newTheme = isDarkMode.value ? 'light' : 'dark';
    applyTheme(newTheme);
    
    const token = localStorage.getItem('auth_token');
    if (token) {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        try {
            await axios.put(`${backendUrl}/user/profile`, {
                theme: newTheme
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    }
};

// Search
const searchQuery = ref('');
const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.visit(route('search', { q: searchQuery.value.trim() }));
    }
};

// Notifications
const showNotifications = ref(false);
const notificationsList = ref([]);
const hasNewNotifications = ref(false);

const fetchNotificationsData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        
        // 1. Fetch DB notifications
        const resNotifs = await axios.get(`${backendUrl}/user/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const dbNotifs = resNotifs.data.data || [];
        
        // 2. Fetch registrations for status updates
        let registrations = [];
        try {
            const resRegs = await axios.get(`${backendUrl}/user/pendaftaran`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            registrations = resRegs.data.data || [];
        } catch (e) {
            console.error('Failed to load registrations in layout notifications:', e);
        }
        
        // 3. Compile merged notifications list
        const compiled = [];
        
        // DB notifications
        dbNotifs.forEach(n => {
            compiled.push({
                id: 'db_' + n.id,
                title: n.title,
                message: n.message,
                date: new Date(n.created_at),
                type: 'info',
                unread: !n.is_read
            });
        });
        
        // Status updates from applications
        registrations.forEach(r => {
            compiled.push({
                id: 'reg_' + r.pendaftaran_id,
                title: 'Aplikasi Terkirim',
                message: `Status aplikasi untuk "${r.program_title}" saat ini: ${r.status_name}`,
                date: new Date(r.tanggal_daftar),
                type: 'status',
                unread: true
            });
        });
        
        // Upcoming Deadline reminder if they have active programs
        if (registrations.length > 0) {
            compiled.push({
                id: 'deadline_rem',
                title: 'Tenggat Waktu Pendaftaran',
                message: `Beasiswa yang Anda pilih akan segera ditutup. Harap cek dokumen Anda kembali!`,
                date: new Date(),
                type: 'deadline',
                unread: true
            });
        } else {
            compiled.push({
                id: 'minat_rem',
                title: 'Rekomendasi Pintar AI',
                message: `Lengkapi minat Anda di pengaturan profil untuk mendapatkan pencocokan beasiswa presisi.`,
                date: new Date(),
                type: 'recommendation',
                unread: true
            });
        }
        
        // Sort descending by date
        compiled.sort((a, b) => b.date - a.date);
        notificationsList.value = compiled;
        
        // Determine if there are new unread notifications
        const lastOpened = localStorage.getItem('auth_notifications_last_opened') || 0;
        hasNewNotifications.value = compiled.some(n => n.date.getTime() > parseInt(lastOpened));
        
    } catch (error) {
        console.error('Failed to retrieve notification list:', error);
    }
};

const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    if (showNotifications.value) {
        hasNewNotifications.value = false;
        localStorage.setItem('auth_notifications_last_opened', Date.now().toString());
    }
};

onMounted(() => {
    // Read local theme first for faster apply
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
        applyTheme(localTheme);
    }

    // Get user details from localStorage
    const savedName = localStorage.getItem('auth_name');
    const savedRole = localStorage.getItem('auth_role');
    const userId = localStorage.getItem('auth_user_id');
    
    if (savedName) userProfile.value.name = savedName;
    if (savedRole) userProfile.value.role = savedRole;
    if (userId) {
        const savedPhoto = localStorage.getItem('auth_profile_photo_' + userId);
        if (savedPhoto) userProfile.value.foto = savedPhoto;
    }

    // Listen to profile photo updates
    window.addEventListener('profile-photo-updated', (e) => {
        userProfile.value.foto = e.detail;
    });

    // Fetch live notifications
    fetchNotificationsData();
    // Poll notifications every 60 seconds
    const intervalId = setInterval(fetchNotificationsData, 60000);

    // Fetch live profile details if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            if (response.data && response.data.data) {
                const u = response.data.data;
                userProfile.value.name = u.name || savedName;
                userProfile.value.keahlian = u.keahlian || '';
                if (u.role) {
                    userProfile.value.role = u.role === 'student' ? 'Student' : u.role;
                }
                if (u.theme) {
                    userProfile.value.theme = u.theme;
                    applyTheme(u.theme);
                }
                if (u.status) {
                    userProfile.value.status = u.status;
                }
            }
        }).catch(err => {
            console.error('Failed to load profile details in layout:', err);
        });
    }
});
</script>

<template>
    <div class="min-h-screen bg-[#f8fafc] dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans flex overflow-hidden">
        
        <!-- Sidebar (Desktop) -->
        <aside class="hidden lg:flex flex-col w-[260px] bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/50 shrink-0 h-screen sticky top-0">
            <!-- Brand Logo -->
            <div class="px-6 h-20 flex flex-col justify-center border-b border-slate-50 dark:border-slate-700/50">
                <Link href="/" class="flex flex-col group">
                    <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent group-hover:opacity-80 transition">
                        ScholarPath
                    </span>
                </Link>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {{ userProfile.role?.toLowerCase() === 'instansi' ? 'Institution Dashboard' : 'Student Dashboard' }}
                </span>
            </div>

            <!-- Navigation Links -->
            <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <template v-if="userProfile.role?.toLowerCase() === 'admin'">
                    <!-- Admin Dashboard -->
                    <Link
                        :href="route('admin.dashboard')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.dashboard') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        Admin Dashboard
                    </Link>

                    <!-- User Management -->
                    <Link
                        :href="route('admin.user-management')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.user-management') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Management
                    </Link>

                    <!-- Content Verification -->
                    <Link
                        :href="route('admin.content-verification')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.content-verification') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Content Verification
                    </Link>

                    <!-- Institution Verification -->
                    <Link
                        :href="route('admin.institution-verification')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.institution-verification') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Institution Verification
                    </Link>

                    <!-- System Logs -->
                    <Link
                        :href="route('admin.system-logs')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('admin.system-logs') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        System Logs
                    </Link>
                </template>

                <template v-else-if="isInstansi">
                    <!-- Dashboard -->
                    <Link
                        :href="isApproved ? route('dashboard') : '#'"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="[
                            route().current('dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                        ]"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        Dashboard
                        <span v-if="isLocked" class="ml-auto">
                            <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </span>
                    </Link>

                    <!-- Kelola Program -->
                    <Link
                        :href="isApproved ? route('kelola-program') : '#'"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="[
                            route().current('kelola-program') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                        ]"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                        </svg>
                        Kelola Program
                        <span v-if="isLocked" class="ml-auto">
                            <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </span>
                    </Link>

                    <!-- Pelamar -->
                    <Link
                        :href="isApproved ? route('pelamar') : '#'"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="[
                            route().current('pelamar') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                            { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                        ]"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Pelamar
                        <span v-if="isLocked" class="ml-auto">
                            <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </span>
                    </Link>

                </template>

                <template v-else>
                    <!-- Dashboard -->
                    <Link
                        :href="route('dashboard')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('dashboard') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                        </svg>
                        Dashboard
                    </Link>

                    <!-- My Programs -->
                    <Link
                        :href="route('my-programs')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('my-programs') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        My Programs
                    </Link>

                    <!-- AI Guide -->
                    <Link
                        :href="route('ai-guide')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('ai-guide') 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Guide
                    </Link>
                </template>

                <!-- Settings -->
                <Link
                    :href="userProfile.role?.toLowerCase() === 'admin' ? route('admin.settings') : route('profile.edit')"
                    class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                    :class="route().current('profile.edit') || route().current('admin.settings') 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                </Link>
            </nav>

            <!-- Bottom: Log Out -->
            <div class="p-4 border-t border-slate-50">
                <button
                    type="button"
                    @click="handleLogout"
                    class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                </button>
            </div>
        </aside>

        <!-- Main Wrapper -->
        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            
            <!-- Topbar Header -->
            <header class="h-20 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between px-6 shrink-0 relative z-20">
                <!-- Search Insights -->
                <div class="flex items-center gap-3 flex-1 max-w-md">
                    <div class="relative w-full">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            v-model="searchQuery"
                            @keydown.enter="handleSearch"
                            type="text"
                            placeholder="Search scholarships, labs, competitions..."
                            class="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition outline-none"
                        />
                        <button
                            @click="handleSearch"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition"
                        >
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Right profile controls -->
                <div class="flex items-center gap-5">
                    <!-- Theme Toggle -->
                    <button @click="toggleDarkMode" class="p-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100 focus:outline-none">
                        <svg v-if="!isDarkMode" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </button>

                    <!-- Notifications -->
                    <div class="relative">
                        <button
                            @click="toggleNotifications"
                            class="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100 focus:outline-none"
                        >
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span
                                v-if="hasNewNotifications"
                                class="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white"
                            ></span>
                        </button>

                        <!-- Notification Dropdown Panel -->
                        <div
                            v-if="showNotifications"
                            class="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 text-left"
                        >
                            <div class="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                <span class="text-xs font-bold text-slate-700">Notifications</span>
                                <button
                                    @click="showNotifications = false"
                                    class="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                                >
                                    Dismiss
                                </button>
                            </div>
                            <div class="max-h-72 overflow-y-auto divide-y divide-slate-50">
                                <div v-if="notificationsList.length === 0" class="px-4 py-6 text-center text-xs text-slate-400">
                                    No notifications found.
                                </div>
                                <div
                                    v-for="item in notificationsList"
                                    :key="item.id"
                                    class="px-4 py-3 hover:bg-slate-50/50 transition duration-150"
                                >
                                    <div class="flex items-start justify-between gap-1">
                                        <h5 class="text-xs font-bold text-slate-800">{{ item.title }}</h5>
                                        <span class="text-[9px] text-slate-400 font-medium shrink-0">
                                            {{ new Date(item.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) }}
                                        </span>
                                    </div>
                                    <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">{{ item.message }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Info -->
                    <Link
                        :href="userProfile.role?.toLowerCase() === 'admin' ? route('admin.settings') : route('profile.edit')"
                        class="flex items-center gap-3 hover:opacity-85 transition cursor-pointer"
                    >
                        <div class="text-right hidden sm:block">
                            <h4 class="text-sm font-bold text-slate-800 leading-tight">
                                {{ userProfile.name || $page.props.auth.user.name }}
                            </h4>
                            <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                {{ userProfile.role }}
                            </p>
                        </div>
                        <!-- Profile Image -->
                        <div class="h-10 w-10 rounded-xl overflow-hidden border border-slate-100 ring-2 ring-indigo-50 hover:ring-indigo-100 transition shrink-0">
                            <img :src="userProfile.foto || '/images/avatar.png'" alt="Avatar" class="h-full w-full object-cover" />
                        </div>
                    </Link>

                    <!-- Hamburger (Mobile Only) -->
                    <button
                        @click="showingMobileMenu = !showingMobileMenu"
                        class="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 transition focus:outline-none"
                    >
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Mobile Navigation Overlay -->
            <transition name="fade">
                <div v-if="showingMobileMenu" class="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" @click="showingMobileMenu = false"></div>
            </transition>

            <aside
                class="lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white flex flex-col border-r border-slate-100 transition-transform duration-300 transform"
                :class="showingMobileMenu ? 'translate-x-0' : '-translate-x-full'"
            >
                <div class="px-6 h-20 flex flex-col justify-center border-b border-slate-50">
                    <Link href="/" class="flex flex-col group">
                        <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent group-hover:opacity-80 transition">
                            ScholarPath
                        </span>
                    </Link>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {{ userProfile.role?.toLowerCase() === 'instansi' ? 'Institution Dashboard' : 'Student Dashboard' }}
                    </span>
                </div>

                <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto" @click="showingMobileMenu = false">
                    <template v-if="userProfile.role?.toLowerCase() === 'admin'">
                        <!-- Admin Dashboard -->
                        <Link
                            :href="route('admin.dashboard')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('admin.dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            Admin Dashboard
                        </Link>
                        <!-- User Management -->
                        <Link
                            :href="route('admin.user-management')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('admin.user-management') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            User Management
                        </Link>
                        <!-- Content Verification -->
                        <Link
                            :href="route('admin.content-verification')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('admin.content-verification') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            Content Verification
                        </Link>
                        <!-- Institution Verification -->
                        <Link
                            :href="route('admin.institution-verification')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('admin.institution-verification') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            Institution Verification
                        </Link>
                        <!-- System Logs -->
                        <Link
                            :href="route('admin.system-logs')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('admin.system-logs') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            System Logs
                        </Link>
                    </template>
                    <template v-else-if="isInstansi">
                        <!-- Dashboard -->
                        <Link
                            :href="isApproved ? route('dashboard') : '#'"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="[
                                route().current('dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50',
                                { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                            ]"
                        >
                            Dashboard
                        </Link>
                        <!-- Kelola Program -->
                        <Link
                            :href="isApproved ? route('kelola-program') : '#'"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="[
                                route().current('kelola-program') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50',
                                { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                            ]"
                        >
                            Kelola Program
                        </Link>
                        <!-- Pelamar -->
                        <Link
                            :href="isApproved ? route('pelamar') : '#'"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="[
                                route().current('pelamar') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50',
                                { 'pointer-events-none opacity-40 cursor-not-allowed': isLocked }
                            ]"
                        >
                            Pelamar
                        </Link>
                    </template>
                    <template v-else>
                        <!-- Dashboard -->
                        <Link
                            :href="route('dashboard')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('dashboard') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            Dashboard
                        </Link>
                        <!-- My Programs -->
                        <Link
                            :href="route('my-programs')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('my-programs') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            My Programs
                        </Link>
                        <!-- AI Guide -->
                        <Link
                            :href="route('ai-guide')"
                            class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            :class="route().current('ai-guide') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                        >
                            AI Guide
                        </Link>
                    </template>

                    <!-- Settings -->
                    <Link
                        :href="userProfile.role?.toLowerCase() === 'admin' ? route('admin.settings') : route('profile.edit')"
                        class="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                        :class="route().current('profile.edit') || route().current('admin.settings') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-600 hover:bg-slate-50'"
                    >
                        Settings
                    </Link>
                </nav>

                <div class="p-4 border-t border-slate-50">
                    <button
                        type="button"
                        @click="handleLogout"
                        class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-sm font-bold transition duration-200 cursor-pointer"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            <!-- ================================================= -->
            <!-- MAIN PAGE CONTENT — TOTAL LOCKDOWN GATE           -->
            <!-- ================================================= -->
            <main class="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/40 dark:bg-slate-900">

                <!-- ✅ KONDISI A: APPROVED — Render slot normally -->
                <template v-if="!isInstansi || isApproved">
                    <slot />
                </template>

                <!-- 🔒 KONDISI B + C: LOCKED — Institution not yet approved -->
                <template v-else>
                    <div class="max-w-2xl mx-auto py-10 space-y-6">

                        <!-- ❌ KONDISI C: REJECTED — Red alert banner + re-upload form -->
                        <template v-if="isRejected">
                            <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/60 rounded-3xl p-6 flex items-start gap-4">
                                <div class="shrink-0 h-10 w-10 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 class="font-black text-red-800 dark:text-red-300 text-base">Pendaftaran Instansi Anda DITOLAK oleh Admin</h3>
                                    <p class="text-red-700 dark:text-red-400 text-sm font-medium mt-1">Mohon periksa kembali keabsahan berkas Anda dan ajukan ulang berkas yang valid di bawah ini.</p>
                                </div>
                            </div>

                            <!-- Re-upload form for rejected -->
                            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                                <h4 class="text-lg font-black text-slate-800 dark:text-white mb-1">Ajukan Ulang Berkas Verifikasi</h4>
                                <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Unggah ulang 2 (dua) dokumen wajib berikut dalam format PDF. Ukuran maksimum 5MB per file.</p>
                                <form @submit.prevent="submitVerificationDocs" class="space-y-5">
                                    <div>
                                        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">SK Izin Operasional / SK Pendirian *</label>
                                        <input type="file" accept=".pdf" required @change="e => fileIzin = e.target.files[0]" class="w-full text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 cursor-pointer" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Dokumen Legalitas NIB *</label>
                                        <input type="file" accept=".pdf" required @change="e => fileLegalitas = e.target.files[0]" class="w-full text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 cursor-pointer" />
                                    </div>
                                    <p v-if="verificationErrorMsg" class="text-red-600 dark:text-red-400 text-xs font-semibold">⚠ {{ verificationErrorMsg }}</p>
                                    <button type="submit" :disabled="isSubmittingVerification" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        <svg v-if="isSubmittingVerification" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>{{ isSubmittingVerification ? 'Mengunggah...' : '📤 Kirim Ulang Berkas' }}</span>
                                    </button>
                                </form>
                            </div>
                        </template>

                        <!-- ⏳ KONDISI B: PENDING -->
                        <template v-else-if="isPending">

                            <!-- B1: Belum upload dokumen — show upload form -->
                            <template v-if="!hasUploadedDocs">
                                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 flex items-start gap-4">
                                    <div class="shrink-0 h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div>
                                        <h3 class="font-black text-amber-800 dark:text-amber-300 text-base">Akun Anda Belum Aktif</h3>
                                        <p class="text-amber-700 dark:text-amber-400 text-sm font-medium mt-1">Mohon lengkapi 2 dokumen persyaratan wajib di bawah ini agar Admin dapat memverifikasi instansi Anda.</p>
                                    </div>
                                </div>

                                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                                    <h4 class="text-lg font-black text-slate-800 dark:text-white mb-1">Lengkapi Dokumen Verifikasi</h4>
                                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Unggah 2 (dua) dokumen berikut dalam format PDF. Ukuran maksimum 5MB per file.</p>
                                    <form @submit.prevent="submitVerificationDocs" class="space-y-5">
                                        <div>
                                            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">SK Izin Operasional / SK Pendirian *</label>
                                            <input type="file" accept=".pdf" required @change="e => fileIzin = e.target.files[0]" class="w-full text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 cursor-pointer" />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Dokumen Legalitas NIB *</label>
                                            <input type="file" accept=".pdf" required @change="e => fileLegalitas = e.target.files[0]" class="w-full text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 cursor-pointer" />
                                        </div>
                                        <p v-if="verificationErrorMsg" class="text-red-600 dark:text-red-400 text-xs font-semibold">⚠ {{ verificationErrorMsg }}</p>
                                        <button type="submit" :disabled="isSubmittingVerification" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            <svg v-if="isSubmittingVerification" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>{{ isSubmittingVerification ? 'Mengunggah...' : '📤 Kirim Dokumen Verifikasi' }}</span>
                                        </button>
                                    </form>
                                </div>
                            </template>

                            <!-- B2: Sudah upload, tunggu review admin -->
                            <template v-else>
                                <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-10 text-center">
                                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/40 mb-6">
                                        <svg class="h-9 w-9 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Berkas Sedang Ditinjau</h3>
                                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Berkas Anda telah berhasil diunggah dan sedang diperiksa oleh Admin. Proses peninjauan memakan waktu maksimal <strong class="text-indigo-600 dark:text-indigo-400">1×24 jam</strong>.</p>
                                    <div class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                        <span class="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                        Menunggu Persetujuan Admin
                                    </div>
                                </div>
                            </template>

                        </template>

                    </div>
                </template>

            </main>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
