<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head } from '@inertiajs/vue3';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import RegistrationModal from '@/Components/RegistrationModal.vue';

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
        console.error('AI search failed:', error);
        searchResults.value = [];
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
            <div v-if="messageToast" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/60 text-sm font-bold transition-all duration-300">
                <span class="h-5 w-5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                {{ messageToast }}
            </div>
        </transition>

        <div class="space-y-8 text-left">
            <!-- Header -->
            <div class="space-y-1">
                <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Search Insights</h1>
                <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan hasil pencarian pintar untuk kata kunci: <span class="text-indigo-600 dark:text-indigo-400 font-bold">"{{ query }}"</span>
                </p>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="n in 6" :key="n" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
                    <div class="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div class="h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div class="h-16 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="searchResults.length === 0" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
                <div class="h-16 w-16 mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-2xl">🔍</div>
                <h3 class="text-base font-extrabold text-slate-800 dark:text-slate-200">Tidak ada hasil ditemukan</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Kami tidak menemukan beasiswa atau kompetisi yang cocok dengan "{{ query }}". Silakan gunakan kata kunci lain (misalnya: Sains, Matematika, Koding, Beasiswa).
                </p>
            </div>

            <!-- Results Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="item in searchResults" :key="item.title" class="bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/10 hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between group">
                    <div class="space-y-3.5">
                        <div class="flex justify-between items-center">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase border border-indigo-100 dark:border-indigo-800/60">
                                {{ item.category }}
                            </span>
                            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                                {{ item.level || 'Umum' }}
                            </span>
                        </div>

                        <h3 class="text-base font-extrabold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition min-h-[40px] line-clamp-2">
                            {{ item.title }}
                        </h3>

                        <div class="flex flex-wrap gap-1.5">
                            <span class="px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                                {{ item.type }}
                            </span>
                            <span class="px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                                {{ item.scholarship_path }}
                            </span>
                        </div>

                        <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-semibold line-clamp-3">
                            {{ item.description }}
                        </p>
                    </div>

                    <div class="pt-5 border-t border-slate-50 dark:border-slate-700/50 mt-4 flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">AI Recommendation Match</span>
                        <button 
                            type="button" 
                            @click="selectedProgram = item" 
                            class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                            Detail <span>→</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Detail & Registration Modal -->
            <RegistrationModal
                :show="!!selectedProgram"
                :program="selectedProgram"
                @close="selectedProgram = null"
                @success="showToast('Pendaftaran berhasil! Berkas Anda sedang ditinjau.')"
            />
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
