<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    program: {
        type: Object,
        default: null
    },
    isEditMode: {
        type: Boolean,
        default: false
    },
    existingRegistration: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['close', 'success', 'wishlist']);

// State
const currentStep = ref(1);
const isLoading = ref(false);
const errorMsg = ref('');
const jenjangs = ref([]);
const userProfile = ref({
    name: '',
    email: '',
    jenjang_id: null,
    asal_sekolah: ''
});

const isDeadlineClose = computed(() => {
    // Use existingRegistration deadline if in edit mode and program is minimal
    const deadline = props.program?.deadline || props.existingRegistration?.deadline;
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    if (now >= deadlineDate) return true;
    const diffTime = deadlineDate - now;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 5;
});

// Files Form
const formFiles = ref({
    resume: null,
    report_card: null,
    proposal: null,
    recommendation: null,
    alasan: ''
});

// Resets state when modal opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        currentStep.value = 1;
        errorMsg.value = '';
        
        if (props.isEditMode && props.existingRegistration) {
            formFiles.value = {
                resume: props.existingRegistration.resume_url ? { name: 'Resume_Uploaded.pdf', isUrl: true } : null,
                report_card: props.existingRegistration.report_card_url ? { name: 'ReportCard_Uploaded.pdf', isUrl: true } : null,
                proposal: props.existingRegistration.proposal_url ? { name: 'Proposal_Uploaded.pdf', isUrl: true } : null,
                recommendation: props.existingRegistration.recommendation_url ? { name: 'Recommendation_Uploaded.pdf', isUrl: true } : null,
                alasan: props.existingRegistration.alasan || ''
            };
        } else {
            formFiles.value = {
                resume: null,
                report_card: null,
                proposal: null,
                recommendation: null,
                alasan: ''
            };
        }
        fetchProfileAndJenjang();
    }
});

const getAuthToken = () => localStorage.getItem('auth_token');
const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';

