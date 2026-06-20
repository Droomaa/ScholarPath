import type { NotificationRecord } from '@/src/types/shared/notification-api';
import type {
  NotificationIconType,
  StudentNotification,
} from '@/src/types/student/notification';

function inferCategory(title: string, message: string): StudentNotification['category'] {
  const text = `${title} ${message}`.toLowerCase();

  if (/pendaftaran|application|diterima|ditolak|accepted|rejected|review/.test(text)) {
    return 'applications';
  }

  if (/program|beasiswa|olimpiade|deadline|wishlist/.test(text)) {
    return 'programs';
  }

  return 'system';
}

function inferIcon(category: StudentNotification['category']): NotificationIconType {
  if (category === 'applications') {
    return 'application';
  }

  if (category === 'programs') {
    return 'program';
  }

  return 'system';
}

export function mapNotificationRecord(
  record: NotificationRecord,
  readIds: string[]
): StudentNotification {
  const id = `api-notif-${record.id}`;
  const category = inferCategory(record.title, record.message);

  return {
    id,
    category,
    title: record.title,
    message: record.message,
    createdAt: record.created_at,
    read: record.is_read || readIds.includes(id),
    icon: inferIcon(category),
    actionLabel: category === 'applications' ? 'Track Application' : undefined,
    actionHref: category === 'applications' ? '/track-application' : undefined,
  };
}

export function mapNotificationRecords(
  records: NotificationRecord[],
  readIds: string[]
): StudentNotification[] {
  return records.map((record) => mapNotificationRecord(record, readIds));
}

export function mergeStudentNotifications(
  apiNotifications: StudentNotification[],
  localNotifications: StudentNotification[]
): StudentNotification[] {
  const merged = new Map<string, StudentNotification>();

  [...apiNotifications, ...localNotifications].forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
