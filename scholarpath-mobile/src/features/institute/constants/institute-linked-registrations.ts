import { RegistrationApplication } from '@/src/types/shared/application';

/** Registrations linked to institute-side applicants for accept/reject sync. */
export const INSTITUTE_LINKED_REGISTRATIONS: RegistrationApplication[] = [
  {
    id: 'reg-stem-amara',
    title: 'STEM Research Fellowship',
    provider: 'ScholarPath Institute',
    categoryTag: 'STEM FELLOWSHIP',
    programId: 'prog-stem-fellowship',
    status: 'review',
    reviewProgress: 60,
    reviewLabel: 'Under Institute Review',
    submittedAt: '15 Jan 2025',
    timeline: [
      {
        title: 'Application Submitted',
        subtitle: 'Completed on 15 Jan 2025',
        status: 'done',
      },
      {
        title: 'Institute Review',
        subtitle: 'Your application is being reviewed',
        status: 'active',
      },
      {
        title: 'Final Decision',
        subtitle: 'Awaiting institute decision',
        status: 'pending',
      },
    ],
  },
  {
    id: 'reg-tech-andi',
    title: 'Tech Innovators Grant',
    provider: 'ScholarPath Institute',
    categoryTag: 'TECH GRANT',
    programId: 'prog-tech-innovators',
    status: 'review',
    reviewProgress: 40,
    reviewLabel: 'Document Verification',
    submittedAt: '20 Jan 2025',
    timeline: [
      {
        title: 'Application Submitted',
        subtitle: 'Completed on 20 Jan 2025',
        status: 'done',
      },
      {
        title: 'Institute Review',
        subtitle: 'Documents under verification',
        status: 'active',
      },
      {
        title: 'Final Decision',
        subtitle: 'Awaiting institute decision',
        status: 'pending',
      },
    ],
  },
  {
    id: 'reg-stem-dewi',
    title: 'STEM Research Fellowship',
    provider: 'ScholarPath Institute',
    categoryTag: 'STEM FELLOWSHIP',
    programId: 'prog-stem-fellowship',
    status: 'review',
    reviewProgress: 55,
    reviewLabel: 'Under Institute Review',
    submittedAt: '18 Jan 2025',
    timeline: [
      {
        title: 'Application Submitted',
        subtitle: 'Completed on 18 Jan 2025',
        status: 'done',
      },
      {
        title: 'Institute Review',
        subtitle: 'Your application is being reviewed',
        status: 'active',
      },
      {
        title: 'Final Decision',
        subtitle: 'Awaiting institute decision',
        status: 'pending',
      },
    ],
  },
  {
    id: 'reg-tech-fajar',
    title: 'Tech Innovators Grant',
    provider: 'ScholarPath Institute',
    categoryTag: 'TECH GRANT',
    programId: 'prog-tech-innovators',
    status: 'review',
    reviewProgress: 35,
    reviewLabel: 'Initial Screening',
    submittedAt: '22 Jan 2025',
    timeline: [
      {
        title: 'Application Submitted',
        subtitle: 'Completed on 22 Jan 2025',
        status: 'done',
      },
      {
        title: 'Institute Review',
        subtitle: 'Application in screening queue',
        status: 'active',
      },
      {
        title: 'Final Decision',
        subtitle: 'Awaiting institute decision',
        status: 'pending',
      },
    ],
  },
  {
    id: 'reg-leadership-putri',
    title: 'Global Leadership Award',
    provider: 'ScholarPath Institute',
    categoryTag: 'LEADERSHIP',
    programId: 'prog-leadership-award',
    status: 'review',
    reviewProgress: 50,
    reviewLabel: 'Under Institute Review',
    submittedAt: '12 Jan 2025',
    timeline: [
      {
        title: 'Application Submitted',
        subtitle: 'Completed on 12 Jan 2025',
        status: 'done',
      },
      {
        title: 'Institute Review',
        subtitle: 'Application under evaluation',
        status: 'active',
      },
      {
        title: 'Final Decision',
        subtitle: 'Awaiting institute decision',
        status: 'pending',
      },
    ],
  },
];
