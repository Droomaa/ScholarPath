import { type InstituteProgram, type InstituteProgramDocument } from '@/src/types/institute/institute';

const MOCK_TEMPLATE_PDF =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const DEFAULT_DOCUMENTS: InstituteProgramDocument[] = [
  {
    id: 'doc-transcript',
    title: 'Academic Transcript',
    description: 'Official digital records from 2021–2023',
    icon: 'document-text-outline',
    templateUrl: MOCK_TEMPLATE_PDF,
    templateFileName: 'transcript-template.pdf',
    templateSizeLabel: '240 KB',
  },
  {
    id: 'doc-id',
    title: 'ID Card',
    description: 'Government issued identification',
    icon: 'card-outline',
  },
  {
    id: 'doc-recommendation',
    title: 'Recommendation Letter',
    description: 'At least two from senior faculty',
    icon: 'mail-outline',
    templateUrl: MOCK_TEMPLATE_PDF,
    templateFileName: 'recommendation-letter-template.pdf',
    templateSizeLabel: '180 KB',
  },
];

const STEM_DOCUMENTS: InstituteProgramDocument[] = [
  {
    id: 'doc-transcript',
    title: 'Academic Transcript',
    description: 'STEM-related coursework records',
    icon: 'document-text-outline',
    templateUrl: MOCK_TEMPLATE_PDF,
    templateFileName: 'stem-transcript-template.pdf',
    templateSizeLabel: '240 KB',
  },
  {
    id: 'doc-portfolio',
    title: 'Research Portfolio',
    description: 'Summary of prior research or projects',
    icon: 'ribbon-outline',
    templateUrl: MOCK_TEMPLATE_PDF,
    templateFileName: 'research-portfolio-template.pdf',
    templateSizeLabel: '320 KB',
  },
  {
    id: 'doc-id',
    title: 'ID Card',
    description: 'Government issued identification',
    icon: 'card-outline',
  },
];

const CLOSED_DOCUMENTS: InstituteProgramDocument[] = [
  {
    id: 'doc-transcript',
    title: 'Academic Transcript',
    description: 'Final submission records on file',
    icon: 'document-text-outline',
  },
  {
    id: 'doc-id',
    title: 'ID Card',
    description: 'Verified identification copy',
    icon: 'card-outline',
  },
];

