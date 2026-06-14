<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import axios from 'axios';
import { Activity } from '@lucide/vue';

const totalPrograms = ref(0);
const activeCompetitions = ref(0);
const verifiedStudents = ref(0);
const isLoading = ref(true);

const recentApplications = ref([]);
const currentTickerIndex = ref(0);
let tickerInterval = null;
let pollInterval = null;

const fetchStats = async () => {
    try {
        const [beasiswaRes, olimpiadeRes, pendaftaranRes] = await Promise.all([
            axios.get('http://localhost:8080/api/beasiswa').catch(() => ({ data: { data: [] } })),
            axios.get('http://localhost:8080/api/olimpiade').catch(() => ({ data: { data: [] } })),
            axios.get('http://localhost:8080/api/pendaftaran').catch(() => ({ data: { data: [] } }))
        ]);

        const beasiswa = beasiswaRes.data.data || [];
        const olimpiade = olimpiadeRes.data.data || [];
        const pendaftaran = pendaftaranRes.data.data || [];

        totalPrograms.value = beasiswa.length + olimpiade.length;

        const now = new Date();
        activeCompetitions.value = olimpiade.filter(item => {
            if (!item.tenggat_waktu) return true;
            return new Date(item.tenggat_waktu) >= now;
        }).length;

        // Count successful applications or default to total
        verifiedStudents.value = pendaftaran.filter(item => item.status === 'Lulus' || item.status === 'Diterima').length || pendaftaran.length || 0;

        // Update ticker data
        if (pendaftaran.length > 0) {
            const sorted = [...pendaftaran].sort((a, b) => b.id - a.id);
            recentApplications.value = sorted.slice(0, 5);
        }

    } catch (error) {
        console.error("Failed to fetch stats", error);
    }
};

onMounted(async () => {
    await fetchStats();
    isLoading.value = false;

    // Ticker animation
    tickerInterval = setInterval(() => {
        if (recentApplications.value.length > 0) {
            currentTickerIndex.value = (currentTickerIndex.value + 1) % recentApplications.value.length;
        }
    }, 4000);

    // Polling every 15s
    pollInterval = setInterval(fetchStats, 15000);
});

onUnmounted(() => {
    if (tickerInterval) clearInterval(tickerInterval);
    if (pollInterval) clearInterval(pollInterval);
});

const currentApplication = computed(() => {
    if (recentApplications.value.length === 0) return null;
    return recentApplications.value[currentTickerIndex.value];
});
</script>

<template>
    <div class="bg-zinc-950 rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col gap-8 w-full border border-zinc-800">
        <!-- Abstract Glow -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div v-if="isLoading" class="flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4 text-center relative z-10 animate-pulse w-full">
            <!-- Loading Skeletons -->
            <div class="flex-1 flex flex-col items-center justify-center w-full">
                <div class="w-32 h-16 bg-zinc-800 rounded-2xl mb-4"></div>
                <div class="w-24 h-4 bg-zinc-800 rounded mb-2"></div>
            </div>
            
            <div class="hidden md:block w-px h-16 bg-zinc-800 shrink-0"></div>
            <div class="w-full h-px bg-zinc-800/50 md:hidden"></div>
            
            <div class="flex-1 flex flex-col items-center justify-center w-full">
                <div class="w-32 h-16 bg-zinc-800 rounded-2xl mb-4"></div>
                <div class="w-24 h-4 bg-zinc-800 rounded mb-2"></div>
            </div>
            
            <div class="hidden md:block w-px h-16 bg-zinc-800 shrink-0"></div>
            <div class="w-full h-px bg-zinc-800/50 md:hidden"></div>
            
            <div class="flex-1 flex flex-col items-center justify-center w-full">
                <div class="w-32 h-16 bg-zinc-800 rounded-2xl mb-4"></div>
                <div class="w-24 h-4 bg-zinc-800 rounded mb-2"></div>
            </div>
        </div>

        <div v-else class="flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4 text-center relative z-10 w-full">
            <!-- Total Programs -->
            <div class="flex-1 flex flex-col items-center justify-center w-full group transition-all duration-300 hover:scale-105">
                <h3 class="text-6xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight transition-all duration-300 group-hover:text-brand-300">
                    {{ totalPrograms }}<span class="text-brand-400 ml-1">+</span>
                </h3>
                <p class="text-zinc-400 font-bold tracking-widest text-xs uppercase">Total Programs</p>
            </div>
            
            <!-- Divider -->
            <div class="hidden md:block w-px h-16 bg-zinc-800 shrink-0"></div>
            <!-- Mobile Divider -->
            <div class="w-full h-px bg-zinc-800/30 md:hidden my-4"></div>
            
            <!-- Kompetisi Aktif -->
            <div class="flex-1 flex flex-col items-center justify-center w-full group transition-all duration-300 hover:scale-105">
                <h3 class="text-6xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight transition-all duration-300 group-hover:text-green-300">
                    {{ activeCompetitions }}<span class="text-green-400 ml-1">+</span>
                </h3>
                <p class="text-zinc-400 font-bold tracking-widest text-xs uppercase">Kompetisi Aktif</p>
            </div>
            
            <!-- Divider -->
            <div class="hidden md:block w-px h-16 bg-zinc-800 shrink-0"></div>
            <!-- Mobile Divider -->
            <div class="w-full h-px bg-zinc-800/30 md:hidden my-4"></div>
            
            <!-- Siswa Berprestasi -->
            <div class="flex-1 flex flex-col items-center justify-center w-full group transition-all duration-300 hover:scale-105">
                <h3 class="text-6xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight transition-all duration-300 group-hover:text-blue-300">
                    {{ verifiedStudents }}<span class="text-blue-400 ml-1">+</span>
                </h3>
                <p class="text-zinc-400 font-bold tracking-widest text-xs uppercase">Siswa Berprestasi</p>
            </div>
        </div>

        <!-- Real-time Tracker -->
        <div class="mt-4 pt-6 border-t border-zinc-800/50 relative z-10">
            <div class="flex items-center justify-center gap-4 bg-zinc-900/50 p-4 rounded-2xl backdrop-blur-sm border border-zinc-800/50">
                <div class="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <Activity class="w-5 h-5 animate-pulse" />
                </div>
                <div class="overflow-hidden h-6 relative flex-1 max-w-2xl text-left">
                    <Transition name="slide-up" mode="out-in">
                        <p :key="currentTickerIndex" class="text-sm text-zinc-300 font-medium truncate w-full absolute inset-0 flex items-center gap-2">
                            <span v-if="currentApplication">
                                Siswa ID #{{ currentApplication.siswa_id || currentApplication.id }} baru saja mendaftar di Program <span class="text-brand-400 font-bold">{{ currentApplication.program_type === 'beasiswa' ? 'Beasiswa' : 'Olimpiade' }} #{{ currentApplication.program_id }}</span>...
                                <span class="text-zinc-500 text-xs ml-2 hidden sm:inline-block">Beberapa saat yang lalu</span>
                            </span>
                            <span v-else>
                                Mendengarkan data pendaftaran terbaru...
                            </span>
                        </p>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from {
    transform: translateY(100%);
    opacity: 0;
}
.slide-up-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>
