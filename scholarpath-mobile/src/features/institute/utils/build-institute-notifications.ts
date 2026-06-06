import {
  type InstituteNotification,
  type InstituteNotificationFilter,
  type InstituteNotificationSection,
} from '@/src/types/institute/institute-notification';

export function filterInstituteNotifications(
  notifications: InstituteNotification[],
  filter: InstituteNotificationFilter
) {
  if (filter === 'all') return notifications;
  return notifications.filter((item) => item.category === filter);
}

export function groupInstituteNotificationsBySection(
  notifications: InstituteNotification[]
): InstituteNotificationSection[] {
  const recent = notifications.filter((item) => {
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    return diffMs < 24 * 60 * 60 * 1000;
  });
  const earlier = notifications.filter((item) => {
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    return diffMs >= 24 * 60 * 60 * 1000;
  });

  const sections: InstituteNotificationSection[] = [];
  if (recent.length > 0) sections.push({ id: 'recent', label: 'RECENT', items: recent });
  if (earlier.length > 0) sections.push({ id: 'earlier', label: 'EARLIER', items: earlier });
  return sections;
}
