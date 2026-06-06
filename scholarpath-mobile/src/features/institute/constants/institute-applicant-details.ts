import {
  type ApplicantAchievement,
  type ApplicantSkill,
  type ApplicantUploadedDocument,
  type InstituteApplicant,
  type InstituteApplicantDetail,
} from '@/src/types/institute/institute';
import { parseKeahlian } from '@/src/services/profile/map-profile';

const MOCK_PDF_URI = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export type ApplicantDetailFields = Omit<
  InstituteApplicantDetail,
  keyof InstituteApplicant
>;

const DEFAULT_MOTIVATION =
  'I chose this program because it aligns with my interests in learning, problem-solving, and innovation. I am eager to learn from experienced mentors, gain new perspectives, and challenge myself through meaningful projects. This opportunity will help me build valuable skills and prepare for my future academic and career goals.';

const DEFAULT_DOCUMENTS: ApplicantUploadedDocument[] = [
  {
    id: 'doc-transcript',
    title: 'Academic Transcript',
    verificationStatus: 'verified',
    sizeLabel: '2.4 MB',
    uri: MOCK_PDF_URI,
    iconType: 'pdf',
  },
  {
    id: 'doc-id',
    title: 'ID Card (KTP/Passport)',
    verificationStatus: 'verified',
    sizeLabel: '1.1 MB',
    uri: MOCK_PDF_URI,
    iconType: 'id',
  },
  {
    id: 'doc-recommendation',
    title: 'Recommendation Letter',
    verificationStatus: 'pending',
    sizeLabel: '850 KB',
    uri: MOCK_PDF_URI,
    iconType: 'letter',
  },
];

export const APPLICANT_DETAIL_BY_ID: Record<string, ApplicantDetailFields> = {
  'app-5': {
    email: 'amara.syarianti@student.edu',
    motivationAnswer:
      'I chose this program because it aligns with my interests in technology, problem-solving, and innovation. I am eager to learn from experienced mentors, gain new perspectives, and challenge myself through meaningful projects and activities. This opportunity will help me build valuable skills and prepare for my future academic and career goals.',
    trackLabel: 'STEM Track',
    rankLabel: 'National Rank 12',
    topPercentBadge: 'TOP 5%',
    skills: [
      { name: 'Python / R', level: 'Expert' },
      { name: 'Public Speaking', level: 'Advanced' },
      { name: 'Data Viz', level: 'Expert' },
    ],
    achievements: [
      {
        title: 'Gold Medalist - OSN Computer Science 2022',
        description: 'Ranked 1st nationwide among 5,000+ applicants.',
      },
      {
        title: 'Presidential Youth Award',
        description: 'Recognized for outstanding social service projects.',
      },
    ],
    documents: [
      ...DEFAULT_DOCUMENTS,
      {
        id: 'doc-ielts',
        title: 'English Proficiency (IELTS)',
        verificationStatus: 'verified',
        sizeLabel: '1.5 MB',
        uri: MOCK_PDF_URI,
        iconType: 'certificate',
      },
    ],
  },
  'app-1': {
    email: 'andi.saputra@student.edu',
    motivationAnswer:
      'Mengapa saya tertarik mengikuti program ini adalah karena saya ingin mengembangkan kemampuan teknologi dan berkontribusi pada inovasi di bidang sains.',
    trackLabel: 'Technology Track',
    rankLabel: 'Regional Rank 8',
    topPercentBadge: 'TOP 10%',
    skills: [
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'Research Writing', level: 'Intermediate' },
    ],
    achievements: [
      {
        title: 'National Science Fair Finalist',
        description: 'Presented a renewable energy prototype project.',
      },
    ],
    documents: DEFAULT_DOCUMENTS,
  },
  'app-4': {
    email: 'dewi.lestari@student.edu',
    motivationAnswer:
      'Program ini memberi saya kesempatan untuk mengejar riset STEM tingkat lanjut dan belajar langsung dari mentor berpengalaman di bidang fellowship.',
    trackLabel: 'STEM Track',
    rankLabel: 'National Rank 24',
    skills: [
      { name: 'Laboratory Research', level: 'Expert' },
      { name: 'Statistics', level: 'Advanced' },
    ],
    achievements: [
      {
        title: 'University Research Grant Awardee',
        description: 'Funded undergraduate research in biomedical engineering.',
      },
    ],
    documents: DEFAULT_DOCUMENTS,
  },
};

function buildDefaultDetail(applicant: InstituteApplicant): ApplicantDetailFields {
  const parsed = parseKeahlian(applicant.keahlian ?? '');
  const slug = applicant.name.toLowerCase().replace(/\s+/g, '.');
  const skills: ApplicantSkill[] = parsed.skills.length
    ? parsed.skills.map((name) => ({ name, level: 'Advanced' as const }))
    : [{ name: 'Communication', level: 'Advanced' }];

  const achievements: ApplicantAchievement[] =
    parsed.interests.length > 0
      ? parsed.interests.map((interest) => ({
          title: interest,
          description: 'Listed in student profile interests.',
        }))
      : [
          {
            title: 'Academic Excellence Award',
            description: 'Recognized for consistent high performance in school.',
          },
        ];

  return {
    email: applicant.studentEmail ?? `${slug}@student.edu`,
    motivationAnswer: applicant.keahlian?.trim()
      ? `Profil keahlian siswa: ${applicant.keahlian}`
      : DEFAULT_MOTIVATION,
    trackLabel: `${applicant.major} Track`,
    skills,
    achievements,
    documents: DEFAULT_DOCUMENTS,
  };
}

export function buildApplicantDetail(applicant: InstituteApplicant): InstituteApplicantDetail {
  const detail = APPLICANT_DETAIL_BY_ID[applicant.id] ?? buildDefaultDetail(applicant);
  return {
    ...applicant,
    ...detail,
  };
}
