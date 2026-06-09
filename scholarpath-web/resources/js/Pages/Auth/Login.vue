<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref, onMounted } from 'vue';
import axios from 'axios';

defineProps({
    canResetPassword: {
        type: Boolean,
    },
    status: {
        type: String,
    },
});

const form = useForm({
    email: '',
    password: '',
    remember: false,
    role: 'siswa',
});

const loginRole = ref('siswa'); // 'siswa' or 'instansi'
const errorBackend = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);
const showRegisteredSuccess = ref(false);

onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'success') {
        showRegisteredSuccess.value = true;
        // Clean up URL query parameters without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load Google GSI client library dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        initializeGoogleSignIn();
    };
    document.head.appendChild(script);
});

const submit = async () => {
    errorBackend.value = '';
    showRegisteredSuccess.value = false;
    isSubmitting.value = true;
    
    try {
        // 1. Hubungkan ke Go Backend untuk autentikasi JWT & pemeriksaan role
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.post(`${backendUrl}/login`, {
            email: form.email,
            password: form.password
        });
        
        const data = response.data;
        
        // 2. Pemeriksaan Kesesuaian Role
        const roleReturned = data.role ? data.role.toLowerCase() : 'student';
        
        if (roleReturned === 'admin') {
            isSubmitting.value = false;
            errorBackend.value = 'Akun Administrator tidak dapat masuk melalui halaman ini. Silakan gunakan portal khusus Admin.';
            form.reset('password');
            return;
        }
        
        if (loginRole.value === 'siswa' && roleReturned !== 'student' && roleReturned !== 'siswa') {
            isSubmitting.value = false;
            errorBackend.value = 'Akun ini bukan akun Siswa. Silakan masuk melalui tab yang sesuai.';
            form.reset('password');
            return;
        }
        
        if (loginRole.value === 'instansi' && roleReturned !== 'instansi') {
            isSubmitting.value = false;
            errorBackend.value = 'Akun ini bukan akun Instansi. Silakan masuk melalui tab yang sesuai.';
            form.reset('password');
            return;
        }

        // Simpan JWT Token dan data user ke localStorage jika valid
        if (data && data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_role', data.role);
            localStorage.setItem('auth_name', data.name);
            localStorage.setItem('auth_user_id', data.user_id);
        }
        
        // 3. Hubungkan ke Laravel Session (Breeze) untuk sinkronisasi web session
        form.role = loginRole.value;
        form.post(route('login'), {
            onFinish: () => {
                isSubmitting.value = false;
                form.reset('password');
            },
            onError: (errors) => {
                isSubmitting.value = false;
                errorBackend.value = errors.email || 'Gagal masuk ke sesi web.';
            }
        });
    } catch (error) {
        isSubmitting.value = false;
        console.error('Go Backend Authentication Failed:', error);
        if (error.response && error.response.data && error.response.data.error) {
            errorBackend.value = error.response.data.error;
        } else {
            errorBackend.value = 'Gagal terhubung ke backend Go. Pastikan backend aktif.';
        }
        form.reset('password');
    }
};

const setLoginRole = (role) => {
    loginRole.value = role;
    form.role = role;
    errorBackend.value = '';
    showRegisteredSuccess.value = false;
};

let tokenClient = null;

const initializeGoogleSignIn = () => {
    if (typeof google !== 'undefined') {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn('VITE_GOOGLE_CLIENT_ID is not configured in .env file');
            return;
        }

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile',
            callback: handleGoogleLoginCallback,
        });
    }
};

const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
        alert('Integrasi Google Login belum dikonfigurasi. Variabel VITE_GOOGLE_CLIENT_ID tidak ditemukan di file .env.');
        return;
    }

    if (typeof google === 'undefined' || !tokenClient) {
        if (typeof google !== 'undefined') {
            initializeGoogleSignIn();
        }
        
        if (typeof google === 'undefined' || !tokenClient) {
            alert('Layanan Google Sign-In tidak tersedia saat ini. Silakan muat ulang halaman atau periksa koneksi internet Anda.');
            return;
        }
    }

    // Minta Access Token melalui Popup Google
    tokenClient.requestAccessToken();
};

const handleGoogleLoginCallback = async (response) => {
    if (!response.access_token) {
        errorBackend.value = 'Gagal menerima token akses dari Google.';
        return;
    }

    errorBackend.value = '';
    isSubmitting.value = true;

    try {
        const accessToken = response.access_token;
        const currentRole = loginRole.value;

        // 1. Hubungkan ke Go Backend
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const goResponse = await axios.post(`${backendUrl}/login-google`, {
            access_token: accessToken,
            role: currentRole,
        });

        const data = goResponse.data;

        // Simpan JWT Token dan data user ke localStorage jika valid
        if (data && data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_role', data.role);
            localStorage.setItem('auth_name', data.name);
            localStorage.setItem('auth_user_id', data.user_id);
        }

        // 2. Sinkronisasi ke Laravel Session (Breeze)
        const laravelResponse = await axios.post(route('login.google-sync'), {
            access_token: accessToken,
            role: currentRole,
        });

        if (laravelResponse.data.success) {
            window.location.href = route('dashboard');
        } else {
            isSubmitting.value = false;
            errorBackend.value = 'Gagal sinkronisasi sesi web Laravel.';
        }
    } catch (error) {
        isSubmitting.value = false;
        console.error('Google Sign-In Authentication Failed:', error);
        if (error.response && error.response.data && error.response.data.error) {
            errorBackend.value = error.response.data.error;
        } else {
            errorBackend.value = 'Autentikasi Google gagal. Pastikan API Go & Laravel Anda berjalan.';
        }
    }
};
</script>

