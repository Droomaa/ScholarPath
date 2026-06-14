<script setup>
import { ref, onMounted } from 'vue';
import { Head } from '@inertiajs/vue3';
import StudentLayout from '@/Layouts/StudentLayout.vue';
import Card from '@/Components/Card.vue';
import { Sparkles, CheckCircle, RefreshCw, Filter, ShieldCheck, ChevronRight, Activity } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const loading = ref(false);
const aiRecommendations = ref([]);

onMounted(async () => {
    loading.value = true;
    try {
        const response = await backendApi.get('/ai/recommendation').catch(() => ({ data: [] }));
        aiRecommendations.value = response.data;
    } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <StudentLayout>
        <Head title="AI Guide" />

        <div class="max-w-7xl mx-auto space-y-8">
            <!-- Hero Banner -->
            <div class="bg-gradient-to-r from-brand-700 to-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <!-- Abstract Glows -->
                <div class="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div class="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-brand-400/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-brand-100 text-xs font-bold tracking-wider uppercase border border-white/20 mb-6">
                            <Sparkles class="w-4 h-4" /> AI-Powered Personalized Insights
                        </div>
                        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                            Your Path to <br/> Global Excellence.
                        </h1>
                        <p class="text-brand-100 text-lg max-w-xl mb-8 leading-relaxed">
                            We've analyzed 2,400+ data points from your profile. Based on your leadership in STEM and passion for sustainable tech, we've found 3 "Perfect Matches" for you today.
                        </p>
                        <button class="px-6 py-2.5 rounded-xl bg-white text-brand-700 text-sm font-bold shadow-md hover:bg-slate-50 transition-colors">
                            Refresh Analysis
                        </button>
                    </div>
                    
                    <div class="w-full md:w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-inner">
                        <div class="w-20 h-20 mx-auto rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                            <div class="w-14 h-14 bg-green-400 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                                <CheckCircle class="w-8 h-8" />
                            </div>
                        </div>
                        <h2 class="text-4xl font-extrabold mb-1">98% Match</h2>
                        <p class="text-brand-100 font-medium text-sm tracking-wider uppercase">Profile Accuracy</p>
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column: Top Matches -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <h2 class="text-xl font-bold text-slate-900">Top Recommendation Matches</h2>
                            <span class="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold">3 New</span>
                        </div>
                        <button class="text-slate-400 hover:text-brand-600 transition-colors">
                            <Filter class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Match Card 1 -->
                    <Card class="flex flex-col md:flex-row gap-6 p-6 hover:shadow-xl transition-shadow">
                        <div class="relative w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Silicon Future" class="w-full h-full object-cover" />
                            <div class="absolute top-3 left-3 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                42 Left
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col">
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="text-xl font-bold text-slate-900 leading-tight pr-4">Silicon Future Innovators Grant</h3>
                                <div class="text-right">
                                    <p class="text-xl font-black text-brand-600">$25,000</p>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Tuition Support</p>
                                </div>
                            </div>
                            <p class="text-sm text-slate-500 mb-4">Global Tech Foundation • San Francisco, CA</p>
                            
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                                    <Sparkles class="w-3 h-3 inline mr-1" /> 98% AI Match
                                </span>
                                <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">STEM Excellence</span>
                                <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">Leadership Focus</span>
                            </div>
                            
                            <div class="mt-auto bg-brand-50/50 p-4 rounded-xl border border-brand-100 flex items-center justify-between gap-4">
                                <p class="text-sm text-slate-600 italic leading-relaxed">
                                    "Matches your current focus on AI ethics and top-tier GPA performance."
                                </p>
                                <button class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700 transition shrink-0">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </Card>

                    <!-- Match Card 2 -->
                    <Card class="flex flex-col md:flex-row gap-6 p-6 hover:shadow-xl transition-shadow">
                        <div class="relative w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Digital Nomad" class="w-full h-full object-cover" />
                            <div class="absolute top-3 left-3 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                120 Left
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col">
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="text-xl font-bold text-slate-900 leading-tight pr-4">Digital Nomad Scholarship</h3>
                                <div class="text-right">
                                    <p class="text-xl font-black text-brand-600">$12,000</p>
                                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Housing & Travel</p>
                                </div>
                            </div>
                            <p class="text-sm text-slate-500 mb-4">Remote Frontiers Council • International</p>
                            
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                                    <Sparkles class="w-3 h-3 inline mr-1" /> 94% AI Match
                                </span>
                                <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">Remote Ready</span>
                                <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">Innovation</span>
                            </div>
                            
                            <div class="mt-auto bg-brand-50/50 p-4 rounded-xl border border-brand-100 flex items-center justify-between gap-4">
                                <p class="text-sm text-slate-600 italic leading-relaxed">
                                    "Strong alignment with your extracurricular work in global connectivity."
                                </p>
                                <button class="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-bold shadow-md hover:bg-brand-700 transition shrink-0">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                <!-- Right Column: Deep Dive Analysis -->
                <div class="space-y-6">
                    <Card class="p-6">
                        <div class="flex items-center gap-3 mb-6">
                            <Activity class="w-5 h-5 text-brand-600" />
                            <h2 class="text-xl font-bold text-slate-900">Deep Dive Analysis</h2>
                        </div>

                        <div class="space-y-6 relative">
                            <!-- Timeline Line -->
                            <div class="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>

                            <!-- Subject Alignment -->
                            <div class="relative">
                                <div class="absolute -left-1 top-1 w-6 h-6 rounded-full bg-white border-4 border-brand-500"></div>
                                <div class="ml-8">
                                    <div class="flex items-center justify-between mb-1">
                                        <h4 class="font-bold text-slate-900">Subject Alignment</h4>
                                        <span class="text-xs font-bold text-brand-600">High</span>
                                    </div>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                        <div class="bg-brand-500 h-1.5 rounded-full" style="width: 95%"></div>
                                    </div>
                                    <p class="text-xs text-slate-500 leading-relaxed">
                                        Your specialized coursework in Quantum Computing exactly mirrors the requirements for the "Silicon Future" grant.
                                    </p>
                                </div>
                            </div>

                            <!-- Leadership Score -->
                            <div class="relative">
                                <div class="absolute -left-1 top-1 w-6 h-6 rounded-full bg-white border-4 border-green-500"></div>
                                <div class="ml-8">
                                    <div class="flex items-center justify-between mb-1">
                                        <h4 class="font-bold text-slate-900">Leadership Score</h4>
                                        <span class="text-xs font-bold text-green-600">Exceptional</span>
                                    </div>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                        <div class="bg-green-500 h-1.5 rounded-full" style="width: 100%"></div>
                                    </div>
                                    <p class="text-xs text-slate-500 leading-relaxed">
                                        President of "Students for Sustainable Tech" gives you a significant edge over 92% of other applicants.
                                    </p>
                                </div>
                            </div>

                            <!-- Needs Alignment -->
                            <div class="relative">
                                <div class="absolute -left-1 top-1 w-6 h-6 rounded-full bg-white border-4 border-orange-400"></div>
                                <div class="ml-8">
                                    <div class="flex items-center justify-between mb-1">
                                        <h4 class="font-bold text-slate-900">Needs Alignment</h4>
                                        <span class="text-xs font-bold text-orange-500">Balanced</span>
                                    </div>
                                    <div class="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                        <div class="bg-orange-400 h-1.5 rounded-full" style="width: 60%"></div>
                                    </div>
                                    <p class="text-xs text-slate-500 leading-relaxed">
                                        Financial criteria partially met. Your merit score compensates for the income-bracket variance.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 bg-brand-50 p-4 rounded-xl border border-brand-100">
                            <h5 class="text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">AI Pro Tip</h5>
                            <p class="text-sm text-slate-700 leading-relaxed font-medium">
                                "Focus your personal essay on the AI Governance project. It's the most high-impact keyword for your top matches."
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    </StudentLayout>
</template>
