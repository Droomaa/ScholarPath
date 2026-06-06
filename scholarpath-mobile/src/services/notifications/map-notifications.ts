import type { NotificationRecord } from '@/src/types/shared/notification-api';
import type { StudentNotification } from '@/src/types/student/notification';

export function mapNotificationRecord(
  record: NotificationRecord,
  readIds: string[]
): StudentNotification {
  const id = `api-notif-${record.id}`;

  return {
    id,
    category: 'system',
    title: record.title,
    message: record.message,
    createdAt: record.created_at,
    read: record.is_read || readIds.includes(id),
    icon: 'system',
  };
}

export function mapNotificationRecords(
  records: NotificationRecord[],
  readIds: string[]
): StudentNotification[] {
  return records.map((record) => mapNotificationRecord(record, readIds));
}
