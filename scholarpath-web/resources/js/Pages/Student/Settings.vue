<script setup>
import { ref, onMounted } from 'vue';
import { Head, useForm } from '@inertiajs/vue3';
import StudentLayout from '@/Layouts/StudentLayout.vue';
import Card from '@/Components/Card.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Sparkles, User, GraduationCap, Briefcase, Bell, X, Plus } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const form = useForm({
    name: '',
    email: '',
    location: '',
    institution: '',
    grade: '',
    keahlian_raw: '', // Holds original JSON string
});

const loading = ref(false);

const loadProfile = async () => {
    loading.value = true;
    try {
        const response = await backendApi.get('/user/profile');
        if (response.data?.data) {
            form.name = response.data.data.name || '';
            form.email = response.data.data.email || '';
            form.keahlian_raw = response.data.data.keahlian || '';
            
            // Keahlian is a JSON string containing location, institution, grade, and ai_query
            if (response.data.data.keahlian) {
                try {
                    const parsed = JSON.parse(response.data.data.keahlian);
                    form.location = parsed.location || '';
                    form.institution = parsed.institution || '';
                    form.grade = parsed.grade || '';
                } catch (e) {
                    console.error('Failed to parse Keahlian JSON', e);
                }
            }
        }
    } catch (error) {
        console.error('Failed to load profile', error);
    } finally {
        loading.value = false;
    }
};

const saveProfile = async () => {
    let existingKeahlian = {};
    if (form.keahlian_raw) {
        try { existingKeahlian = JSON.parse(form.keahlian_raw); } catch(e) {}
    }
    
    existingKeahlian.location = form.location;
    existingKeahlian.institution = form.institution;
    existingKeahlian.grade = form.grade;

    const payload = {
        name: form.name,
        email: form.email,
        keahlian: JSON.stringify(existingKeahlian),
    };
    
    try {
        await backendApi.put('/user/profile', payload);
        alert('Profile saved successfully!');
    } catch (error) {
        console.error('Failed to save profile', error);
        alert('Failed to save profile. Ensure the Go backend is running.');
    }
};

onMounted(() => {
    loadProfile();
});
</script>

<template>
    <StudentLayout>
        <Head title="Settings" />

        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Sidebar -->
                <div class="lg:col-span-1 space-y-6">
                    <!-- AI Optimization Status -->
                    <div class="bg-gradient-to-br from-white to-brand-50 rounded-2xl p-6 border border-brand-100 shadow-lg text-center relative overflow-hidden">
                        <div class="absolute -top-4 -right-4 text-brand-100 opacity-50">
                            <Sparkles class="w-24 h-24" />
                        </div>
                        <div class="relative z-10">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold tracking-wider uppercase mb-6">
                                <Sparkles class="w-3 h-3" /> AI Optimization
                            </div>
                            
                            <div class="relative w-32 h-32 mx-auto mb-4">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle class="text-slate-100 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                    <circle class="text-brand-600 stroke-current drop-shadow-md" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="75.36"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-3xl font-black text-slate-900">70%</span>
                                    <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Complete</span>
                                </div>
                            </div>
                            
                            <p class="text-sm text-slate-600 mb-6 font-medium">
                                Add your Research Interests to reach 85% and unlock targeted scholarship matches.
                            </p>
                            
                            <button class="w-full py-2.5 rounded-xl bg-white border border-brand-200 text-brand-600 font-bold hover:bg-brand-50 transition-colors shadow-sm">
                                Boost Match Rate
                            </button>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <nav class="space-y-1">
                        <a href="#" class="flex items-center px-4 py-3 bg-white text-brand-700 font-bold rounded-xl shadow-sm border border-slate-100 transition-colors">
                            <User class="w-5 h-5 mr-3 text-brand-500" /> Personal Information
                        </a>
                        <a href="#" class="flex items-center px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-white hover:shadow-sm transition-colors">
                            <GraduationCap class="w-5 h-5 mr-3 text-slate-400" /> Academic Details
                        </a>
                        <a href="#" class="flex items-center px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-white hover:shadow-sm transition-colors">
                            <Bell class="w-5 h-5 mr-3 text-slate-400" /> Notifications
                        </a>
                    </nav>
                </div>

                <!-- Main Settings Content -->
                <div class="lg:col-span-3 space-y-6">
                    <Card>
                        <div class="flex items-start justify-between mb-6">
                            <div>
                                <h2 class="text-xl font-bold text-slate-900">Personal Information</h2>
                                <p class="text-sm text-slate-500 mt-1">Update your basic details for scholarship applications.</p>
                            </div>
                            <div class="relative">
                                <img :src="'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=ede9fe&color=6d28d9'" alt="Avatar" class="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200" />
                                <button class="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-brand-600 hover:bg-brand-50">
                                    <Sparkles class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel for="name" value="Full Name" />
                                <div class="relative mt-1">
                                    <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <TextInput id="name" type="text" class="pl-10 w-full" v-model="form.name" />
                                </div>
                            </div>
                            <div>
                                <InputLabel for="email" value="Email Address" />
                                <div class="relative mt-1">
                                    <TextInput id="email" type="email" class="w-full bg-slate-100 text-slate-500 cursor-not-allowed" v-model="form.email" disabled />
                                </div>
                            </div>
                            <div class="md:col-span-2">
                                <InputLabel for="location" value="Location" />
                                <div class="relative mt-1">
                                    <TextInput id="location" type="text" class="w-full" v-model="form.location" />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div class="mb-6">
                            <h2 class="text-xl font-bold text-slate-900">Academic Details</h2>
                            <p class="text-sm text-slate-500 mt-1">Verification of these details may be required for specific grants.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel for="institution" value="Current Institution" />
                                <TextInput id="institution" type="text" class="mt-1 w-full" v-model="form.institution" />
                            </div>
                            <div>
                                <InputLabel for="grade" value="Grade" />
                                <TextInput id="grade" type="text" class="mt-1 w-full" v-model="form.grade" />
                            </div>
                        </div>
                    </Card>



                    <!-- Form Actions -->
                    <div class="flex justify-end gap-4 mt-8">
                        <button class="px-6 py-2.5 rounded-xl bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Discard Changes
                        </button>
                        <PrimaryButton @click="saveProfile" :disabled="loading">
                            {{ loading ? 'Saving...' : 'Save Profile' }}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    </StudentLayout>
</template>
