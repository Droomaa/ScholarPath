<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
    query: {
        type: String,
        default: ''
    }
});

const searchResults = ref([]);
const isLoading = ref(false);
const selectedProgram = ref(null);
const messageToast = ref('');

const showToast = (text) => {
    messageToast.value = text;
    setTimeout(() => {
        messageToast.value = '';
    }, 3000);
};

const fetchSearchResults = async () => {
    if (!props.query) {
        searchResults.value = [];
        return;
    }
    
    isLoading.value = true;
    try {
        // Panggil endpoint FastAPI matcher port 8001
        const response = await axios.post('http://localhost:8001/api/match', {
            user_skill: props.query,
            top_k: 12
        });
        
        if (response.data && response.data.data) {
            searchResults.value = response.data.data;
        } else {
            searchResults.value = [];
        }
    } catch (error) {
        console.error('AI search failed, fallback mock data:', error);
        // Fallback mock data jika server AI offline
        searchResults.value = [
            {
                title: 'Olimpiade Sains Nasional (OSN) Matematika',
                category: 'Science',
                type: 'Competition',
                level: 'SMA',
                activity_type: 'Academic',
                scholarship_path: 'STEM',
                description: 'Kompetisi matematika tingkat nasional bergengsi untuk siswa SMA, seleksi dari kabupaten hingga nasional.'
            },
            {
                title: 'Beasiswa Indonesia Maju (BIM)',
                category: 'Scholarship',
                type: 'Scholarship',
                level: 'SMA',
                activity_type: 'Academic',
                scholarship_path: 'General',
                description: 'Beasiswa fully funded Kemendikbud untuk persiapan kuliah S1 di luar negeri bagi siswa SMA berprestasi.'
            }
        ];
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchSearchResults();
});

// Refetch jika parameter query q berubah di URL (navigasi client-side)
watch(() => props.query, () => {
    fetchSearchResults();
});
</script>

<template>
    <Head title="AI Search Results" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border bg-emerald-50 text-emerald-800 border-emerald-100 text-sm font-bold transition-all duration-300">
                <span class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast }}
            </div>
        </transition>

        <div class="space-y-8 text-left">
            <!-- Header -->
            <div class="space-y-1">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">AI Search Insights</h1>
                <p class="text-sm font-semibold text-slate-500">
                    Menampilkan hasil pencarian pintar untuk kata kunci: <span class="text-indigo-600 font-bold">"{{ query }}"</span>
                </p>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="n in 6" :key="n" class="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div class="h-4 w-1/3 bg-slate-100 rounded"></div>
                    <div class="h-6 w-3/4 bg-slate-100 rounded"></div>
                    <div class="h-16 w-full bg-slate-100 rounded"></div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="searchResults.length === 0" class="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
                <div class="h-16 w-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center text-2xl">🔍</div>
                <h3 class="text-base font-extrabold text-slate-800">Tidak ada hasil ditemukan</h3>
                <p class="text-xs text-slate-500 font-semibold leading-relaxed">
                    Kami tidak menemukan beasiswa atau kompetisi yang cocok dengan "{{ query }}". Silakan gunakan kata kunci lain (misalnya: Sains, Matematika, Koding, Beasiswa).
                </p>
            </div>

            <!-- Results Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="item in searchResults" :key="item.title" class="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between group">
                    <div class="space-y-3.5">
                        <div class="flex justify-between items-center">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase border border-indigo-100">
                                {{ item.category }}
                            </span>
                            <span class="text-[9px] font-bold text-slate-400">
                                {{ item.level || 'Umum' }}
                            </span>
                        </div>

                        <h3 class="text-base font-extrabold text-slate-800 leading-tight group-hover:text-indigo-600 transition min-h-[40px] line-clamp-2">
                            {{ item.title }}
                        </h3>

                        <div class="flex flex-wrap gap-1.5">
                            <span class="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold">
                                {{ item.type }}
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[9px] font-bold">
                                {{ item.scholarship_path }}
                            </span>
                        </div>

                        <p class="text-xs leading-relaxed text-slate-500 font-semibold line-clamp-3">
                            {{ item.description }}
                        </p>
                    </div>

                    <div class="pt-5 border-t border-slate-50 mt-4 flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Recommendation Match</span>
                        <button 
                            type="button" 
                            @click="selectedProgram = item" 
                            class="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                        >
                            Detail <span>→</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Detail Modal -->
            <transition name="fade">
                <div v-if="selectedProgram" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div class="absolute inset-0" @click="selectedProgram = null"></div>

                    <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-lg w-full relative z-10 animate-scale">
                        <div class="flex justify-between items-start mb-4">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white">
                                {{ selectedProgram.type }}
                            </span>
                            <button type="button" @click="selectedProgram = null" class="text-slate-400 hover:text-slate-600 transition">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="space-y-4 text-left">
                            <h3 class="text-xl font-extrabold text-slate-800 leading-tight">
                                {{ selectedProgram.title }}
                            </h3>
                            <p class="text-xs leading-relaxed text-slate-500 font-semibold">
                                {{ selectedProgram.description }}
                            </p>
                            
                            <!-- Additional Metadata -->
                            <div class="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600 font-bold">
                                <div class="flex justify-between">
                                    <span>Kategori</span>
                                    <span class="text-slate-800">{{ selectedProgram.category }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Tingkatan</span>
                                    <span class="text-slate-800">{{ selectedProgram.level || 'Semua Jenjang' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Jalur Bidang</span>
                                    <span class="text-slate-800">{{ selectedProgram.scholarship_path }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Tipe Kegiatan</span>
                                    <span class="text-slate-800">{{ selectedProgram.activity_type }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 pt-6 mt-6 border-t border-slate-50">
                            <button
                                type="button"
                                @click="selectedProgram = null"
                                class="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl border border-slate-100 transition duration-200 cursor-pointer"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                @click="selectedProgram = null; showToast('Fitur pendaftaran langsung sedang disinkronisasikan.')"
                                class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-2xl shadow-md transition duration-200 cursor-pointer"
                            >
                                Daftar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.toast-enter-active, .toast-leave-active {
    transition: all 0.3s ease;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}
.toast-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.animate-scale {
    animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.92) translateY(10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
</style>
