import { ExploreProgram } from '@/src/types/shared/program';
import { convertToIdr } from '@/src/features/student/program/utils/format-prize';

export const EXPLORE_PROGRAMS: ExploreProgram[] = [
  {
    id: 'beasiswa-jaya-2026',
    title: 'Beasiswa Jaya 2026',
    provider: 'Kemdikbud',
    category: 'beasiswa',
    categoryLabel: 'Beasiswa',
    categoryTag: 'BEASISWA',
    educationLevels: ['SMA'],
    imageUri:
      'https://www.figma.com/api/mcp/asset/fcb02d62-d63e-4d1c-9e39-da6ad50afe96',
    status: '2 hari lagi',
    description:
      'Beasiswa nasional untuk siswa SMA berprestasi yang ingin melanjutkan ke perguruan tinggi.',
    longDescription:
      'Beasiswa Jaya 2026 diselenggarakan Kemdikbud untuk siswa SMA/SMK/MA berprestasi. Program ini menanggung biaya pendidikan, living cost, dan pendampingan akademik selama persiapan masuk perguruan tinggi dalam maupun luar negeri.',
    deadline: '30 Jun 2026',
    deadlineAt: '2026-06-30T23:59:59.000Z',
    quota: '100 Mhs',
    funding: 'Penuh',
    requirements: [
      'Warga Negara Indonesia (WNI).',
      'Siswa kelas XII SMA/SMK/MA sederajat dengan rata-rata rapor minimal 85.',
      'Memiliki prestasi akademik atau non-akademik tingkat kabupaten/kota ke atas.',
      'Lulus seleksi administrasi dan wawancara Kemdikbud.',
    ],
    sortDate: 20260526,
    popularity: 95,
  },
  {
    id: 'osn-informatika-2026',
    title: 'OSN Informatika 2026',
    provider: 'Puspresnas',
    category: 'kompetisi',
    categoryLabel: 'Kompetisi',
    categoryTag: 'KOMPETISI',
    educationLevels: ['SMP', 'SMA'],
    imageUri:
      'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b',
    status: 'Terbuka',
    description:
      'Olimpiade Sains Nasional bidang Informatika untuk siswa SMP dan SMA.',
    longDescription:
      'OSN Informatika 2026 adalah kompetisi algoritma dan pemrograman tingkat nasional. Peserta menyelesaikan soal komputasi berbasis logika, struktur data, dan problem solving dalam waktu terbatas.',
    deadline: '15 Okt 2026',
    deadlineAt: '2026-10-15T23:59:59.000Z',
    quota: '50 Mhs',
    prizeAmountIdr: convertToIdr(1500, 'USD'),
    requirements: [
      'Terdaftar sebagai siswa SMP atau SMA aktif.',
      'Lolos seleksi tingkat provinsi bidang Informatika.',
      'Menguasai dasar pemrograman (C++, Python, atau Pascal).',
      'Didampingi guru pembimbing dari sekolah asal.',
    ],
    sortDate: 20260520,
    popularity: 88,
  },
  {
    id: 'digital-talent-scholarship',
    title: 'Digital Talent Scholarship',
    provider: 'Kominfo',
    category: 'beasiswa',
    categoryLabel: 'Beasiswa',
    categoryTag: 'BEASISWA',
    educationLevels: ['SMA'],
    imageUri:
      'https://www.figma.com/api/mcp/asset/693fdd59-a874-437a-8d3b-31dcd426538d',
    status: '12 hari lagi',
    description:
      'Beasiswa talenta digital untuk siswa SMA yang tertarik bidang TI.',
    longDescription:
      'Digital Talent Scholarship dari Kominfo mendukung siswa SMA yang ingin mengembangkan karier di bidang teknologi informasi. Penerima beasiswa mendapat akses bootcamp, sertifikasi, dan mentoring industri.',
    deadline: '15 Sep 2026',
    deadlineAt: '2026-09-15T23:59:59.000Z',
    quota: '75 Mhs',
    funding: 'Parsial',
    requirements: [
      'Siswa SMA kelas X–XII dengan minat di bidang teknologi.',
      'Memiliki portofolio sederhana atau sertifikat kursus digital (opsional).',
      'Bersedia mengikuti program intensif selama 6 bulan.',
      'Nilai rapor Matematika dan IPA minimal 80.',
    ],
    sortDate: 20260510,
    popularity: 82,
  },
  {
    id: 'beasiswa-smp-unggulan',
    title: 'Beasiswa SMP Unggulan',
    provider: 'Kemdikbud',
    category: 'beasiswa',
    categoryLabel: 'Beasiswa',
    categoryTag: 'BEASISWA',
    educationLevels: ['SMP'],
    imageUri:
      'https://www.figma.com/api/mcp/asset/fcb02d62-d63e-4d1c-9e39-da6ad50afe96',
    status: '5 hari lagi',
    description:
      'Beasiswa untuk siswa SMP berprestasi di seluruh Indonesia.',
    longDescription:
      'Beasiswa SMP Unggulan memberikan bantuan biaya pendidikan dan pengembangan karakter bagi siswa SMP berprestasi dari keluarga kurang mampu. Program mencakup bantuan SPP, buku, dan kegiatan pengayaan akademik.',
    deadline: '10 Jul 2026',
    deadlineAt: '2026-07-10T23:59:59.000Z',
    quota: '200 Siswa',
    funding: 'Penuh',
    requirements: [
      'Warga Negara Indonesia (WNI).',
      'Siswa SMP kelas VII–IX dengan nilai rapor unggul.',
      'Aktif dalam kegiatan ekstrakurikuler atau prestasi akademik.',
      'Surat rekomendasi dari sekolah dan surat keterangan tidak mampu (SKTM).',
    ],
    sortDate: 20260515,
    popularity: 76,
  },
  {
    id: 'kompetisi-sains-smp',
    title: 'Kompetisi Sains SMP Nasional',
    provider: 'LIPI',
    category: 'kompetisi',
    categoryLabel: 'Kompetisi',
    categoryTag: 'KOMPETISI',
    educationLevels: ['SMP'],
    imageUri:
      'https://www.figma.com/api/mcp/asset/feb26d4c-154a-4496-99d5-1dbb7127944b',
    status: 'Terbuka',
    description:
      'Kompetisi sains tingkat SMP: fisika, kimia, dan biologi.',
    longDescription:
      'Kompetisi Sains SMP Nasional diselenggarakan LIPI sebagai wadah eksplorasi ilmiah bagi siswa SMP. Peserta presentasi proyek sains, poster, dan demonstrasi eksperimen di hadapan juri nasional.',
    deadline: '20 Nov 2026',
    deadlineAt: '2026-11-20T23:59:59.000Z',
    quota: '30 Tim',
    prizeAmountIdr: 25_000_000,
    requirements: [
      'Tim terdiri dari 2–3 siswa SMP.',
      'Didampingi guru pembimbing dari sekolah.',
      'Menyertakan proposal proyek sains lengkap.',
      'Lolos babak seleksi regional sebelum final nasional.',
    ],
    sortDate: 20260501,
    popularity: 70,
  },
];

export function getProgramById(id: string) {
  return EXPLORE_PROGRAMS.find((program) => program.id === id);
}

export function getJenjangOptions(userEducationLevel: string) {
  if (userEducationLevel === 'SMA') {
    return ['SMA'] as const;
  }
  return ['SMP', 'SMA'] as const;
}

export function getProgramShareMessage(program: ExploreProgram) {
  return `Cek program ${program.title} di ScholarPath!\n\n${program.longDescription ?? program.description}`;
}
