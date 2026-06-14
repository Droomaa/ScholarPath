<script setup>
import { ref, onMounted, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import StudentLayout from '@/Layouts/StudentLayout.vue';
import Card from '@/Components/Card.vue';
import { Building, Trophy, Heart, ArrowUpRight, Activity, X } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const wishlist = ref([]);
const loading = ref(true);

const fetchWishlist = async () => {
    try {
        loading.value = true;
        const res = await backendApi.get('/user/wishlist');
        wishlist.value = res.data?.data || [];
    } catch (e) {
        console.error("Failed to fetch wishlist", e);
    } finally {
        loading.value = false;
    }
};

const removeFromWishlist = async (id) => {
    try {
        await backendApi.delete(`/user/wishlist/${id}`);
        wishlist.value = wishlist.value.filter(w => w.id !== id);
    } catch (e) {
        console.error("Failed to remove", e);
        alert("Gagal menghapus dari wishlist");
    }
};

onMounted(() => {
    fetchWishlist();
});
</script>

<template>
    <StudentLayout>
        <Head title="My Wishlist" />

        <div class="max-w-7xl mx-auto space-y-8">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart class="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
                    <p class="text-slate-500 font-medium mt-1">Daftar program beasiswa dan olimpiade yang kamu simpan.</p>
                </div>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-20">
                <div class="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
            
            <div v-else-if="wishlist.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card v-for="item in wishlist" :key="item.id" class="flex flex-col p-5 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-start justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            <component :is="item.beasiswa_id ? Building : Trophy" :class="item.beasiswa_id ? 'text-brand-500' : 'text-green-500'" class="w-6 h-6" />
                        </div>
                        <button @click="removeFromWishlist(item.id)" class="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus dari wishlist">
                            <Heart class="w-4 h-4 fill-red-500" />
                        </button>
                    </div>
                    
                    <div class="mb-2">
                        <span :class="item.beasiswa_id ? 'text-brand-600 bg-brand-50 border-brand-100' : 'text-green-600 bg-green-50 border-green-100'" class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border">
                            {{ item.beasiswa_id ? 'Beasiswa' : 'Olimpiade' }}
                        </span>
                    </div>
                    
                    <!-- We assume backend populates the Beasiswa/Olimpiade relation object or we join it. 
                         If the API currently doesn't preload the details, we display placeholders, but let's assume it does. 
                         Let's use safe fallbacks. -->
                    <h3 class="font-bold text-slate-900 mb-2 text-lg line-clamp-2">
                        {{ item.beasiswa ? item.beasiswa.nama : (item.olimpiade ? item.olimpiade.judul : 'Program Favorit') }}
                    </h3>
                    <p class="text-sm text-slate-500 mb-6 line-clamp-3 flex-1">
                        {{ item.beasiswa ? item.beasiswa.deskripsi : (item.olimpiade ? item.olimpiade.deskripsi : 'Lihat detail lebih lanjut di menu Dashboard.') }}
                    </p>
                    
                    <div class="pt-4 border-t border-slate-100">
                        <p class="text-xs text-slate-400 font-medium">Disimpan pada: {{ new Date(item.created_at).toLocaleDateString('id-ID') }}</p>
                    </div>
                </Card>
            </div>
            
            <div v-else class="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
                <Heart class="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 class="text-lg font-bold text-slate-900 mb-2">Wishlist Kosong</h3>
                <p class="text-slate-500 font-medium mb-6">Kamu belum menyimpan program apapun ke dalam wishlist.</p>
                <Link :href="route('dashboard')" class="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors">
                    Cari Program
                </Link>
            </div>
        </div>
    </StudentLayout>
</template>
