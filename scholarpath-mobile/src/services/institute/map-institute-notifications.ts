import { apiRequest } from '@/src/services/api/client';
import type { InstituteApplicant, InstituteProgram } from '@/src/types/institute/institute';
import type {
  InstituteNotification,
  InstituteNotificationIconType,
} from '@/src/types/institute/institute-notification';

export type BackendNotificationRecord = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
};

export type GetNotificationsResponse = {
  data: BackendNotificationRecord[] | null;
};

export async function fetchInstituteNotifications(token: string) {
  return apiRequest<GetNotificationsResponse>('/api/user/notifications', { token });
}

function inferCategory(title: string, message: string): InstituteNotification['category'] {
  const text = `${title} ${message}`.toLowerCase();

  if (/pendaftar|applicant|diterima|ditolak|review|lamaran/.test(text)) {
    return 'applicants';
  }

  if (/program|beasiswa|olimpiade|deadline/.test(text)) {
    return 'programs';
  }

  return 'system';
}

function inferIcon(category: InstituteNotification['category']): InstituteNotificationIconType {
  if (category === 'applicants') return 'applicants';
  if (category === 'programs') return 'program';
  return 'system';
}

export function mapBackendNotifications(
  records: BackendNotificationRecord[],
  readIds: string[]
): InstituteNotification[] {
  return records.map((record) => {
    const category = inferCategory(record.title, record.message);

    return {
      id: `api-notif-${record.id}`,
      category,
      title: record.title,
      message: record.message,
      createdAt: record.created_at,
      read: record.is_read || readIds.includes(`api-notif-${record.id}`),
      icon: inferIcon(category),
      actionHref:
        category === 'applicants'
          ? '/(institute-tabs)/applicants?status=pending'
          : category === 'programs'
            ? '/(institute-tabs)/programs'
            : '/(institute-tabs)',
    };
  });
}

export function buildApplicantActivityNotifications(
  applicants: InstituteApplicant[],
  programs: InstituteProgram[],
  readIds: string[]
): InstituteNotification[] {
  const items: InstituteNotification[] = [];

  applicants.forEach((applicant) => {
    const program = programs.find((entry) => entry.title === applicant.programTitle);
    const submittedAt = applicant.submittedAt ?? new Date().toISOString();
    const baseId = `activity-${applicant.id}`;

    if (applicant.status === 'pending') {
      items.push({
        id: `${baseId}-new`,
        category: 'applicants',
        title: 'Pendaftar Baru',
        message: `${applicant.name} mendaftar pada program "${applicant.programTitle}".`,
        createdAt: submittedAt,
        read: readIds.includes(`${baseId}-new`),
        icon: 'applicants',
        actionHref: program
          ? `/institute-applicant/${applicant.id}`
          : '/(institute-tabs)/applicants?status=pending',
      });
      return;
    }

    if (applicant.status === 'accepted') {
      items.push({
        id: `${baseId}-accepted`,
        category: 'applicants',
        title: 'Pendaftar Diterima',
        message: `${applicant.name} diterima pada program "${applicant.programTitle}".`,
        createdAt: submittedAt,
        read: readIds.includes(`${baseId}-accepted`),
        icon: 'verified',
        actionHref: `/institute-applicant/${applicant.id}`,
      });
      return;
    }

    if (applicant.status === 'rejected') {
      items.push({
        id: `${baseId}-rejected`,
        category: 'applicants',
        title: 'Pendaftar Ditolak',
        message: `${applicant.name} ditolak pada program "${applicant.programTitle}".`,
        createdAt: submittedAt,
        read: readIds.includes(`${baseId}-rejected`),
        icon: 'applicants',
        actionHref: '/(institute-tabs)/applicants?status=rejected',
      });
    }
  });

  return items;
}

export function mergeInstituteNotifications(
  apiNotifications: InstituteNotification[],
  activityNotifications: InstituteNotification[]
): InstituteNotification[] {
  const merged = new Map<string, InstituteNotification>();

  [...apiNotifications, ...activityNotifications].forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function resolveInstituteNotificationError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Gagal memuat notifikasi.';
}
