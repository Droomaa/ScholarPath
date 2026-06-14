<script setup>
import { ref, onMounted, computed } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import InstitutionLayout from '@/Layouts/InstitutionLayout.vue';
import Card from '@/Components/Card.vue';
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Mail, Briefcase, Calendar, Award } from '@lucide/vue';
import { backendApi } from '@/utils/api';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true
    }
});

const applicant = ref(null);
const loading = ref(true);
const files = ref([]);

const fetchApplicantDetails = async () => {
    try {
        const response = await backendApi.get(`/instansi/pendaftaran/${props.id}`);
        if (response.data && response.data.data) {
            applicant.value = response.data.data;
            
            // Parse file_berkas
            if (applicant.value.file_berkas) {
                try {
                    files.value = JSON.parse(applicant.value.file_berkas);
                } catch (e) {
                    // if not JSON, just put it as a single string item
                    files.value = [{ name: 'Submitted File', url: applicant.value.file_berkas }];
                }
            }
        }
    } catch (e) {
        console.error("Failed to fetch applicant details", e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchApplicantDetails();
});

const updateStatus = async (statusId) => {
    try {
        await backendApi.put(`/pendaftaran/${props.id}/status`, { status_id: statusId });
        await fetchApplicantDetails();
        alert('Status berhasil diupdate');
    } catch (e) {
        console.error("Failed to update status", e);
        alert('Gagal update status');
    }
};

const statusLabel = computed(() => {
    if (!applicant.value) return 'Unknown';
    if (applicant.value.status_id === 2) return 'Shortlisted';
    if (applicant.value.status_id === 3) return 'Rejected';
    return 'Reviewing';
});

const statusColor = computed(() => {
    if (!applicant.value) return 'bg-slate-100 text-slate-700';
    if (applicant.value.status_id === 2) return 'bg-green-100 text-green-700';
    if (applicant.value.status_id === 3) return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
});
</script>

<template>
    <InstitutionLayout>
        <Head title="Profil Pelamar" />

        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Back Button -->
            <Link :href="route('institution.applicants')" class="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors">
                <ArrowLeft class="w-4 h-4 mr-2" /> Kembali ke Manajemen Pelamar
            </Link>

            <div v-if="loading" class="flex justify-center p-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>

            <div v-else-if="!applicant" class="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 class="text-lg font-bold text-slate-900">Data Pelamar Tidak Ditemukan</h3>
                <p class="text-slate-500 mt-2">Pastikan ID pelamar valid atau telah dihapus.</p>
            </div>

            <template v-else>
                <!-- Profile Header Card -->
                <Card class="p-6 md:p-8">
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div class="flex items-center gap-6">
                            <img :src="'https://ui-avatars.com/api/?name=' + applicant.student_name + '&background=f1f5f9'" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                            <div>
                                <h1 class="text-2xl font-extrabold text-slate-900">{{ applicant.student_name }}</h1>
                                <p class="text-slate-500 mt-1 flex items-center gap-2">
                                    <Briefcase class="w-4 h-4" /> {{ applicant.keahlian || 'Belum diisi' }}
                                </p>
                                <div class="mt-3">
                                    <span :class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', statusColor]">
                                        {{ statusLabel }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-3 w-full md:w-auto">
                            <button @click="updateStatus(2)" class="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold shadow-md shadow-green-500/30 transition-colors">
                                <CheckCircle class="w-4 h-4 mr-2" /> Terima
                            </button>
                            <button @click="updateStatus(3)" class="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-colors">
                                <XCircle class="w-4 h-4 mr-2" /> Tolak
                            </button>
                        </div>
                    </div>
                </Card>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Left Column: Details -->
                    <div class="md:col-span-1 space-y-6">
                        <Card class="p-6">
                            <h3 class="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Informasi Kontak</h3>
                            <div class="space-y-4">
                                <div class="flex items-start gap-3 text-slate-600">
                                    <Mail class="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Email</p>
                                        <p class="text-sm font-medium">{{ applicant.student_email }}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3 text-slate-600">
                                    <User class="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">ID Siswa</p>
                                        <p class="text-sm font-medium">#{{ applicant.student_id }}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        
                        <Card class="p-6">
                            <h3 class="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Detail Program</h3>
                            <div class="space-y-4">
                                <div class="flex items-start gap-3 text-slate-600">
                                    <Award class="w-5 h-5 text-brand-400 mt-0.5" />
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Program Tujuan</p>
                                        <p class="text-sm font-bold text-brand-700">{{ applicant.program_title }}</p>
                                        <p class="text-xs text-slate-500">{{ applicant.program_type }}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3 text-slate-600">
                                    <Calendar class="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Tanggal Daftar</p>
                                        <p class="text-sm font-medium">{{ new Date(applicant.tanggal_daftar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <!-- Right Column: Documents -->
                    <div class="md:col-span-2 space-y-6">
                        <Card class="p-6">
                            <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                <FileText class="w-5 h-5 text-brand-600" /> Dokumen & Persyaratan
                            </h3>
                            
                            <div v-if="files.length === 0" class="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                <FileText class="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p class="text-sm font-bold text-slate-600">Tidak ada dokumen yang dilampirkan.</p>
                                <p class="text-xs text-slate-400 mt-1">Pelamar ini tidak mengunggah file tambahan.</p>
                            </div>

                            <ul v-else class="space-y-3">
                                <li v-for="(file, index) in files" :key="index" class="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors group">
                                    <div class="flex items-center gap-4">
                                        <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <FileText class="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-slate-700 group-hover:text-brand-700 transition-colors">{{ file.name || `Lampiran ${index + 1}` }}</p>
                                            <p class="text-xs text-slate-400 truncate max-w-[200px] md:max-w-xs">{{ typeof file === 'string' ? file : (file.url || 'URL tidak tersedia') }}</p>
                                        </div>
                                    </div>
                                    <a v-if="typeof file === 'string' ? file : file.url" :href="typeof file === 'string' ? file : file.url" target="_blank" class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                        Lihat
                                    </a>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </template>
        </div>
    </InstitutionLayout>
</template>
