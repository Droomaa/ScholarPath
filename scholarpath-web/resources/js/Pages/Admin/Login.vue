<script setup>
import { ref } from 'vue';
import { Head, useForm } from '@inertiajs/vue3';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { ShieldCheck, Lock, Mail, Loader2 } from '@lucide/vue';

const form = useForm({
    email: '',
    password: '',
});
const isLoading = ref(false);
const errorMessage = ref('');

const submit = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        // First get the JWT from Go backend
        const response = await axios.post('http://localhost:8080/login', {
            email: form.email,
            password: form.password
        });
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
    } catch (error) {
        console.error('Failed to get JWT token from Go backend:', error);
    }

    form.post(route('admin.login.post'), {
        onError: (errors) => {
            errorMessage.value = errors.email || 'Email atau password salah.';
            isLoading.value = false;
        },
        onFinish: () => {
            isLoading.value = false;
        }
    });
};
</script>

<template>
    <Head title="Admin Console Login" />

    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
        <!-- Abstract Background -->
        <div class="absolute inset-0 z-0 opacity-30">
            <div class="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-brand-500 rounded-full blur-[120px] mix-blend-multiply"></div>
            <div class="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-indigo-500 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>

        <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100">
                    <ShieldCheck class="w-8 h-8 text-brand-600" />
                </div>
            </div>
            <h2 class="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin Console
            </h2>
            <p class="mt-2 text-center text-sm text-slate-500 font-medium">
                Restricted access. Authorized personnel only.
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
            <div class="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white">
                <form class="space-y-6" @submit.prevent="submit">
                    <div v-if="errorMessage" class="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center justify-center">
                        {{ errorMessage }}
                    </div>

                    <div>
                        <InputLabel for="email" value="Email / Username" class="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2" />
                        <div class="relative mt-1">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail class="h-5 w-5 text-slate-400" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                class="pl-10 w-full block bg-slate-50/50"
                                v-model="form.email"
                                required
                                autofocus
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel for="password" value="Password" class="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2" />
                        <div class="relative mt-1">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock class="h-5 w-5 text-slate-400" />
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                class="pl-10 w-full block bg-slate-50/50"
                                v-model="form.password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-brand-500/30 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin mr-2" />
                            <span v-else>Masuk sebagai Pusat</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="mt-8 text-center text-xs text-slate-400 relative z-10 font-medium">
            &copy; 2024 ScholarPath System. All rights reserved.
        </div>
    </div>
</template>
