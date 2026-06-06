<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';
import axios from 'axios';

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const errorBackend = ref('');
const showPassword = ref(false);
const isSubmitting = ref(false);

const submit = async () => {
    errorBackend.value = '';
    isSubmitting.value = true;
    
    try {
        // 1. Authenticate with Go Backend for JWT & role validation
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const response = await axios.post(`${backendUrl}/login`, {
            email: form.email,
            password: form.password
        });
        
        const data = response.data;
        const roleReturned = data.role ? data.role.toLowerCase() : '';
        
        // Ensure the user has the admin role
        if (roleReturned !== 'admin') {
            isSubmitting.value = false;
            errorBackend.value = 'Akses Ditolak. Halaman ini hanya diperuntukkan bagi Administrator.';
            form.reset('password');
            return;
        }

        // Cache details in localStorage if successful
        if (data && data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_role', data.role);
            localStorage.setItem('auth_name', data.name);
            localStorage.setItem('auth_user_id', data.user_id);
        }
        
        // 2. Submit to Laravel Admin Session Login
        form.post(route('admin.login'), {
            onFinish: () => {
                isSubmitting.value = false;
                form.reset('password');
            },
            onError: (errors) => {
                isSubmitting.value = false;
                errorBackend.value = errors.email || 'Gagal masuk ke sesi web admin.';
            }
        });
    } catch (error) {
        isSubmitting.value = false;
        console.error('Admin Go Backend Auth Failed:', error);
        if (error.response && error.response.data && error.response.data.error) {
            errorBackend.value = error.response.data.error;
        } else {
            errorBackend.value = 'Gagal terhubung ke backend Go. Pastikan server Go aktif.';
        }
        form.reset('password');
    }
};
</script>

<template>
    <GuestLayout>
        <Head title="Admin Console Login" />

        <!-- Brand Icon / Accent -->
        <div class="mb-4 text-center">
            <div class="inline-flex h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100/50 items-center justify-center text-2xl shadow-inner mb-3">
                🛡️
            </div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Admin Console</h2>
            <p class="text-xs text-slate-500 font-semibold mt-1">
                Autentikasi khusus pengawas dan pengelola sistem ScholarPath.
            </p>
        </div>

        <!-- Error Panel -->
        <div v-if="errorBackend" class="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-start gap-2.5 animate-fadeIn">
            <svg class="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorBackend }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-5 text-left">
            <!-- Email -->
            <div>
                <InputLabel for="email" value="Email Administrator" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
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
                        placeholder="admin@scholarpath.id"
                        class="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-purple-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-purple-500/5 transition duration-200 outline-none"
                    />
                </div>
                <InputError class="mt-1.5" :message="form.errors.email" />
            </div>

            <!-- Password -->
            <div>
                <InputLabel for="password" value="Kata Sandi Keamanan" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
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
                        class="block w-full pl-11 pr-11 py-3.5 bg-slate-50/50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-purple-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-purple-500/5 transition duration-200 outline-none"
                    />
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-650 transition"
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

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        v-model="form.remember"
                        class="h-4.5 w-4.5 text-purple-600 focus:ring-purple-500/20 border-slate-350 rounded-lg transition duration-200 cursor-pointer"
                    />
                    <label for="remember" class="ml-2.5 text-xs font-bold text-slate-500 select-none cursor-pointer">
                        Ingat saya
                    </label>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
                <button
                    type="submit"
                    :disabled="form.processing || isSubmitting"
                    class="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-purple-650/20 hover:shadow-xl hover:shadow-purple-650/30 hover:-translate-y-[1px] active:translate-y-0 transition duration-200 outline-none cursor-pointer"
                >
                    <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Otorisasi Akses
                </button>
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