export const INSTITUTE_PROGRAMS: InstituteProgram[] = [
  {
    id: 'prog-global-leaders-2024',
    title: 'Global Leaders Grant 2024',
    categoryTag: 'ACADEMIC EXCELLENCE',
    categoryBadgeLabel: 'Academic Excellence',
    categoryTagBg: '#E1E0FF',
    categoryTagColor: '#2F2EBE',
    applicantCount: 152,
    pendingCount: 38,
    acceptedCount: 48,
    rejectedCount: 22,
    quota: 150,
    deadlineAt: '2026-12-12T23:59:59.000Z',
    phaseLabel: 'Final Review Phase',
    status: 'active',
    heroGradient: ['#4648D4', '#6063EE', '#2F2EBE'],
    requiredDocuments: DEFAULT_DOCUMENTS,
  },
  {
    id: 'prog-stem-fellowship',
    title: 'STEM Research Fellowship',
    categoryTag: 'POST-GRADUATE',
    categoryBadgeLabel: 'Post-Graduate',
    categoryTagBg: '#DAE2FD',
    categoryTagColor: '#5C647A',
    applicantCount: 84,
    pendingCount: 22,
    acceptedCount: 31,
    rejectedCount: 12,
    quota: 100,
    deadlineAt: '2026-11-30T23:59:59.000Z',
    phaseLabel: 'Application Closing',
    status: 'active',
    heroGradient: ['#2F2EBE', '#4648D4', '#131B2E'],
    requiredDocuments: STEM_DOCUMENTS,
  },
  {
    id: 'prog-tech-innovators',
    title: 'Tech Innovators Grant',
    categoryTag: 'STEM',
    categoryBadgeLabel: 'STEM Innovation',
    categoryTagBg: '#E1E0FF',
    categoryTagColor: '#2F2EBE',
    applicantCount: 124,
    pendingCount: 45,
    acceptedCount: 52,
    rejectedCount: 27,
    quota: 120,
    deadlineAt: '2026-06-15T23:59:59.000Z',
    phaseLabel: 'Final Review Phase',
    status: 'active',
    heroGradient: ['#6063EE', '#4648D4', '#9C48EA'],
    requiredDocuments: STEM_DOCUMENTS,
  },
  {
    id: 'prog-leadership-award',
    title: 'Global Leadership Award',
    categoryTag: 'LEADERSHIP',
    categoryBadgeLabel: 'Leadership',
    categoryTagBg: '#DAE2FD',
    categoryTagColor: '#5C647A',
    applicantCount: 342,
    pendingCount: 89,
    acceptedCount: 156,
    rejectedCount: 97,
    quota: 300,
    deadlineAt: '2026-06-28T23:59:59.000Z',
    phaseLabel: 'Application Closing',
    status: 'review',
    heroGradient: ['#4648D4', '#2C2ABC', '#131B2E'],
    requiredDocuments: DEFAULT_DOCUMENTS,
  },
  {
    id: 'prog-women-stem',
    title: 'Women in STEM 2024',
    categoryTag: 'STEM',
    categoryBadgeLabel: 'Women in STEM',
    categoryTagBg: '#E1E0FF',
    categoryTagColor: '#2F2EBE',
    applicantCount: 89,
    pendingCount: 31,
    acceptedCount: 38,
    rejectedCount: 20,
    quota: 80,
    deadlineAt: '2026-07-05T23:59:59.000Z',
    phaseLabel: 'Interview Scheduling',
    status: 'review',
    heroGradient: ['#9C48EA', '#6063EE', '#4648D4'],
    requiredDocuments: STEM_DOCUMENTS,
  },
  {
    id: 'prog-community-reach',
    title: 'Community Reach Grant',
    categoryTag: 'SOCIAL IMPACT',
    categoryBadgeLabel: 'Social Impact',
    categoryTagBg: '#E4E1ED',
    categoryTagColor: '#464554',
    applicantCount: 210,
    pendingCount: 0,
    acceptedCount: 168,
    rejectedCount: 42,
    quota: 200,
    deadlineAt: '2025-10-15T23:59:59.000Z',
    phaseLabel: 'Closed',
    status: 'closed',
    heroGradient: ['#565E74', '#464554', '#131B2E'],
    requiredDocuments: CLOSED_DOCUMENTS,
  },
  {
    id: 'prog-digital-leadership',
    title: 'Digital Leadership Program',
    categoryTag: 'TECHNOLOGY',
    categoryBadgeLabel: 'Technology',
    categoryTagBg: '#E4E1ED',
    categoryTagColor: '#464554',
    applicantCount: 178,
    pendingCount: 0,
    acceptedCount: 142,
    rejectedCount: 36,
    quota: 175,
    deadlineAt: '2025-09-01T23:59:59.000Z',
    phaseLabel: 'Closed',
    status: 'closed',
    heroGradient: ['#464554', '#2F2EBE', '#131B2E'],
    requiredDocuments: CLOSED_DOCUMENTS,
  },
];

export function getInstituteProgramById(id: string) {
  return INSTITUTE_PROGRAMS.find((program) => program.id === id);
}

export function getProgramsByTab(tab: 'active' | 'review' | 'closed') {
  const programs = INSTITUTE_PROGRAMS.filter((program) => program.status === tab);

  if (tab === 'active') {
    return [...programs].sort(
      (a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()
    );
  }

  if (tab === 'review') {
    return [...programs].sort((a, b) => b.pendingCount - a.pendingCount);
  }

  return [...programs].sort(
    (a, b) => new Date(b.deadlineAt).getTime() - new Date(a.deadlineAt).getTime()
  );
}

export function getActiveProgramsForDeadlines() {
  return getProgramsByTab('active').slice(0, 3);
}

export function formatDeadlineLabel(deadlineAt: string, isClosed = false) {
  if (isClosed) {
    const date = new Date(deadlineAt);
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `Closed ${month} ${date.getDate()}`;
  }

  const date = new Date(deadlineAt);
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `Ends ${month} ${date.getDate()}`;
}

export function formatProgramDeadlineFull(deadlineAt: string) {
  const date = new Date(deadlineAt);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function isProgramOverfilled(program: InstituteProgram) {
  return program.applicantCount > program.quota;
}

export function getProgramPendingCount(program: InstituteProgram) {
  return Math.max(
    0,
    program.applicantCount - program.acceptedCount - program.rejectedCount
  );
}

export function getDaysLeft(deadlineAt: string) {
  const diffMs = new Date(deadlineAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatDeadlineDateBlock(deadlineAt: string) {
  const date = new Date(deadlineAt);
  return {
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

export function getDaysLeftLabel(days: number) {
  return `${days} Day${days === 1 ? '' : 's'} Left`;
}

export function getDaysLeftColor(days: number) {
  if (days <= 7) return '#BA1A1A';
  if (days <= 14) return '#D97706';
  return '#059669';
}
