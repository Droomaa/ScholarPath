<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { onMounted, ref } from 'vue';

defineProps({
    canLogin: {
        type: Boolean,
    },
    canRegister: {
        type: Boolean,
    },
});

const progress = ref(0);
const visibleSections = ref({
    hero: false,
    stats: false,
    why: false,
    vision: false,
    cta: false
});

const isDarkMode = ref(false);

const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

onMounted(() => {
    // Determine initial theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDarkMode.value = true;
    }

    // Animasi progress bar untuk tracker real-time
    setTimeout(() => {
        progress.value = 78;
    }, 500);

    // Intersection Observer for scroll reveal effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target.getAttribute('data-section');
                if (section) {
                    visibleSections.value[section] = true;
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-section]').forEach(el => {
        observer.observe(el);
    });
});
</script>

<template>
    <Head title="Wujudkan Mimpi Akademikmu" />

    <div class="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#fcfdff] to-[#ffffff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white overflow-x-hidden transition-colors duration-300">
        
        <!-- Header / Navbar -->
        <header class="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-100/80 dark:border-slate-800/80 transition-all duration-300">
            <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                <!-- Logo -->
                <div class="flex items-center gap-3">
                    <Link href="/" class="flex items-center group">
                        <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent transition group-hover:opacity-90">
                            ScholarPath
                        </span>
                    </Link>
                </div>

                <!-- Navigation Links -->
                <nav class="hidden md:flex items-center gap-8">
                    <a href="#why-scholarpath" class="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Beasiswa</a>
                    <a href="#why-scholarpath" class="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Mentorship</a>
                    <a href="#visi" class="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">Visi Kami</a>
                </nav>

                <!-- Auth & Theme Buttons -->
                <div class="flex items-center gap-4">
                    <!-- Dark Mode Toggle -->
                    <button 
                        @click="toggleTheme" 
                        class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                        aria-label="Toggle Dark Mode"
                    >
                        <svg v-if="!isDarkMode" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>

                    <template v-if="$page.props.auth.user">
                        <Link
                            :href="route('dashboard')"
                            class="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                            Dashboard
                        </Link>
                    </template>
                    <template v-else>
                        <Link
                            :href="route('login')"
                            class="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                            Log in
                        </Link>

                        <Link
                            :href="route('register')"
                            class="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-2xl shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 transition duration-200"
                        >
                            Get Started
                        </Link>
                    </template>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <section 
            data-section="hero" 
            class="relative pt-12 pb-20 md:py-24 transition-all duration-1000 transform"
            :class="visibleSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
            <!-- Background Orbs -->
            <div class="absolute -top-[10%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none"></div>
            <div class="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-200/25 blur-[120px] pointer-events-none"></div>

            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
                
                <!-- Hero Left Column -->
                <div class="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <!-- Platform Badge -->
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-900/20 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                        <span class="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                        AI-Powered Platform
                    </div>

                    <!-- Heading -->
                    <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        Wujudkan Mimpi Akademikmu dengan 
                        <span class="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">ScholarPath</span>
                    </h1>

                    <!-- Subheading -->
                    <p class="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                        Temukan beasiswa, kompetisi, dan program mentorship terbaik yang dipersonalisasi khusus untuk siswa SMP & SMA melalui teknologi AI tercanggih.
                    </p>

                    <!-- CTAs -->
                    <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                        <Link
                            :href="$page.props.auth.user ? route('dashboard') : route('register')"
                            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 hover:-translate-y-[1px] active:translate-y-0 transition duration-200"
                        >
                            Mulai Jelajah
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <a
                            href="#why-scholarpath"
                            class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-200"
                        >
                            Lihat Panduan
                        </a>
                    </div>

                    <!-- Trust / Badge Preview -->
                    <div class="pt-6 flex justify-center lg:justify-start">
                        <div class="inline-flex items-center gap-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-800/50 px-4 py-3 shadow-sm shadow-emerald-500/5">
                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="text-sm font-bold text-emerald-800 dark:text-emerald-400">95% Kecocokan</p>
                                <p class="text-xs font-semibold text-emerald-600/80 dark:text-emerald-500/80">Rekomendasi kecocokan AI beasiswa</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hero Right Column -->
                <div class="lg:col-span-6 flex justify-center items-center relative">
                    <!-- Overlay decorative card -->
                    <div class="absolute -right-4 top-10 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-50/80 p-4 shadow-xl flex items-center gap-3 animate-bounce" style="animation-duration: 4s;">
                        <span class="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">✨</span>
                        <div class="text-left">
                            <p class="text-xs font-bold text-slate-800">Beasiswa Terverifikasi</p>
                            <p class="text-[10px] font-semibold text-slate-500">Oleh 200+ Lembaga</p>
                        </div>
                    </div>

                    <!-- Screen Frame Mockup -->
                    <div class="w-full max-w-[500px] rounded-3xl bg-slate-900/5 p-2.5 ring-1 ring-slate-900/10 shadow-2xl">
                        <div class="overflow-hidden rounded-[22px] bg-white border border-slate-200/50">
                            <img
                                src="/images/hero_student.png"
                                alt="Siswa Belajar Bersama"
                                class="w-full object-cover aspect-[4/3] hover:scale-102 transition duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats Section -->
        <section 
            data-section="stats" 
            class="max-w-7xl mx-auto px-6 mb-20 md:mb-28 transition-all duration-1000 transform"
            :class="visibleSections.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
            <div class="rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-8 md:p-14 flex flex-col md:flex-row justify-around items-center gap-8 md:gap-4 shadow-2xl dark:border dark:border-slate-800/50 relative overflow-hidden">
                <!-- Background visual -->
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#312e81,transparent_45%)] opacity-40"></div>
                
                <div class="text-center space-y-1 relative z-10">
                    <p class="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">2.5k+</p>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Beasiswa</p>
                </div>
                <div class="hidden md:block h-12 w-[1px] bg-slate-800"></div>
                <div class="text-center space-y-1 relative z-10">
                    <p class="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">1.2k+</p>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Kompetisi Aktif</p>
                </div>
                <div class="hidden md:block h-12 w-[1px] bg-slate-800"></div>
                <div class="text-center space-y-1 relative z-10">
                    <p class="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">50k+</p>
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Siswa Terbantu</p>
                </div>
            </div>
        </section>

        <!-- Why ScholarPath Section -->
        <section 
            id="why-scholarpath" 
            data-section="why" 
            class="max-w-7xl mx-auto px-6 mb-20 md:mb-28 text-center space-y-12 transition-all duration-1000 transform"
            :class="visibleSections.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
            <div class="space-y-3">
                <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Mengapa ScholarPath?</h2>
                <p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium">Fitur unggulan yang dirancang untuk mendukung pilihan akademismu.</p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
                
                <!-- Card 1: AI Recommendations (Wide) -->
                <div class="md:col-span-8 group rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/10 transition duration-300 flex flex-col md:flex-row justify-between gap-6 overflow-hidden relative">
                    <div class="space-y-4 max-w-sm">
                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">AI Recommendations</h3>
                        <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                            Algoritma cerdas kami menganalisis data profilmu untuk memberikan rekomendasi beasiswa yang paling pas dengan minat dan keahlianmu.
                        </p>
                        <Link :href="$page.props.auth.user ? route('dashboard') : route('register')" class="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pt-2 group-hover:translate-x-1 transition duration-200">
                            Coba AI Sekarang
                            <span>→</span>
                        </Link>
                    </div>
                    <!-- Visual decoration representation of nodes -->
                    <div class="w-full md:w-1/2 flex items-center justify-center h-48 bg-gradient-to-tr from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl relative overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                        <div class="absolute inset-0 flex items-center justify-center opacity-60">
                            <!-- Vector visual representing AI nodes -->
                            <svg class="w-full h-full p-4" viewBox="0 0 200 100" fill="none">
                                <circle cx="50" cy="50" r="4" fill="#6366f1" />
                                <circle cx="100" cy="30" r="6" fill="#818cf8" />
                                <circle cx="100" cy="70" r="5" fill="#a78bfa" />
                                <circle cx="150" cy="50" r="4" fill="#c084fc" />
                                <line x1="50" y1="50" x2="100" y2="30" stroke="#e0e7ff" stroke-width="1.5" />
                                <line x1="50" y1="50" x2="100" y2="70" stroke="#e0e7ff" stroke-width="1.5" />
                                <line x1="100" y1="30" x2="150" y2="50" stroke="#e0e7ff" stroke-width="1.5" />
                                <line x1="100" y1="70" x2="150" y2="50" stroke="#e0e7ff" stroke-width="1.5" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Card 2: Verified Institutions (Tall) -->
                <div class="md:col-span-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md dark:hover:shadow-emerald-900/10 transition duration-300 space-y-6 flex flex-col justify-between">
                    <div class="space-y-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Verified Institutions</h3>
                        <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                            Kami bermitra erat dengan 200+ universitas dan lembaga donor terpercaya untuk memastikan setiap data beasiswa valid dan terjamin.
                        </p>
                    </div>
                    <!-- Icon graphic -->
                    <div class="bg-emerald-50/50 dark:bg-emerald-900/20 rounded-2xl p-6 text-center border border-emerald-100/50 dark:border-emerald-800/30">
                        <span class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/40 font-bold text-2xl">✓</span>
                    </div>
                </div>

                <!-- Card 3: Easy Application (Small) -->
                <div class="md:col-span-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md dark:hover:shadow-purple-900/10 transition duration-300 space-y-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Easy Application</h3>
                    <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                        Kirim berkas pendaftaran langsung melalui platform satu pintu kami yang mudah, hemat waktu, dan efisien.
                    </p>
                </div>

                <!-- Card 4: Real-time Tracker (Wide blue) -->
                <div class="md:col-span-8 rounded-3xl bg-indigo-600 text-white p-8 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#818cf8,transparent_55%)] opacity-55"></div>
                    
                    <div class="space-y-3 relative z-10 max-w-md">
                        <h3 class="text-xl font-bold">Real-time Tracker</h3>
                        <p class="text-sm text-indigo-100/90 leading-relaxed font-medium">
                            Pantau kemajuan berkas pendaftaran beasiswa dan status verifikasi dari institusi secara berkala.
                        </p>
                    </div>

                    <!-- Animated loading mockup -->
                    <div class="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-5 relative z-10 max-w-md space-y-3">
                        <div class="flex justify-between items-center text-xs font-bold text-indigo-50">
                            <span>Verifikasi Berkas Calon Penerima Beasiswa</span>
                            <span>{{ progress }}%</span>
                        </div>
                        <div class="w-full bg-indigo-900/40 rounded-full h-3 overflow-hidden p-0.5 border border-indigo-950/20">
                            <div
                                class="bg-gradient-to-r from-emerald-400 to-green-400 h-full rounded-full transition-all duration-1000 ease-out"
                                :style="{ width: progress + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Vision Section -->
        <section 
            id="visi" 
            data-section="vision" 
            class="bg-slate-50 dark:bg-slate-900/50 py-20 md:py-28 transition-all duration-1000 transform"
            :class="visibleSections.vision ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                <!-- Left Column -->
                <div class="lg:col-span-6 space-y-6">
                    <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Visi Kami untuk Siswa Indonesia
                    </h2>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        ScholarPath didirikan untuk memberikan akses informasi beasiswa yang setara bagi seluruh siswa di Indonesia. Dari Sabang sampai Merauke, semua berhak meraih pendidikan terbaik tanpa terkendala biaya.
                    </p>

                    <!-- List of items -->
                    <ul class="space-y-4 pt-2">
                        <li class="flex items-start gap-3">
                            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold">✓</span>
                            <div>
                                <h4 class="font-bold text-slate-900 dark:text-white">Edu-equality: Akses Info Setara</h4>
                                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Setiap informasi dipublikasikan terbuka secara adil.</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3">
                            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold">✓</span>
                            <div>
                                <h4 class="font-bold text-slate-900 dark:text-white">Smart Matching: Pencocokan AI</h4>
                                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Meminimalkan kesalahan pemilihan beasiswa dengan algoritma.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Right Column (College of overlap images) -->
                <div class="lg:col-span-6 flex items-center justify-center relative h-[380px] sm:h-[450px]">
                    <!-- Portrait Student -->
                    <div class="absolute left-6 bottom-4 w-1/2 max-w-[220px] rounded-3xl overflow-hidden shadow-2xl border border-white/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-2 z-20 hover:-translate-y-1 transition duration-300">
                        <img
                            src="/images/student_portrait.png"
                            alt="Student Portrait"
                            class="rounded-2xl object-cover w-full aspect-[3/4]"
                        />
                    </div>
                    <!-- Indonesian Students Group -->
                    <div class="absolute right-6 top-4 w-[60%] max-w-[280px] rounded-3xl overflow-hidden shadow-2xl border border-white/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-2 z-10 hover:-translate-y-1 transition duration-300">
                        <img
                            src="/images/indonesian_students.png"
                            alt="Indonesian Students"
                            class="rounded-2xl object-cover w-full aspect-[4/3]"
                        />
                    </div>
                </div>
            </div>
        </section>

        <!-- Mentorship CTA Banner -->
        <section 
            id="mentorship" 
            data-section="cta" 
            class="max-w-7xl mx-auto px-6 py-20 transition-all duration-1000 transform"
            :class="visibleSections.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'"
        >
            <div class="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 md:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <!-- Background visual -->
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.25),transparent_60%)]"></div>

                <div class="max-w-2xl mx-auto space-y-4 relative z-10">
                    <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight">Siap Wujudkan Prestasi Akademikmu?</h2>
                    <p class="text-indigo-200/90 text-sm md:text-base font-medium">
                        Daftar akun hari ini dan dapatkan analisis rekomendasi program beasiswa AI secara instan.
                    </p>
                    <div class="pt-4 flex justify-center">
                        <Link
                            :href="$page.props.auth.user ? route('dashboard') : route('register')"
                            class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-950 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 hover:-translate-y-[1px] active:translate-y-0 transition duration-200"
                        >
                            Daftar Sekarang
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
                
                <!-- Column 1: Info -->
                <div class="md:col-span-4 space-y-4 text-left">
                    <span class="text-xl font-extrabold text-white">ScholarPath</span>
                    <p class="text-sm text-slate-500 leading-relaxed font-medium">
                        Platform no.1 di Indonesia untuk rekomendasi beasiswa dan kompetisi akademik berbasis AI.
                    </p>
                    <!-- Social icons -->
                    <div class="flex items-center gap-4 text-slate-500 pt-2">
                        <a href="#" class="hover:text-white transition">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                        </a>
                        <a href="#" class="hover:text-white transition">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                        <a href="#" class="hover:text-white transition">
                            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    </div>
                </div>

                <!-- Column 2: Links -->
                <div class="md:col-span-2 space-y-4 text-left">
                    <span class="text-xs font-bold uppercase tracking-wider text-white">Links</span>
                    <ul class="space-y-2 text-sm font-medium">
                        <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
                        <li><a href="#" class="hover:text-white transition">Help Center</a></li>
                        <li><a href="#" class="hover:text-white transition">Contact Us</a></li>
                    </ul>
                </div>

                <!-- Column 3: Scholarship -->
                <div class="md:col-span-3 space-y-4 text-left">
                    <span class="text-xs font-bold uppercase tracking-wider text-white">Beasiswa</span>
                    <ul class="space-y-2 text-sm font-medium">
                        <li><Link :href="$page.props.auth.user ? route('dashboard') : route('register')" class="hover:text-white transition">Beasiswa Dalam Negeri</Link></li>
                        <li><Link :href="$page.props.auth.user ? route('dashboard') : route('register')" class="hover:text-white transition">Beasiswa Internasional</Link></li>
                        <li><Link :href="$page.props.auth.user ? route('dashboard') : route('register')" class="hover:text-white transition">Program Beasiswa Sarjana</Link></li>
                        <li><Link :href="$page.props.auth.user ? route('dashboard') : route('register')" class="hover:text-white transition">Tips & Trik Lulus Beasiswa</Link></li>
                    </ul>
                </div>

                <!-- Column 4: Newsletter -->
                <div class="md:col-span-3 space-y-4 text-left">
                    <span class="text-xs font-bold uppercase tracking-wider text-white">Newsletter</span>
                    <p class="text-xs text-slate-500 font-medium">
                        Dapatkan info beasiswa terbaru langsung di emailmu setiap minggu.
                    </p>
                    <form @submit.prevent class="flex gap-2">
                        <input
                            type="email"
                            placeholder="Email Anda"
                            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                        />
                        <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition">
                            Kirim
                        </button>
                    </form>
                </div>
            </div>

            <div class="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">
                <p>&copy; 2026 ScholarPath. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
/* Scroll Reveal Animation Styling */
[data-section] {
    will-change: transform, opacity;
}
</style>
