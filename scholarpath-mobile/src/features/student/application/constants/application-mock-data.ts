import { ActiveProgram, RegistrationApplication } from '@/src/types/shared/application';

export const SAMPLE_ACTIVE_PROGRAMS: ActiveProgram[] = [
  {
    id: 'active-1',
    title: 'Beasiswa Bakti Siswa 2026',
    provider: 'Kemdikbud',
    status: 'incomplete_documents',
    daysLeft: '2 hari lagi',
  },
  {
    id: 'active-2',
    title: 'Global Undergraduate Program',
    provider: 'World Bank Group',
    status: 'applied',
  },
  {
    id: 'active-3',
    title: 'Data Science Competition',
    provider: 'Stanford Online',
    status: 'incomplete_form',
  },
];

export const SAMPLE_REGISTRATIONS: RegistrationApplication[] = [
  {
    id: 'reg-2',
    title: 'Beasiswa Unggulan',
    provider: 'Universitas Indonesia',
    categoryTag: 'BEASISWA NASIONAL',
    status: 'review',
    reviewProgress: 60,
    reviewLabel: 'Proses Review Dokumen',
    submittedAt: '12 Okt 2023',
    timeline: [
      {
        title: 'Pendaftaran',
        subtitle: 'Selesai pada 12 Okt 2023',
        status: 'done',
      },
      {
        title: 'Verifikasi Dokumen',
        subtitle: 'Sedang diproses oleh tim reviewer',
        status: 'active',
      },
      {
        title: 'Wawancara',
        subtitle: 'Menunggu tahap sebelumnya selesai',
        status: 'pending',
      },
    ],
  },
  {
    id: 'reg-1',
    title: 'Google Solution Challenge',
    provider: 'Global',
    categoryTag: 'KOMPETISI GLOBAL',
    status: 'accepted',
    updatedAt: '20 Nov 2023',
    acceptedMessage: {
      title: 'Selamat! Kamu lolos ke tahap selanjutnya',
      subtitle: 'Persiapkan presentasi final kamu untuk babak penjurian regional.',
    },
  },
  {
    id: 'reg-3',
    title: 'Exchange Program Japan',
    provider: 'Tokyo Institute of Tech',
    categoryTag: 'TOKYO INSTITUTE TECH',
    status: 'rejected',
    submittedAt: '05 Sep 2023',
    rejectedFeedback:
      'Coba lagi di periode berikutnya. Jangan patah semangat, evaluasi dokumen dan tingkatkan skor bahasamu.',
  },
];
