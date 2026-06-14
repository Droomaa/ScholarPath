<script setup>
import { ref, computed } from 'vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { CheckCircle2, ChevronRight, BookOpen, GraduationCap, Sparkles, Target, Settings, BrainCircuit, Code, Palette, Microscope, Users } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const props = defineProps({
    auth: Object
});

const step = ref(1);

const form = ref({
    jenjang: '', // SMP / SMA
    jurusan: '',
    minat: [],
    keahlian_utama: ''
});

const submitting = ref(false);

const optionsMinat = [
    { id: 'stem', label: 'STEM (Science, Tech, Eng, Math)', icon: Microscope },
    { id: 'ai', label: 'Artificial Intelligence', icon: BrainCircuit, parent: 'stem' },
    { id: 'software', label: 'Software Development', icon: Code, parent: 'stem' },
    { id: 'mobile', label: 'Mobile Development', icon: Settings, parent: 'stem' },
    { id: 'science', label: 'Pure Science', icon: Sparkles },
    { id: 'socio', label: 'Sociology & Humanities', icon: Users },
    { id: 'arts', label: 'Arts & Design', icon: Palette }
];

const filteredMinat = computed(() => {
    // If STEM is selected, show its sub-categories too.
    if (form.value.minat.includes('stem')) {
        return optionsMinat;
    }
    return optionsMinat.filter(m => !m.parent);
});

const toggleMinat = (id) => {
    const index = form.value.minat.indexOf(id);
    if (index === -1) {
        form.value.minat.push(id);
    } else {
        form.value.minat.splice(index, 1);
        // If unchecking STEM, also uncheck its children
        if (id === 'stem') {
            form.value.minat = form.value.minat.filter(m => !['ai', 'software', 'mobile'].includes(m));
        }
    }
};

const keahlianList = ['Python', 'JavaScript', 'C++', 'Data Analysis', 'Public Speaking', 'Graphic Design', 'Biology', 'Physics', 'Robotics'];

const progress = computed(() => {
    let score = 0;
    if (form.value.jenjang) {
        score += 25;
        if (form.value.jenjang === 'SMA' && form.value.jurusan) score += 25;
        else if (form.value.jenjang === 'SMP') score += 25; // skip jurusan
    }
    if (form.value.minat.length >= 3) score += 25;
    if (form.value.keahlian_utama) score += 25;
    return score;
});

