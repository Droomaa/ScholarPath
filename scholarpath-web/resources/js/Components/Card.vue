<script setup>
defineProps({
    title: String,
    glass: {
        type: Boolean,
        default: false,
    }
});
</script>

<template>
    <div :class="[glass ? 'glass dark:bg-navy-900/50' : 'bg-white dark:bg-navy-900 shadow-lg border border-slate-100 dark:border-navy-800', 'rounded-2xl overflow-hidden transition-colors duration-300']">
        <div v-if="title || $slots.header" class="px-6 py-4 border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-800/50 flex items-center justify-between">
            <h3 v-if="title" class="text-lg font-bold text-slate-800 dark:text-white">{{ title }}</h3>
            <slot name="header"></slot>
        </div>
        <div class="p-6">
            <slot />
        </div>
        <div v-if="$slots.footer" class="px-6 py-4 bg-slate-50 dark:bg-navy-800/50 border-t border-slate-100 dark:border-navy-800">
            <slot name="footer" />
        </div>
    </div>
</template>
