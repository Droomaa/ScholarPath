<script setup>
import GuestLayout from '@/Layouts/GuestLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import { Head, Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import axios from 'axios';

const role = ref('siswa'); // 'siswa' or 'instansi'
const isSubmitting = ref(false);
const errorBackend = ref('');

const formFields = ref({
    name: '',
    email: '',
    alamat: '',
    kontak: '',
    password: '',
    password_confirmation: '',
});

const submit = async () => {
    errorBackend.value = '';
    
    if (formFields.value.password !== formFields.value.password_confirmation) {
        errorBackend.value = 'Konfirmasi kata sandi tidak cocok.';
        return;
    }

    isSubmitting.value = true;
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        
        if (role.value === 'siswa') {
            await axios.post(`${backendUrl}/register/siswa`, {
                name: formFields.value.name,
                email: formFields.value.email,
                password: formFields.value.password
            });
        } else {
            await axios.post(`${backendUrl}/register/instansi`, {
                name: formFields.value.name,
                email: formFields.value.email,
                password: formFields.value.password,
                alamat: formFields.value.alamat,
                kontak: formFields.value.kontak
            });
        }
        
        // Redirect to Login with success parameter (database-first flow)
        window.location.href = '/login?registered=success';
    } catch (error) {
        console.error('Registration Failed:', error);
        if (error.response && error.response.data && error.response.data.error) {
            errorBackend.value = error.response.data.error;
        } else {
            errorBackend.value = 'Gagal mendaftar. Pastikan email belum digunakan dan koneksi aktif.';
        }
    } finally {
        isSubmitting.value = false;
    }
};

const setRole = (newRole) => {
    role.value = newRole;
    errorBackend.value = '';
    // Clear passwords
    formFields.value.password = '';
    formFields.value.password_confirmation = '';
};
</script>

<template>
    <GuestLayout>
        <Head title="Daftar Akun" />

        <!-- Role Tabs -->
        <div class="mb-6 flex rounded-2xl bg-slate-100 p-1.5 shadow-inner">
            <button
                type="button"
                @click="setRole('siswa')"
                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all duration-200 focus:outline-none cursor-pointer"
                :class="role === 'siswa' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'"
            >
                Siswa
            </button>
            <button
                type="button"
                @click="setRole('instansi')"
                class="w-1/2 rounded-xl py-2.5 text-center text-xs font-bold transition-all duration-200 focus:outline-none cursor-pointer"
                :class="role === 'instansi' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'"
            >
                Instansi
            </button>
        </div>

        <!-- Title Description -->
        <div class="mb-6 text-center">
            <h2 class="text-xl font-extrabold text-slate-800">
                Daftar Akun {{ role === 'siswa' ? 'Siswa' : 'Instansi' }}
            </h2>
            <p class="text-xs text-slate-500 mt-1">
                {{ role === 'siswa' 
                    ? 'Temukan beasiswa dan kompetisi terbaik dengan rekomendasi AI.' 
                    : 'Publikasikan program dan temukan talenta berprestasi.' }}
            </p>
        </div>

        <!-- Error backend message -->
        <div v-if="errorBackend" class="mb-5 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 flex items-start gap-2.5 animate-fadeIn">
            <svg class="h-4.5 w-4.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorBackend }}</span>
        </div>

        <form @submit.prevent="submit" class="space-y-4 text-left">
            <!-- Name Field -->
            <div>
                <InputLabel for="name" :value="role === 'siswa' ? 'Nama Lengkap' : 'Nama Instansi'" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <input
                        id="name"
                        type="text"
                        v-model="formFields.name"
                        required
                        autofocus
                        :placeholder="role === 'siswa' ? 'Nama lengkap Anda' : 'Nama instansi / universitas'"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Email Field -->
            <div>
                <InputLabel for="email" value="Email Resmi" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    </div>
                    <input
                        id="email"
                        type="email"
                        v-model="formFields.email"
                        required
                        placeholder="nama@email.com"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Alamat Field (Instansi Only) -->
            <div v-if="role === 'instansi'" class="animate-slideDown">
                <InputLabel for="alamat" value="Alamat Kantor Pusat" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <input
                        id="alamat"
                        type="text"
                        v-model="formFields.alamat"
                        required
                        placeholder="Jalan, Kota, Provinsi"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Kontak Field (Instansi Only) -->
            <div v-if="role === 'instansi'" class="animate-slideDown">
                <InputLabel for="kontak" value="Nomor Telepon" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <input
                        id="kontak"
                        type="text"
                        v-model="formFields.kontak"
                        required
                        placeholder="+62 8xx xxxx xxxx"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Password Field -->
            <div>
                <InputLabel for="password" value="Kata Sandi" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input
                        id="password"
                        type="password"
                        v-model="formFields.password"
                        required
                        placeholder="Minimal 6 karakter"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Confirm Password Field -->
            <div>
                <InputLabel for="password_confirmation" value="Konfirmasi Kata Sandi" class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5" />
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input
                        id="password_confirmation"
                        type="password"
                        v-model="formFields.password_confirmation"
                        required
                        placeholder="Ketik ulang kata sandi"
                        class="block w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/5 transition duration-200 outline-none"
                    />
                </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
                <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-[1px] active:translate-y-0 transition duration-200 outline-none cursor-pointer"
                >
                    <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Daftar Sekarang
                </button>
            </div>

            <!-- Already Registered Link -->
            <div class="text-center pt-3 text-xs font-semibold text-slate-500">
                Sudah punya akun? 
                <Link :href="route('login')" class="text-indigo-600 hover:text-indigo-700 transition">Masuk di sini</Link>
            </div>
        </form>
    </GuestLayout>
</template>

<style scoped>
.animate-slideDown {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fadeIn {
    animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
