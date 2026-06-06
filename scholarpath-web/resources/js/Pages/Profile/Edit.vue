<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
    mustVerifyEmail: Boolean,
    status: String,
});

// General states
const userRole = ref('student'); // 'student', 'instansi', or 'admin'
const isLoading = ref(false);
const messageToast = ref({ text: '', type: '' });

const showToast = (text, type = 'success') => {
    messageToast.value = { text, type };
    setTimeout(() => {
        messageToast.value = { text: '', type: '' };
    }, 4000);
};

const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

const studentPhoto = ref('');
const institutionPhoto = ref('');

const handleUploadPhoto = async (event, role) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran file maksimal 2MB.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'multipart/form-data',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await axios.post(`${backendUrl}/upload`, formData, { headers });
        if (response.data && response.data.file_url) {
            const fileUrl = response.data.file_url;
            const userId = localStorage.getItem('auth_user_id') || 'guest';
            
            localStorage.setItem('auth_profile_photo_' + userId, fileUrl);
            
            if (role === 'instansi' || role === 'admin') {
                institutionPhoto.value = fileUrl;
            } else {
                studentPhoto.value = fileUrl;
            }
            
            window.dispatchEvent(new CustomEvent('profile-photo-updated', { detail: fileUrl }));
            showToast('Foto profil berhasil diperbarui!');
        } else {
            showToast('Gagal mengunggah foto.', 'error');
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
        showToast('Gagal mengunggah foto profil.', 'error');
    } finally {
        isLoading.value = false;
        event.target.value = '';
    }
};

const handleRemovePhoto = (role) => {
    const userId = localStorage.getItem('auth_user_id') || 'guest';
    localStorage.removeItem('auth_profile_photo_' + userId);
    
    if (role === 'instansi' || role === 'admin') {
        institutionPhoto.value = '';
    } else {
        studentPhoto.value = '';
    }
    
    window.dispatchEvent(new CustomEvent('profile-photo-updated', { detail: '' }));
    showToast('Foto profil dihapus.', 'warning');
};

// =======================================================
// A. STUDENT PROFILE SETTINGS STATES & HANDLERS
// =======================================================
const fullName = ref('');
const emailAddress = ref('');
const location = ref('');
const currentInstitution = ref('Stanford University');
const gpaVal = ref('3.8');

const interests = ref(['Computer Science', 'Renewable Energy', 'Underrepresented Minorities']);
const hardSkills = ref(['Python', 'Data Analysis', 'Public Speaking']);

const newInterestInput = ref('');
const showAddInterest = ref(false);
const newSkillInput = ref('');
const showAddSkill = ref(false);

const activeTabSection = ref('personal');
const listJenjangs = ref([]);
const selectedJenjangId = ref(1);

const completenessScore = computed(() => {
    let score = 0;
    if (fullName.value) score += 20;
    if (emailAddress.value) score += 20;
    if (location.value) score += 15;
    if (currentInstitution.value) score += 15;
    if (gpaVal.value) score += 10;
    if (interests.value.length > 0) score += 10;
    if (hardSkills.value.length > 0) score += 10;
    return score;
});