<template>
    <GuestLayout>
        <Head title="Masuk" />

        <!-- Registration Success Notification -->
        <div v-if="showRegisteredSuccess" class="mb-6 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-100 flex items-start gap-2.5 animate-fadeIn">
            <svg class="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <p>Registrasi Berhasil!</p>
                <p class="font-medium text-[11px] text-emerald-600/90 mt-0.5">Silakan masuk menggunakan email dan password Anda.</p>
            </div>
        </div>

        <!-- Status Session (Laravel) -->
        <div v-if="status" class="mb-6 rounded-2xl bg-green-50 p-4 text-xs font-bold text-green-600 border border-green-100">
            {{ status }}
        </div>

        <!-- Error Backend & Laravel -->
        <div v-if="errorBackend" class="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-start gap-2.5">
            <svg class="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorBackend }}</span>
        </div>

        <!-- Role Tabs Toggle -->
        <div class="mb-6 flex rounded-2xl bg-slate-100 p-1.5 shadow-inner">
            <button
                type="button"
                @click="setLoginRole('siswa')"
                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all duration-200 focus:outline-none cursor-pointer"
                :class="loginRole === 'siswa' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'"
            >
                Siswa
            </button>
            <button
                type="button"
                @click="setLoginRole('instansi')"
                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all duration-200 focus:outline-none cursor-pointer"
                :class="loginRole === 'instansi' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'"
            >
                Instansi
            </button>
        </div>

        <!-- Tab Title and Subtitle -->
        <div class="mb-6 text-center">
            <h2 class="text-xl font-extrabold text-slate-800">
                Masuk sebagai {{ loginRole === 'siswa' ? 'Siswa' : 'Instansi' }}
            </h2>
            <p class="text-xs text-slate-500 mt-1">
                {{ loginRole === 'siswa' 
                    ? 'Akses beasiswa, rekomendasi AI, dan panduan cerdas.' 
                    : 'Kelola program, pantau pelamar, dan perbarui profil instansi.' }}
            </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-4 text-left">
            <!-- Email Field -->
            <div>
                <InputLabel for="email" value="Email" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    </div>
                    <input
                        id="email"
                        type="email"
                        v-model="form.email"
                        required
                        autofocus
                        autocomplete="username"
                        placeholder="nama@email.com"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
                <InputError class="mt-1.5" :message="form.errors.email" />
            </div>

            <!-- Password Field -->
            <div>
                <div class="flex justify-between items-center mb-1.5">
                    <InputLabel for="password" value="Kata Sandi" class="text-[10px] font-black uppercase tracking-wider text-slate-400" />
                    <Link
                        v-if="canResetPassword"
                        :href="route('password.request')"
                        class="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                    >
                        Lupa kata sandi?
                    </Link>
                </div>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input
                        id="password"
                        :type="showPassword ? 'text' : 'password'"
                        v-model="form.password"
                        required
                        autocomplete="current-password"
                        placeholder="••••••••"
                        class="block w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition"
                    >
                        <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
                <InputError class="mt-1.5" :message="form.errors.password" />
            </div>

            <!-- Remember Me -->
            <div class="flex items-center">
                <input
                    id="remember"
                    type="checkbox"
                    v-model="form.remember"
                    class="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500/20 border-slate-300 rounded-lg transition duration-200"
                />
                <label for="remember" class="ml-2.5 text-xs font-bold text-slate-500 select-none cursor-pointer">
                    Ingat saya
                </label>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
                <button
                    type="submit"
                    :disabled="form.processing || isSubmitting"
                    class="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-[1px] active:translate-y-0 transition duration-200 outline-none cursor-pointer"
                >
                    <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Masuk Sekarang
                </button>
            </div>

            <!-- Divider -->
            <div class="relative my-6 flex items-center justify-between">
                <span class="h-[1px] w-full bg-slate-200/80"></span>
                <span class="px-4 text-[9px] font-black uppercase tracking-wider text-slate-400">atau</span>
                <span class="h-[1px] w-full bg-slate-200/80"></span>
            </div>

            <!-- Google Login -->
            <div>
                <button
                    type="button"
                    @click="loginWithGoogle"
                    class="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 font-bold py-3 text-xs text-slate-700 transition duration-200 focus:outline-none cursor-pointer"
                >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Masuk dengan Google
                </button>
            </div>

            <!-- Register Link -->
            <div class="text-center pt-3 text-xs font-semibold text-slate-500">
                Belum punya akun? 
                <Link :href="route('register')" class="text-indigo-600 hover:text-indigo-700 transition">Daftar sekarang</Link>
            </div>
        </form>
    </GuestLayout>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
