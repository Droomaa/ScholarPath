<script setup>
import { Head } from '@inertiajs/vue3';
import InstitutionLayout from '@/Layouts/InstitutionLayout.vue';
import Card from '@/Components/Card.vue';
import InputLabel from '@/Components/InputLabel.vue';
import TextInput from '@/Components/TextInput.vue';
import { Users, Shield, Bell, Trash2, Plus, Lock } from '@lucide/vue';

const teamMembers = [
    {
        id: 1,
        name: 'Dr. Robert Chen',
        role: 'Lead Scholarship Officer',
        status: 'Active',
        avatar: 'R+C',
    },
    {
        id: 2,
        name: 'Sarah Jenkins',
        role: 'Review Committee Member',
        status: 'Active',
        avatar: 'S+J',
    },
];

</script>

<template>
    <InstitutionLayout>
        <Head title="Institution Settings" />

        <div class="max-w-7xl mx-auto space-y-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Institution Settings</h1>
                <p class="text-slate-500 mt-1">Manage your scholarship portal configuration, security, and team permissions.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Team Management -->
                    <Card class="p-6">
                        <div class="flex items-start justify-between mb-6">
                            <div class="flex items-center gap-3">
                                <Users class="w-6 h-6 text-brand-600" />
                                <div>
                                    <h2 class="text-xl font-bold text-slate-900">Team Management</h2>
                                    <p class="text-sm text-slate-500">Invite and manage secondary administrators for your institution.</p>
                                </div>
                            </div>
                            <button class="flex items-center px-4 py-2 bg-brand-600 rounded-xl text-sm font-bold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700 transition-colors">
                                <Plus class="w-4 h-4 mr-2" /> Add Member
                            </button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="member in teamMembers" :key="member.id" class="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div class="flex items-center gap-4">
                                    <img :src="'https://ui-avatars.com/api/?name=' + member.avatar + '&background=f1f5f9'" class="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p class="font-bold text-slate-900">{{ member.name }}</p>
                                        <p class="text-xs text-slate-500">{{ member.role }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs font-bold text-green-500">{{ member.status }}</span>
                                    <button class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <!-- Security Configuration -->
                    <Card class="p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <Shield class="w-6 h-6 text-brand-600" />
                            <h2 class="text-xl font-bold text-slate-900">Security Configuration</h2>
                        </div>

                        <div class="space-y-8">
                            <div class="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-100">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                                        <Lock class="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p class="font-bold text-slate-900">Two-Factor Authentication</p>
                                        <p class="text-sm text-slate-600">Secure your account with a secondary verification code.</p>
                                    </div>
                                </div>
                                <!-- Simple Toggle Switch UI -->
                                <div class="relative inline-flex items-center cursor-pointer">
                                    <div class="w-11 h-6 bg-brand-600 rounded-full peer"></div>
                                    <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform translate-x-5"></div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100">
                                <h3 class="text-sm font-bold text-slate-900 mb-4">Change Administrator Password</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <TextInput type="password" placeholder="New Password" class="w-full bg-slate-50" />
                                    <TextInput type="password" placeholder="Confirm New Password" class="w-full bg-slate-50" />
                                </div>
                                <div class="flex justify-end">
                                    <button class="px-6 py-2 bg-white border border-brand-200 rounded-xl text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors shadow-sm">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <!-- Right Column -->
                <div class="space-y-8">
                    <!-- Notifications -->
                    <Card class="p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <Bell class="w-6 h-6 text-brand-600" />
                            <h2 class="text-xl font-bold text-slate-900">Notifications</h2>
                        </div>

                        <div class="space-y-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-slate-900 text-sm">Email Notifications</p>
                                    <p class="text-xs text-slate-500">Daily digest of applicants</p>
                                </div>
                                <div class="relative inline-flex items-center cursor-pointer">
                                    <div class="w-11 h-6 bg-brand-600 rounded-full"></div>
                                    <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full translate-x-5 transition-transform"></div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-slate-900 text-sm">Push Notifications</p>
                                    <p class="text-xs text-slate-500">Alerts for urgent messages</p>
                                </div>
                                <div class="relative inline-flex items-center cursor-pointer">
                                    <div class="w-11 h-6 bg-slate-200 rounded-full"></div>
                                    <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="font-bold text-slate-900 text-sm">Deadline Reminders</p>
                                    <p class="text-xs text-slate-500">7-day advance warnings</p>
                                </div>
                                <div class="relative inline-flex items-center cursor-pointer">
                                    <div class="w-11 h-6 bg-brand-600 rounded-full"></div>
                                    <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full translate-x-5 transition-transform"></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <!-- Institution Plan -->
                    <Card class="p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-0 shadow-xl shadow-brand-500/20 relative overflow-hidden">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <h2 class="text-xl font-bold mb-1 relative z-10">Institution Plan</h2>
                        <p class="text-brand-100 text-sm mb-6 relative z-10">ScholarPath Premium Enterprise</p>
                        
                        <div class="mb-6 relative z-10">
                            <div class="flex items-center justify-between text-xs font-bold mb-2">
                                <span>Team Seats Used</span>
                                <span>3 / 10</span>
                            </div>
                            <div class="w-full bg-black/20 rounded-full h-1.5">
                                <div class="bg-green-400 h-1.5 rounded-full" style="width: 30%"></div>
                            </div>
                        </div>
                        
                        <button class="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-bold transition-colors border border-white/10 relative z-10">
                            View Billing Info
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    </InstitutionLayout>
</template>