const fetchStudentProfileDetails = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const resProfile = await axios.get(`${backendUrl}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resProfile.data && resProfile.data.data) {
            const u = resProfile.data.data;
            fullName.value = u.name || '';
            emailAddress.value = u.email || '';
            selectedJenjangId.value = u.jenjang_id || 1;
            
            if (u.keahlian) {
                const parts = u.keahlian.split(',').map(p => p.trim()).filter(p => p);
                if (parts.length > 0) {
                    interests.value = parts.slice(0, Math.ceil(parts.length / 2));
                    hardSkills.value = parts.slice(Math.ceil(parts.length / 2));
                }
            }
        }

        const resJenjang = await axios.get(`${backendUrl}/jenjang`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        listJenjangs.value = resJenjang.data.data || [];
    } catch (error) {
        console.error('Error loading student profile details:', error);
    }
};

const handleSaveStudentProfile = async () => {
    const token = getAuthToken();
    if (!token) return;
    isLoading.value = true;
    try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/api';
        const combinedKeahlian = [...interests.value, ...hardSkills.value].join(', ');
        
        const payload = {
            name: fullName.value,
            jenjang_id: selectedJenjangId.value,
            keahlian: combinedKeahlian
        };

        const response = await axios.put(`${backendUrl}/user/profile`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.data) {
            localStorage.setItem('auth_name', fullName.value);
            localStorage.setItem('mock_location', location.value);
            localStorage.setItem('mock_institution', currentInstitution.value);
            localStorage.setItem('mock_gpa', gpaVal.value);
            showToast('Profil berhasil disimpan dan diperbarui!');
        }
    } catch (error) {
        console.error('Error saving student profile:', error);
        showToast('Gagal memperbarui profil.', 'error');
    } finally {
        isLoading.value = false;
    }
};

// =======================================================
// B. INSTITUTION SETTINGS STATES & HANDLERS
// =======================================================
const institutionName = ref('');
const institutionEmail = ref('');
const activeMembers = ref([]);

// Toggles
const twoFactorAuth = ref(true);
const emailNotifications = ref(true);
const pushNotifications = ref(false);
const deadlineReminders = ref(true);

// Add Member Modal State
const showAddMemberModal = ref(false);
const newMemberName = ref('');
const newMemberRole = ref('');

// Password Form using Laravel Breeze controller
const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
});

const loadInstitutionSettings = () => {
    // 1. Get institution admin name & email
    const name = localStorage.getItem('auth_name') || 'Admin Utama';
    institutionName.value = name;
    
    // 2. Load members from localStorage or fall back to default
    const savedMembers = localStorage.getItem('institution_members');
    if (savedMembers) {
        activeMembers.value = JSON.parse(savedMembers);
    } else {
        activeMembers.value = [
            { id: 1, name: 'Dr. Robert Chen', role: 'Lead Scholarship Officer' },
            { id: 2, name: 'Sarah Jenkins', role: 'Review Committee Member' }
        ];
        localStorage.setItem('institution_members', JSON.stringify(activeMembers.value));
    }

    // Load toggles
    const tfa = localStorage.getItem('inst_2fa');
    if (tfa !== null) twoFactorAuth.value = tfa === 'true';

    const notifEmail = localStorage.getItem('inst_notif_email');
    if (notifEmail !== null) emailNotifications.value = notifEmail === 'true';

    const notifPush = localStorage.getItem('inst_notif_push');
    if (notifPush !== null) pushNotifications.value = notifPush === 'true';

    const notifDeadline = localStorage.getItem('inst_notif_deadline');
    if (notifDeadline !== null) deadlineReminders.value = notifDeadline === 'true';
};

const handleSaveToggles = () => {
    localStorage.setItem('inst_2fa', twoFactorAuth.value);
    localStorage.setItem('inst_notif_email', emailNotifications.value);
    localStorage.setItem('inst_notif_push', pushNotifications.value);
    localStorage.setItem('inst_notif_deadline', deadlineReminders.value);
};

// Add Member
const handleOpenAddMemberModal = () => {
    newMemberName.value = '';
    newMemberRole.value = '';
    showAddMemberModal.value = true;
};

const handleAddMemberSubmit = () => {
    if (!newMemberName.value.trim() || !newMemberRole.value.trim()) {
        showToast('Semua kolom harus diisi.', 'error');
        return;
    }
    
    if (activeMembers.value.length >= 9) {
        showToast('Kapasitas kursi tim maksimum (10) tercapai.', 'error');
        return;
    }

    const nextId = activeMembers.value.length ? Math.max(...activeMembers.value.map(m => m.id)) + 1 : 1;
    activeMembers.value.push({
        id: nextId,
        name: newMemberName.value.trim(),
        role: newMemberRole.value.trim()
    });

    localStorage.setItem('institution_members', JSON.stringify(activeMembers.value));
    showAddMemberModal.value = false;
    showToast(`Berhasil menambahkan ${newMemberName.value.trim()}!`);
};

// Delete Member
const handleDeleteMember = (memberId, memberName) => {
    activeMembers.value = activeMembers.value.filter(m => m.id !== memberId);
    localStorage.setItem('institution_members', JSON.stringify(activeMembers.value));
    showToast(`Berhasil menghapus ${memberName}.`, 'warning');
};

// Update password via Laravel Password Controller
const handleUpdatePassword = () => {
    errorBackend.value = '';
    passwordForm.put(route('password.update'), {
        preserveScroll: true,
        onSuccess: () => {
            passwordForm.reset();
            showToast('Kata sandi berhasil diperbarui!');
        },
        onError: (errors) => {
            if (errors.password) {
                passwordForm.reset('password', 'password_confirmation');
            }
            if (errors.current_password) {
                passwordForm.reset('current_password');
            }
            showToast('Gagal memperbarui kata sandi. Cek kredensial Anda.', 'error');
        },
    });
};

const errorBackend = ref('');

// Dynamic Seats Calculation (1 main admin + other members)
const seatsUsed = computed(() => {
    return activeMembers.value.length + 1;
});

// General mount routing
onMounted(() => {
    const savedRole = localStorage.getItem('auth_role');
    if (savedRole) {
        userRole.value = savedRole.toLowerCase();
    }
    
    const userId = localStorage.getItem('auth_user_id');
    if (userId) {
        const photo = localStorage.getItem('auth_profile_photo_' + userId) || '';
        studentPhoto.value = photo;
        institutionPhoto.value = photo;
    }
    
    if (userRole.value === 'instansi' || userRole.value === 'admin') {
        loadInstitutionSettings();
    } else {
        fetchStudentProfileDetails();
        
        const loc = localStorage.getItem('mock_location');
        const inst = localStorage.getItem('mock_institution');
        const gpa = localStorage.getItem('mock_gpa');
        if (loc) location.value = loc;
        if (inst) currentInstitution.value = inst;
        if (gpa) gpaVal.value = gpa;
    }
});
</script>

<template>
    <Head :title="userRole === 'instansi' || userRole === 'admin' ? 'Institution Settings' : 'Profile Settings'" />

    <AuthenticatedLayout>
        <!-- Toast Notification -->
        <transition name="toast">
            <div v-if="messageToast.text" class="fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-slideDown"
                :class="{
                    'bg-emerald-50 text-emerald-800 border-emerald-100': messageToast.type === 'success',
                    'bg-amber-50 text-amber-800 border-amber-100': messageToast.type === 'warning',
                    'bg-red-50 text-red-800 border-red-100': messageToast.type === 'error'
                }"
            >
                <span v-if="messageToast.type === 'success'" class="h-5 w-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                <span v-else-if="messageToast.type === 'warning'" class="h-5 w-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px]">!</span>
                <span v-else class="h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">×</span>
                {{ messageToast.text }}
            </div>
        </transition>

        <!-- ======================================================= -->
        <!-- A. INSTITUTION (INSTANSI) SETTINGS VIEW -->
        <!-- ======================================================= -->
        <div v-if="userRole === 'instansi' || userRole === 'admin'" class="space-y-8 text-left">
            
            <!-- Page Header -->
            <div class="space-y-1">
                <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Institution Settings</h1>
                <p class="text-xs font-semibold text-slate-500">Manage your scholarship portal configuration, security, and team permissions.</p>
            </div>

            <!-- Two-Column Settings Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Column (Team Management, Security) -->
                <div class="lg:col-span-8 space-y-6">
                    
                    <!-- Institution Profile Photo Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                        <div class="border-b border-slate-50 pb-3">
                            <h3 class="text-sm font-black text-slate-800 flex items-center gap-2">
                                <span class="text-lg">🏢</span> Profil Instansi
                            </h3>
                            <p class="text-[10px] text-slate-400 font-bold">Perbarui logo atau foto profil instansi Anda.</p>
                        </div>
                        <div class="flex items-center gap-6">
                            <div class="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-150 ring-4 ring-indigo-50 shrink-0">
                                <img :src="institutionPhoto || '/images/avatar.png'" alt="Institution Profile Photo" class="h-full w-full object-cover" />
                            </div>
                            <div class="space-y-1.5">
                                <h4 class="text-xs font-bold text-slate-800">Logo Instansi</h4>
                                <p class="text-[10px] text-slate-400 font-bold leading-normal">Mendukung format JPG, PNG, atau WEBP. Maks 2MB.</p>
                                <div class="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref="institutionPhotoInput"
                                        @change="e => handleUploadPhoto(e, 'instansi')"
                                        class="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        type="button"
                                        @click="$refs.institutionPhotoInput.click()"
                                        class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition cursor-pointer"
                                    >
                                        Pilih Foto
                                    </button>
                                    <button
                                        v-if="institutionPhoto"
                                        type="button"
                                        @click="handleRemovePhoto('instansi')"
                                        class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Team Management Section -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
                        <div class="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div class="space-y-0.5">
                                <h3 class="text-sm font-black text-slate-800 flex items-center gap-2">
                                    <span class="text-lg">👥</span> Team Management
                                </h3>
                                <p class="text-[10px] text-slate-400 font-bold">Invite and manage secondary administrators for your institution.</p>
                            </div>
                            <button
                                type="button"
                                @click="handleOpenAddMemberModal"
                                class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                            >
                                + Add Member
                            </button>
                        </div>

                        <!-- Active Members List -->
                        <div class="divide-y divide-slate-50">
                            <!-- Main Admin (Static) -->
                            <div class="py-3.5 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                                        AU
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-850">{{ institutionName }}</p>
                                        <p class="text-[9px] font-bold text-slate-400">Main Administrator (Owner)</p>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded-full bg-indigo-55/10 border border-indigo-100 text-indigo-700 text-[8px] font-black uppercase tracking-wider">Owner</span>
                            </div>

                            <!-- Invited Members -->
                            <div v-for="member in activeMembers" :key="member.id" class="py-3.5 flex items-center justify-between group">
                                <div class="flex items-center gap-3">
                                    <div class="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500">
                                        {{ member.name.split(' ').map(n => n[0]).slice(0,2).join('') }}
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold text-slate-850">{{ member.name }}</p>
                                        <p class="text-[9px] font-bold text-slate-400">{{ member.role }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-black uppercase tracking-wide">Active</span>
                                    
                                    <!-- Delete Button -->
                                    <button
                                        type="button"
                                        @click="handleDeleteMember(member.id, member.name)"
                                        class="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 transition cursor-pointer"
                                        title="Remove Member"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Empty members list state -->
                            <div v-if="activeMembers.length === 0" class="py-6 text-center text-slate-400 font-bold text-xs">
                                Belum ada anggota tim tambahan. Undang anggota baru untuk membantu mengelola program.
                            </div>
                        </div>
                    </div>

                    <!-- Security Configuration Section -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                        <div class="border-b border-slate-50 pb-3">
                            <h3 class="text-sm font-black text-slate-800 flex items-center gap-2">
                                <span class="text-lg">🛡️</span> Security Configuration
                            </h3>
                        </div>

                        <!-- 2FA Toggle -->
                        <div class="flex items-center justify-between p-4 bg-slate-50/40 border border-slate-100 rounded-2xl">
                            <div class="flex gap-3.5 items-start">
                                <div class="h-10 w-10 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-lg">
                                    🔒
                                </div>
                                <div class="space-y-0.5">
                                    <h4 class="text-xs font-bold text-slate-800">Two-Factor Authentication</h4>
                                    <p class="text-[10px] font-bold text-slate-400 leading-normal">Secure your account with a secondary verification code.</p>
                                </div>
                            </div>
                            <!-- Switch button toggle -->
                            <button
                                type="button"
                                @click="twoFactorAuth = !twoFactorAuth; handleSaveToggles(); showToast(twoFactorAuth ? '2FA diaktifkan!' : '2FA dinonaktifkan.', 'warning')"
                                class="w-11 h-6 shrink-0 rounded-full transition duration-200 outline-none flex items-center px-0.5 cursor-pointer"
                                :class="twoFactorAuth ? 'bg-indigo-600' : 'bg-slate-200'"
                            >
                                <span class="w-5 h-5 rounded-full bg-white shadow transform duration-200"
                                    :class="twoFactorAuth ? 'translate-x-5' : 'translate-x-0'"
                                ></span>
                            </button>
                        </div>

                        <!-- Password Update Form -->
                        <div class="border-t border-slate-50 pt-5 space-y-4">
                            <h4 class="text-xs font-bold text-slate-800">Change Administrator Password</h4>
                            
                            <form @submit.prevent="handleUpdatePassword" class="space-y-4">
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <!-- Current Password -->
                                    <div>
                                        <label class="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Current Password</label>
                                        <input
                                            type="password"
                                            v-model="passwordForm.current_password"
                                            required
                                            placeholder="••••••••"
                                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                                        />
                                        <InputError :message="passwordForm.errors.current_password" class="mt-1" />
                                    </div>

                                    <!-- New Password -->
                                    <div>
                                        <label class="text-[9px] font-black uppercase text-slate-400 block mb-1.5">New Password</label>
                                        <input
                                            type="password"
                                            v-model="passwordForm.password"
                                            required
                                            placeholder="Min. 8 karakter"
                                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                                        />
                                        <InputError :message="passwordForm.errors.password" class="mt-1" />
                                    </div>

                                    <!-- Confirm Password -->
                                    <div>
                                        <label class="text-[9px] font-black uppercase text-slate-400 block mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password"
                                            v-model="passwordForm.password_confirmation"
                                            required
                                            placeholder="••••••••"
                                            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                                        />
                                        <InputError :message="passwordForm.errors.password_confirmation" class="mt-1" />
                                    </div>
                                </div>

                                <div class="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        :disabled="passwordForm.processing"
                                        class="px-4 py-2 bg-white border border-indigo-600 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Right Column (Notifications Sidebar, Plan metrics) -->
                <div class="lg:col-span-4 space-y-6">
                    
                    <!-- Notifications Settings Card -->
                    <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5 text-left">
                        <h4 class="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                            <span>🔔</span> Notifications
                        </h4>
                        
                        <div class="space-y-4">
                            <!-- Email Notifications -->
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h5 class="text-xs font-bold text-slate-800 leading-snug">Email Notifications</h5>
                                    <p class="text-[9px] font-semibold text-slate-400 mt-0.5">Daily digest of applicants</p>
                                </div>
                                <button
                                    type="button"
                                    @click="emailNotifications = !emailNotifications; handleSaveToggles(); showToast(emailNotifications ? 'Notifikasi Email Aktif' : 'Notifikasi Email Nonaktif', 'warning')"
                                    class="w-9 h-5 shrink-0 rounded-full transition duration-200 outline-none flex items-center px-0.5 cursor-pointer"
                                    :class="emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'"
                                >
                                    <span class="w-4 h-4 rounded-full bg-white shadow transform duration-200"
                                        :class="emailNotifications ? 'translate-x-4' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>

                            <!-- Push Notifications -->
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h5 class="text-xs font-bold text-slate-800 leading-snug">Push Notifications</h5>
                                    <p class="text-[9px] font-semibold text-slate-400 mt-0.5">Alerts for urgent messages</p>
                                </div>
                                <button
                                    type="button"
                                    @click="pushNotifications = !pushNotifications; handleSaveToggles(); showToast(pushNotifications ? 'Push Notif Aktif' : 'Push Notif Nonaktif', 'warning')"
                                    class="w-9 h-5 shrink-0 rounded-full transition duration-200 outline-none flex items-center px-0.5 cursor-pointer"
                                    :class="pushNotifications ? 'bg-indigo-600' : 'bg-slate-200'"
                                >
                                    <span class="w-4 h-4 rounded-full bg-white shadow transform duration-200"
                                        :class="pushNotifications ? 'translate-x-4' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>

                            <!-- Deadline Reminders -->
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <h5 class="text-xs font-bold text-slate-800 leading-snug">Deadline Reminders</h5>
                                    <p class="text-[9px] font-semibold text-slate-400 mt-0.5">7-day advance warnings</p>
                                </div>
                                <button
                                    type="button"
                                    @click="deadlineReminders = !deadlineReminders; handleSaveToggles(); showToast(deadlineReminders ? 'Pengingat Deadline Aktif' : 'Pengingat Deadline Nonaktif', 'warning')"
                                    class="w-9 h-5 shrink-0 rounded-full transition duration-200 outline-none flex items-center px-0.5 cursor-pointer"
                                    :class="deadlineReminders ? 'bg-indigo-600' : 'bg-slate-200'"
                                >
                                    <span class="w-4 h-4 rounded-full bg-white shadow transform duration-200"
                                        :class="deadlineReminders ? 'translate-x-4' : 'translate-x-0'"
                                    ></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Institution Plan Card -->
                    <div class="bg-indigo-600 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between h-44 text-left">
                        <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#818cf8,transparent_55%)] opacity-60"></div>
                        <div class="space-y-3.5 relative z-10">
                            <div>
                                <h4 class="text-[10px] font-black uppercase tracking-widest text-indigo-200">Institution Plan</h4>
                                <h3 class="text-base font-extrabold leading-tight mt-0.5">ScholarPath Premium Enterprise</h3>
                            </div>
                            
                            <!-- Seats progress bar -->
                            <div class="space-y-1">
                                <div class="flex justify-between text-[9px] font-black text-indigo-200 uppercase">
                                    <span>Team Seats Used</span>
                                    <span>{{ seatsUsed }} / 10</span>
                                </div>
                                <div class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div class="bg-white h-full transition-all duration-300" :style="{ width: (seatsUsed * 10) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                        <div class="relative z-10 pt-3">
                            <button
                                type="button"
                                @click="showToast('Halaman Detail Penagihan sedang disiapkan.', 'warning')"
                                class="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg border border-white/10 transition cursor-pointer"
                            >
                                View Billing Info
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ======================================================= -->
        <!-- B. STUDENT (SISWA) SETTINGS VIEW (ORIGINAL LAYOUT) -->
        <!-- ======================================================= -->
        <div v-else class="space-y-8 text-left">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
            </div>

            <!-- Content Grid Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Sidebar Section (AI card & Submenu navigation) -->
                <div class="lg:col-span-4 space-y-6">
                    <!-- AI Optimization Card -->
                    <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm text-center space-y-4">
                        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                            <span>✨</span> AI Optimization
                        </span>

                        <!-- Circle completeness bar -->
                        <div class="relative h-28 w-28 mx-auto flex items-center justify-center">
                            <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                                <path class="text-slate-100" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="text-indigo-600 transition-all duration-500" stroke-dasharray="100" :stroke-dashoffset="100 - completenessScore" stroke-linecap="round" stroke-width="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <span class="text-2xl font-black text-slate-800">{{ completenessScore }}%</span>
                        </div>

                        <p class="text-xs text-slate-500 font-bold leading-relaxed px-2">
                            Add your Research Interests to reach 85% and unlock targeted scholarship matches.
                        </p>

                        <button
                            type="button"
                            @click="activeTabSection = 'interests'; showToast('Silakan tambahkan bidang minat/keahlian riset Anda!');"
                            class="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100/50 transition duration-200 cursor-pointer"
                        >
                            Boost Match Rate
                        </button>
                    </div>

                    <!-- Navigation Sub-menus -->
                    <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-3 space-y-1">
                        <button
                            v-for="sub in [
                                { id: 'personal', label: 'Personal Information', icon: '👤' },
                                { id: 'academic', label: 'Academic Details', icon: '🎓' },
                                { id: 'interests', label: 'Interests & Skills', icon: '💼' },
                                { id: 'notifications', label: 'Notifications', icon: '🔔' }
                            ]"
                            :key="sub.id"
                            type="button"
                            @click="activeTabSection = sub.id"
                            class="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition duration-200 focus:outline-none"
                            :class="activeTabSection === sub.id 
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'"
                        >
                            <span>{{ sub.icon }}</span>
                            {{ sub.label }}
                        </button>
                    </div>
                </div>

                <!-- Right Column: Settings Details -->
                <div class="lg:col-span-8 space-y-6">
                    <!-- Card 1: Personal Information -->
                    <div v-show="activeTabSection === 'personal'" class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-scale">
                        <div class="space-y-1">
                            <h3 class="text-lg font-black text-slate-800 tracking-tight">Personal Information</h3>
                            <p class="text-xs text-slate-500">Update your basic details for scholarship applications.</p>
                        </div>

                        <!-- Profile Photo Upload Section -->
                        <div class="flex items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div class="relative h-20 w-20 rounded-2xl overflow-hidden border border-slate-150 ring-4 ring-indigo-50 shrink-0">
                                <img :src="studentPhoto || '/images/avatar.png'" alt="Student Profile Photo" class="h-full w-full object-cover" />
                            </div>
                            <div class="space-y-1.5">
                                <h4 class="text-xs font-bold text-slate-800">Foto Profil</h4>
                                <p class="text-[10px] text-slate-400 font-bold leading-normal">Mendukung format JPG, PNG, atau WEBP. Maks 2MB.</p>
                                <div class="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref="studentPhotoInput"
                                        @change="e => handleUploadPhoto(e, 'student')"
                                        class="hidden"
                                        accept="image/*"
                                    />
                                    <button
                                        type="button"
                                        @click="$refs.studentPhotoInput.click()"
                                        class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg shadow-sm transition cursor-pointer"
                                    >
                                        Pilih Foto
                                    </button>
                                    <button
                                        v-if="studentPhoto"
                                        type="button"
                                        @click="handleRemovePhoto('student')"
                                        class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg transition cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Fields Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <!-- Full Name -->
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Full Name</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">👤</span>
                                    <input
                                        type="text"
                                        v-model="fullName"
                                        placeholder="Name"
                                        class="w-full pl-10 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 transition outline-none"
                                    />
                                </div>
                            </div>

                            <!-- Email Address -->
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Email Address</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">✉</span>
                                    <input
                                        type="email"
                                        v-model="emailAddress"
                                        placeholder="email@example.com"
                                        class="w-full pl-10 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 transition outline-none"
                                    />
                                </div>
                            </div>

                            <!-- Location -->
                            <div class="md:col-span-2">
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Location</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">📍</span>
                                    <input
                                        type="text"
                                        v-model="location"
                                        placeholder="Palo Alto, CA"
                                        class="w-full pl-10 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 transition outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2: Academic Details -->
                    <div v-show="activeTabSection === 'academic'" class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-scale">
                        <div class="space-y-1">
                            <h3 class="text-lg font-black text-slate-800 tracking-tight">Academic Details</h3>
                            <p class="text-xs text-slate-500">Verification of these details may be required for specific grants.</p>
                        </div>

                        <!-- Fields Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <!-- Current Institution -->
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Current Institution</label>
                                <select
                                    v-model="currentInstitution"
                                    class="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none cursor-pointer"
                                >
                                    <option value="Stanford University">Stanford University</option>
                                    <option value="Universitas Indonesia">Universitas Indonesia</option>
                                    <option value="Institut Teknologi Bandung">Institut Teknologi Bandung</option>
                                    <option value="Universitas Gadjah Mada">Universitas Gadjah Mada</option>
                                    <option value="Harvard University">Harvard University</option>
                                </select>
                            </div>

                            <!-- GPA -->
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">GPA (4.0 Scale)</label>
                                <input
                                    type="text"
                                    v-model="gpaVal"
                                    placeholder="3.8"
                                    class="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 placeholder-slate-400 transition outline-none"
                                />
                            </div>

                            <!-- Jenjang Pendidikan -->
                            <div class="md:col-span-2">
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Tingkat Pendidikan</label>
                                <select
                                    v-model="selectedJenjangId"
                                    class="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 focus:border-indigo-500 rounded-2xl text-xs text-slate-800 transition outline-none cursor-pointer"
                                >
                                    <option v-for="jenjang in listJenjangs" :key="jenjang.id" :value="jenjang.id">
                                        {{ jenjang.nama }}
                                    </option>
                                    <option v-if="listJenjangs.length === 0" :value="1">SMA / Sederajat</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3: Interests & Skills -->
                    <div v-show="activeTabSection === 'interests'" class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-scale">
                        <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div class="space-y-1">
                                <h3 class="text-lg font-black text-slate-800 tracking-tight">Interests & Skills</h3>
                                <p class="text-xs text-slate-500">Used by AI to match you with niche scholarships.</p>
                            </div>
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50 text-[9px] font-black uppercase shrink-0">
                                <span>✓</span> Verified
                            </span>
                        </div>

                        <!-- Tag List Blocks -->
                        <div class="space-y-6 pt-2">
                            <!-- Scholarship Interests -->
                            <div class="space-y-3">
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Scholarship Interests</label>
                                <div class="flex flex-wrap gap-2 items-center">
                                    <span v-for="(interest, index) in interests" :key="interest" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/70 border border-indigo-100/50 text-indigo-700 text-xs font-bold animate-fadeIn">
                                        {{ interest }}
                                        <button type="button" @click="removeInterest(index)" class="text-indigo-400 hover:text-indigo-600 font-extrabold focus:outline-none">×</button>
                                    </span>

                                    <!-- Add Tag input inline -->
                                    <div v-if="showAddInterest" class="flex items-center gap-1">
                                        <input
                                            type="text"
                                            v-model="newInterestInput"
                                            @keyup.enter="addInterest"
                                            @blur="addInterest"
                                            placeholder="Tulis minat..."
                                            class="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32 animate-fadeIn"
                                            autofocus
                                        />
                                    </div>
                                    <button
                                        v-else
                                        type="button"
                                        @click="showAddInterest = true"
                                        class="px-3 py-1.5 border border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 rounded-full text-xs font-bold transition focus:outline-none"
                                    >
                                        + Add Tag
                                    </button>
                                </div>
                            </div>

                            <!-- Hard Skills -->
                            <div class="space-y-3">
                                <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Hard Skills</label>
                                <div class="flex flex-wrap gap-2 items-center">
                                    <span v-for="(skill, index) in hardSkills" :key="skill" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50/70 border border-purple-100/50 text-purple-700 text-xs font-bold animate-fadeIn">
                                        {{ skill }}
                                        <button type="button" @click="removeSkill(index)" class="text-purple-400 hover:text-purple-600 font-extrabold focus:outline-none">×</button>
                                    </span>

                                    <!-- Add Skill input inline -->
                                    <div v-if="showAddSkill" class="flex items-center gap-1">
                                        <input
                                            type="text"
                                            v-model="newSkillInput"
                                            @keyup.enter="addSkill"
                                            @blur="addSkill"
                                            placeholder="Tulis keahlian..."
                                            class="px-3 py-1 bg-white border border-purple-200 rounded-full text-xs text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 w-32 animate-fadeIn"
                                            autofocus
                                        />
                                    </div>
                                    <button
                                        v-else
                                        type="button"
                                        @click="showAddSkill = true"
                                        class="px-3 py-1.5 border border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 rounded-full text-xs font-bold transition focus:outline-none"
                                    >
                                        + Add Skill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 4: Notifications Settings -->
                    <div v-show="activeTabSection === 'notifications'" class="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-scale">
                        <div class="space-y-1">
                            <h3 class="text-lg font-black text-slate-800 tracking-tight">Notification Settings</h3>
                            <p class="text-xs text-slate-500">Configure how you receive scholarship and matching alerts.</p>
                        </div>

                        <div class="space-y-4 pt-2">
                            <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div class="space-y-0.5">
                                    <p class="text-xs font-bold text-slate-800">Email Matching Notifications</p>
                                    <p class="text-[10px] font-bold text-slate-400 leading-normal">Receive alerts when new scholarship matches are found.</p>
                                </div>
                                <input type="checkbox" checked class="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500/20 border-gray-300 rounded-lg transition" />
                            </div>

                            <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div class="space-y-0.5">
                                    <p class="text-xs font-bold text-slate-800">Deadline Reminders</p>
                                    <p class="text-[10px] font-bold text-slate-400 leading-normal">Receive warnings 7 days before program deadlines.</p>
                                </div>
                                <input type="checkbox" checked class="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500/20 border-gray-300 rounded-lg transition" />
                            </div>
                        </div>
                    </div>

                    <!-- Actions Buttons Footer -->
                    <div class="flex justify-end gap-3.5 pt-4">
                        <button
                            type="button"
                            @click="handleDiscardChanges"
                            class="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-2xl transition duration-200 cursor-pointer"
                        >
                            Discard Changes
                        </button>
                        
                        <button
                            type="button"
                            :disabled="isLoading"
                            @click="handleSaveStudentProfile"
                            class="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/15 hover:shadow-xl hover:shadow-indigo-600/25 transition duration-200 cursor-pointer"
                        >
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- UNDANG ANGGOTA TIM MODAL (INSTANSI ONLY) -->
        <transition name="fade">
            <div v-if="showAddMemberModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="absolute inset-0" @click="showAddMemberModal = false"></div>
                <div class="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 max-w-sm w-full relative z-10 animate-scale text-left">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-base font-extrabold text-slate-850">Undang Anggota Tim</h3>
                        <button type="button" @click="showAddMemberModal = false" class="text-slate-400 hover:text-slate-650 text-xl font-bold">&times;</button>
                    </div>
                    
                    <div class="space-y-4">
                        <!-- Member Name -->
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                v-model="newMemberName"
                                placeholder="Contoh: Dr. Robert Chen"
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                            />
                        </div>

                        <!-- Member Role -->
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Jabatan / Posisi</label>
                            <input
                                type="text"
                                v-model="newMemberRole"
                                placeholder="Contoh: Lead Scholarship Officer"
                                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 focus:bg-white focus:border-indigo-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none transition"
                            />
                        </div>
                    </div>

                    <!-- Modal Actions -->
                    <div class="flex gap-3 pt-5 mt-5 border-t border-slate-100">
                        <button
                            type="button"
                            @click="showAddMemberModal = false"
                            class="w-1/2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            @click="handleAddMemberSubmit"
                            class="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                        >
                            Undang
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </AuthenticatedLayout>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: scale(0.9); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-scale {
    animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.animate-slideDown {
    animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fadeIn {
    animation: fadeIn 0.25s ease forwards;
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>