const fetchProfileAndJenjang = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const resProfile = await axios.get(`${backendUrl}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => {
            console.error("Profile fetch error", e);
            return null;
        });

        if (resProfile && resProfile.data && resProfile.data.data) {
            userProfile.value.name = resProfile.data.data.name || '';
            userProfile.value.email = resProfile.data.data.email || '';
            userProfile.value.jenjang_id = resProfile.data.data.jenjang_id || null;
            userProfile.value.asal_sekolah = localStorage.getItem('user_institution') || '';
        }

        const resJenjang = await axios.get(`${backendUrl}/jenjang`, { headers: { Authorization: `Bearer ${token}` } }).catch(e => {
            console.error("Jenjang fetch error", e);
            return null;
        });
        
        if (resJenjang && resJenjang.data && resJenjang.data.data) {
            const allJenjangs = resJenjang.data.data;
            jenjangs.value = allJenjangs.filter(j => 
                j.nama.toLowerCase().includes('smp') || 
                j.nama.toLowerCase().includes('sma') ||
                j.nama.toLowerCase().includes('sederajat')
            );
        }
    } catch (e) {
        console.error("Failed to fetch profile data:", e);
    }
};

const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        formFiles.value[field] = file;
    } else {
        alert("Harap unggah file dalam format PDF.");
        e.target.value = '';
    }
};

const removeFile = (field) => {
    formFiles.value[field] = null;
    // reset input element if needed via template ref, but simpler just clearing data
};

const goToProfile = () => {
    currentStep.value = 2;
};

const submitProfile = async () => {
    isLoading.value = true;
    errorMsg.value = '';
    const token = getAuthToken();
    try {
        if (!isDeadlineClose.value) {
            await axios.put(`${backendUrl}/user/profile`, {
                name: userProfile.value.name,
                jenjang_id: userProfile.value.jenjang_id
            }, { headers: { Authorization: `Bearer ${token}` } });
            localStorage.setItem('user_institution', userProfile.value.asal_sekolah);
        }
        
        // Go to next step
        currentStep.value = 3;
    } catch (e) {
        errorMsg.value = "Gagal memperbarui profil. " + (e.response?.data?.error || e.message);
    } finally {
        isLoading.value = false;
    }
};

const isFilesComplete = computed(() => {
    const hasFile = (f) => !!f; // truthy = either File or URL stub
    
    if (props.isEditMode) {
        // In edit mode, already-uploaded URL stubs count as valid; only require alasan
        return hasFile(formFiles.value.resume) &&
               hasFile(formFiles.value.report_card) &&
               hasFile(formFiles.value.proposal) &&
               hasFile(formFiles.value.recommendation) &&
               formFiles.value.alasan.trim().length > 5;
    }
    return formFiles.value.resume instanceof File && 
           formFiles.value.report_card instanceof File && 
           formFiles.value.proposal instanceof File && 
           formFiles.value.recommendation instanceof File && 
           formFiles.value.alasan.trim().length > 10;
});

const submitRegistration = async () => {
    if (!isFilesComplete.value) {
        errorMsg.value = "Mohon lengkapi semua dokumen wajib dan alasan.";
        return;
    }

    isLoading.value = true;
    errorMsg.value = '';
    const token = getAuthToken();
    
    try {
        const formData = new FormData();
        
        if (props.isEditMode) {
            formData.append('alasan', formFiles.value.alasan);
            if (formFiles.value.resume instanceof File) formData.append('resume', formFiles.value.resume);
            if (formFiles.value.report_card instanceof File) formData.append('report_card', formFiles.value.report_card);
            if (formFiles.value.proposal instanceof File) formData.append('proposal', formFiles.value.proposal);
            if (formFiles.value.recommendation instanceof File) formData.append('recommendation', formFiles.value.recommendation);

            await axios.put(`${backendUrl}/user/pendaftaran/${props.existingRegistration.id}/berkas`, formData, { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            });
        } else {
            if (props.program.type === 'Beasiswa' || props.program.kategori === 'Beasiswa') {
                formData.append('beasiswa_id', props.program.id);
            } else {
                formData.append('olimpiade_id', props.program.id);
            }
            
            formData.append('alasan', formFiles.value.alasan);
            formData.append('resume', formFiles.value.resume);
            formData.append('report_card', formFiles.value.report_card);
            formData.append('proposal', formFiles.value.proposal);
            formData.append('recommendation', formFiles.value.recommendation);

            await axios.post(`${backendUrl}/pendaftaran`, formData, { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                } 
            });
        }
        
        currentStep.value = 4; // Success Step
        setTimeout(() => {
            closeModal();
            emit('success');
        }, 2000);
        
    } catch (e) {
        errorMsg.value = "Gagal menyimpan. " + (e.response?.data?.error || e.message);
    } finally {
        isLoading.value = false;
    }
};

const closeModal = () => {
    emit('close');
};

const formatCurrency = (value) => {
    if (!value) return 'Rp 0';
    return 'Rp ' + parseFloat(value).toLocaleString('id-ID');
};
</script>

<template>
    <transition name="modal-fade">
        <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm sm:p-6">
            <!-- Overlay click to close only if not loading -->
            <div class="absolute inset-0" @click="!isLoading && closeModal()"></div>
            
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-3xl relative z-10 flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
                
                <!-- Close Button -->
                <button type="button" @click="closeModal" :disabled="isLoading" class="absolute top-5 right-5 h-8 w-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full flex items-center justify-center transition z-20 disabled:opacity-50 cursor-pointer">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <!-- Header / Progress Bar -->
                <div v-if="currentStep < 4" class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-[10px] font-black uppercase rounded-md tracking-wider">
                            Pendaftaran {{ program?.type || 'Program' }}
                        </span>
                        <h2 class="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">{{ program?.title || program?.nama }}</h2>
                    </div>
                    
                    <div class="flex items-center justify-between relative">
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0"></div>
                        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full z-0 transition-all duration-500" :style="`width: ${(currentStep - 1) * 50}%`"></div>
                        
                        <div class="relative z-10 flex flex-col items-center gap-1.5" :class="currentStep >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'">
                            <div class="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 bg-white dark:bg-slate-900" :class="currentStep >= 1 ? 'border-indigo-600 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-700'">1</div>
                            <span class="text-[9px] font-bold uppercase tracking-wider hidden sm:block">Detail</span>
                        </div>
                        <div class="relative z-10 flex flex-col items-center gap-1.5" :class="currentStep >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'">
                            <div class="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 bg-white dark:bg-slate-900" :class="currentStep >= 2 ? 'border-indigo-600 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-700'">2</div>
                            <span class="text-[9px] font-bold uppercase tracking-wider hidden sm:block">Profil</span>
                        </div>
                        <div class="relative z-10 flex flex-col items-center gap-1.5" :class="currentStep >= 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'">
                            <div class="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 bg-white dark:bg-slate-900" :class="currentStep >= 3 ? 'border-indigo-600 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-700'">3</div>
                            <span class="text-[9px] font-bold uppercase tracking-wider hidden sm:block">Berkas</span>
                        </div>
                    </div>
                </div>

                <!-- Body (Scrollable) -->
                <div class="overflow-y-auto flex-1 p-6 sm:p-8">
                    
                    <!-- STEP 1: DETAIL PROGRAM -->
                    <div v-if="currentStep === 1 && program" class="space-y-6 animate-fade-in text-left">
                        <div class="space-y-3">
                            <span class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-none">
                                {{ program.type === 'Beasiswa' ? 'BEASISWA' : 'OLIMPIADE' }}
                            </span>
                            <h1 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">{{ program.title || program.nama }}</h1>
                            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                {{ program.description || program.deskripsi }}
                            </p>
                        </div>

                        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-5 space-y-4">
                            <div class="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Tipe Program</span>
                                <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ program.type === 'Beasiswa' ? 'Beasiswa' : 'Olimpiade' }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Penyelenggara</span>
                                <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ program.instansi?.nama || 'Penyelenggara Resmi' }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Tanggal Dibuat</span>
                                <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ program.created_at ? new Date(program.created_at).toLocaleDateString('id-ID') : '-' }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Status Terkini</span>
                                <span class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">PENDING</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Batas Pendaftaran</span>
                                <span class="text-sm font-black text-slate-800 dark:text-slate-200">{{ program.deadline ? new Date(program.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Segera' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 2: KONFIRMASI PROFIL -->
                    <div v-else-if="currentStep === 2" class="space-y-6 animate-fade-in text-left">
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-slate-900 dark:text-white">Konfirmasi Data Diri</h3>
                            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Pastikan data Anda di bawah ini benar sebelum melanjutkan pendaftaran.</p>
                        </div>

                        <!-- WARNING DEADLINE -->
                        <div v-if="isDeadlineClose" class="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-2xl flex items-start gap-3">
                            <span class="text-rose-500 text-lg">⚠️</span>
                            <div>
                                <h4 class="text-xs font-black text-rose-800 dark:text-rose-400">Form Terkunci (Read-Only)</h4>
                                <p class="text-[10px] font-bold text-rose-600 dark:text-rose-300 mt-0.5">Sisa waktu menuju deadline kurang dari 5 hari. Anda hanya dapat melihat data tanpa mengubahnya.</p>
                            </div>
                        </div>

                        <div v-if="errorMsg" class="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-800/50">
                            {{ errorMsg }}
                        </div>

                        <div class="space-y-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                                <input type="text" v-model="userProfile.name" :disabled="isDeadlineClose" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed" placeholder="Masukkan nama lengkap Anda" />
                            </div>
                            
                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Email Utama</label>
                                <input type="email" v-model="userProfile.email" disabled class="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-sm font-bold text-slate-500 dark:text-slate-500 rounded-xl px-4 py-3 cursor-not-allowed outline-none" />
                                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Email tidak dapat diubah pada saat pendaftaran.</span>
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Asal Sekolah / Instansi</label>
                                <input type="text" v-model="userProfile.asal_sekolah" :disabled="isDeadlineClose" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed" placeholder="Contoh: SMA Negeri 1 Jakarta" />
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-bold text-slate-700 dark:text-slate-300">Jenjang Pendidikan Saat Ini</label>
                                <select v-model="userProfile.jenjang_id" :disabled="isDeadlineClose" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none appearance-none disabled:opacity-60 disabled:cursor-not-allowed">
                                    <option :value="null" disabled>Pilih Jenjang</option>
                                    <option v-for="j in jenjangs" :key="j.id" :value="j.id">{{ j.nama }}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3: UPLOAD BERKAS -->
                    <div v-else-if="currentStep === 3" class="space-y-6 animate-fade-in text-left">
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-slate-900 dark:text-white">Upload Berkas Wajib</h3>
                            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Semua file harus dalam format PDF (maks. 5MB per file).</p>
                        </div>

                        <!-- WARNING DEADLINE -->
                        <div v-if="isDeadlineClose" class="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-2xl flex items-start gap-3">
                            <span class="text-rose-500 text-lg">⚠️</span>
                            <div>
                                <h4 class="text-xs font-black text-rose-800 dark:text-rose-400">Draft Berkas Terkunci</h4>
                                <p class="text-[10px] font-bold text-rose-600 dark:text-rose-300 mt-0.5">Sisa waktu menuju deadline kurang dari 5 hari. Anda tidak dapat menambah/mengganti berkas.</p>
                            </div>
                        </div>

                        <div v-if="errorMsg" class="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-800/50">
                            {{ errorMsg }}
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <!-- File inputs mapping -->
                            <div v-for="(label, key) in {
                                resume: 'Student Resume / CV',
                                report_card: 'School Report Card (Rapor)',
                                proposal: 'Project Proposal',
                                recommendation: 'Recommendation Letter'
                            }" :key="key" class="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative group">
                                <label class="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">{{ label }} <span class="text-rose-500 dark:text-rose-400">*</span></label>
                                
                                <div v-if="!formFiles[key]" class="relative" :class="{ 'opacity-50 cursor-not-allowed': isDeadlineClose }">
                                    <input type="file" :id="'file-'+key" accept="application/pdf" @change="handleFileChange($event, key)" :disabled="isDeadlineClose" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" :class="{ 'cursor-not-allowed': isDeadlineClose }" />
                                    <div class="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors bg-white dark:bg-slate-800/50">
                                        <svg class="h-5 w-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                        <span class="text-[10px] font-bold">{{ isDeadlineClose ? 'Terkunci' : 'Pilih File PDF' }}</span>
                                    </div>
                                </div>

                                <div v-else class="w-full py-2.5 px-3 border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-between">
                                    <div class="flex items-center gap-2 overflow-hidden">
                                        <span class="h-6 w-6 bg-emerald-500 dark:bg-emerald-600 text-white rounded-md flex items-center justify-center shrink-0"><svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></span>
                                        <span class="text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate">{{ formFiles[key].name }}</span>
                                    </div>
                                    <button type="button" v-if="!isDeadlineClose" @click="removeFile(key)" class="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 p-1 shrink-0"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            <label class="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Alasan Ketertarikan <span class="text-rose-500 dark:text-rose-400">*</span></label>
                            <textarea v-model="formFiles.alasan" rows="3" :disabled="isDeadlineClose" placeholder="Mengapa Anda tertarik mengikuti program ini?" class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-white rounded-xl px-4 py-3 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed"></textarea>
                            <p class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex justify-end">{{ formFiles.alasan.length }} karakter</p>
                        </div>
                    </div>

                    <!-- STEP 4: SUCCESS -->
                    <div v-else-if="currentStep === 4" class="py-12 flex flex-col items-center justify-center text-center animate-scale-in">
                        <div class="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
                            <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Pendaftaran Berhasil!</h2>
                        <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-sm">Berkas pendaftaran Anda telah diterima dan akan segera ditinjau oleh penyelenggara.</p>
                    </div>

                </div>

                <!-- Footer (Actions) -->
                <div v-if="currentStep < 4" class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center gap-4">
                    <button type="button" v-if="currentStep > 1" @click="currentStep--" :disabled="isLoading" class="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-bold disabled:opacity-50 transition cursor-pointer">
                        Kembali
                    </button>
                    <!-- In Step 1, the mockup says "Tutup Detail". So we replace "Simpan Wishlist" with "Tutup Detail" to match the mockup -->
                    <button type="button" v-else @click="closeModal" class="px-8 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-2xl transition-all cursor-pointer w-full max-w-xs mx-auto">
                        Tutup Detail
                    </button>

                    <button v-if="currentStep === 1" type="button" @click="goToProfile" class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer">
                        Lanjut Daftar
                    </button>
                    
                    <button v-if="currentStep === 2" type="button" @click="submitProfile" :disabled="isLoading" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2 cursor-pointer">
                        <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Lanjut
                    </button>

                    <button v-if="currentStep === 3" type="button" @click="submitRegistration" :disabled="isLoading || !isFilesComplete || isDeadlineClose" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                        <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Submit Pendaftaran
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: fadeIn 0.3s ease forwards; }
.animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

@keyframes slideUp {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
</style>