const submit = async () => {
    if (progress.value < 100) return;
    
    submitting.value = true;
    try {
        const payload = {
            jenjang_id: form.value.jenjang === 'SMP' ? 1 : 2, // Asumsi 1=SMP, 2=SMA
            keahlian: JSON.stringify({
                jurusan: form.value.jurusan,
                minat: form.value.minat,
                utama: form.value.keahlian_utama
            })
        };
        
        await backendApi.put('/user/profile', payload);
        
        // Use Inertia to reload the dashboard so the global state updates
        router.visit('/dashboard');
    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Terjadi kesalahan saat menyimpan profil.");
    } finally {
        submitting.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
        <Head title="Lengkapi Profil" />
        
        <!-- Background Decoration -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-200/40 blur-3xl"></div>
            <div class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl"></div>
        </div>

        <!-- Top Progress Bar -->
        <div class="fixed top-0 left-0 right-0 h-2 bg-slate-200 z-50">
            <div 
                class="h-full bg-brand-600 transition-all duration-700 ease-out"
                :style="`width: ${progress}%`"
            ></div>
        </div>

        <div class="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col justify-center relative z-10 my-10">
            
            <div class="text-center mb-10">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-brand-500/10 mb-6 border border-slate-100">
                    <Sparkles class="w-8 h-8 text-brand-600" />
                </div>
                <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Lengkapi Profilmu</h1>
                <p class="text-slate-500">Bantu kami merekomendasikan program terbaik yang sesuai dengan potensimu.</p>
            </div>

            <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div class="p-8 space-y-10">
                    
                    <!-- Section 1: Jenjang & Jurusan -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div class="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">1</div>
                            <h2 class="text-lg font-bold text-slate-800">Pendidikan Terakhir</h2>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <label class="cursor-pointer relative">
                                <input type="radio" v-model="form.jenjang" value="SMP" class="peer sr-only" />
                                <div class="p-4 rounded-xl border-2 transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50 border-slate-200 hover:border-brand-300">
                                    <div class="flex items-center justify-between">
                                        <span class="font-bold text-slate-700 peer-checked:text-brand-900">SMP / Sederajat</span>
                                        <CheckCircle2 v-if="form.jenjang === 'SMP'" class="w-5 h-5 text-brand-600" />
                                    </div>
                                </div>
                            </label>
                            <label class="cursor-pointer relative">
                                <input type="radio" v-model="form.jenjang" value="SMA" class="peer sr-only" />
                                <div class="p-4 rounded-xl border-2 transition-all peer-checked:border-brand-600 peer-checked:bg-brand-50 border-slate-200 hover:border-brand-300">
                                    <div class="flex items-center justify-between">
                                        <span class="font-bold text-slate-700 peer-checked:text-brand-900">SMA / SMK / Sederajat</span>
                                        <CheckCircle2 v-if="form.jenjang === 'SMA'" class="w-5 h-5 text-brand-600" />
                                    </div>
                                </div>
                            </label>
                        </div>

                        <!-- Conditional Jurusan -->
                        <div v-if="form.jenjang === 'SMA'" class="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label class="block text-sm font-bold text-slate-700 mb-2">Jurusan</label>
                            <select v-model="form.jurusan" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 transition-colors">
                                <option value="" disabled>Pilih Jurusan...</option>
                                <option value="IPA">IPA / Sains</option>
                                <option value="IPS">IPS / Sosial</option>
                                <option value="RPL">Rekayasa Perangkat Lunak (SMK)</option>
                                <option value="TKJ">Teknik Komputer & Jaringan (SMK)</option>
                                <option value="Multimedia">Multimedia / DKV (SMK)</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <!-- Section 2: Minat -->
                    <div class="space-y-6" :class="{'opacity-50 pointer-events-none': !form.jenjang}">
                        <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div class="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">2</div>
                            <h2 class="text-lg font-bold text-slate-800">Minat & Ketertarikan</h2>
                            <span class="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-lg ml-auto">Pilih min. 3</span>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label v-for="m in filteredMinat" :key="m.id" class="cursor-pointer">
                                <input type="checkbox" :value="m.id" :checked="form.minat.includes(m.id)" @change="toggleMinat(m.id)" class="peer sr-only" />
                                <div class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all border-slate-200 hover:border-brand-300 peer-checked:border-brand-600 peer-checked:bg-brand-50"
                                     :class="{'ml-6 bg-slate-50 border-dashed': m.parent}">
                                    <component :is="m.icon" class="w-5 h-5 text-slate-400 peer-checked:text-brand-600" />
                                    <span class="font-bold text-slate-700 text-sm peer-checked:text-brand-900">{{ m.label }}</span>
                                    <CheckCircle2 v-if="form.minat.includes(m.id)" class="w-4 h-4 text-brand-600 ml-auto" />
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Section 3: Keahlian Utama -->
                    <div class="space-y-6" :class="{'opacity-50 pointer-events-none': form.minat.length < 3}">
                        <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div class="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">3</div>
                            <h2 class="text-lg font-bold text-slate-800">Keahlian Utama</h2>
                        </div>
                        
                        <div>
                            <select v-model="form.keahlian_utama" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-0 transition-colors">
                                <option value="" disabled>Pilih 1 keahlian murni...</option>
                                <option v-for="k in keahlianList" :key="k" :value="k">{{ k }}</option>
                            </select>
                        </div>
                    </div>

                </div>
                
                <!-- Footer Action -->
                <div class="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div class="flex flex-col">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Progress</span>
                        <span class="text-2xl font-extrabold text-brand-600">{{ progress }}%</span>
                    </div>
                    <button 
                        @click="submit"
                        :disabled="progress < 100 || submitting"
                        class="px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2"
                        :class="progress === 100 ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25 hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed shadow-none'"
                    >
                        <span v-if="submitting">Menyimpan...</span>
                        <template v-else>
                            Simpan Profil <ChevronRight class="w-5 h-5" />
                        </template>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
