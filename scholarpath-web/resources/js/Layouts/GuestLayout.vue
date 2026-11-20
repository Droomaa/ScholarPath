<script setup>
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div
        class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5f7ff] via-[#eceeff] to-[#fbf7ff] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-4 py-12 font-sans selection:bg-purple-600 selection:text-white"
    >
        <!-- Background Glowing Orbs -->
        <div
            class="pointer-events-none absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-gradient-to-br from-indigo-300/40 to-purple-400/30 dark:from-indigo-950/20 dark:to-purple-950/25 blur-[100px]"
        ></div>
        <div
            class="pointer-events-none absolute -right-[10%] -bottom-[10%] h-[50vw] w-[50vw] rounded-full bg-gradient-to-tl from-purple-300/35 to-pink-400/20 dark:from-purple-950/20 dark:to-pink-950/15 blur-[120px]"
        ></div>

        <!-- Main Card Container -->
        <div class="relative z-10 w-full max-w-[450px]">
            <!-- Logo Section -->
            <div class="mb-8 text-center">
                <Link href="/" class="inline-block group focus:outline-none">
                    <span
                        class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent transition group-hover:opacity-90"
                    >
                        ScholarPath
                    </span>
                </Link>
                <p class="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                    Pintu Gerbang Masa Depan Akademikmu
                </p>
            </div>

            <!-- Card Shell -->
            <div
                class="overflow-hidden rounded-3xl border border-white/60 bg-white/75 dark:border-slate-800 dark:bg-slate-900/80 p-8 shadow-[0_20px_50px_rgba(99,102,241,0.1)] dark:shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-10 text-slate-800 dark:text-slate-100"
            >
                <slot />
            </div>

            <!-- Footer Copyright -->
            <div class="mt-8 text-center text-xs text-gray-400 dark:text-slate-600">
                <p>&copy; 2026 ScholarPath. All rights reserved.</p>
            </div>
        </div>
    </div>
</template>
