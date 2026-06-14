<script setup>
import { ref, onMounted } from 'vue';
import { Sun, Moon } from '@lucide/vue';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';

const page = usePage();
const isDark = ref(false);

onMounted(() => {
    // Determine initial theme from Inertia props
    const userTheme = page.props.auth?.theme || 'light';
    if (userTheme === 'dark') {
        isDark.value = true;
        document.documentElement.classList.add('dark');
    } else {
        isDark.value = false;
        document.documentElement.classList.remove('dark');
    }
});

const toggleTheme = async () => {
    isDark.value = !isDark.value;
    
    if (isDark.value) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    try {
        await axios.post('/api/theme-preferences', {
            theme: isDark.value ? 'dark' : 'light'
        });
    } catch (e) {
        console.error('Failed to save theme preference', e);
    }
};
</script>

<template>
    <button 
        @click="toggleTheme" 
        class="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
        <Moon v-if="!isDark" class="w-5 h-5" />
        <Sun v-else class="w-5 h-5" />
    </button>
</template>
