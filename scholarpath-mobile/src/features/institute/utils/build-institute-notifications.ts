import { INSTITUTE_APPLICANTS } from '@/src/features/institute/constants/institute-applicants';
import { INSTITUTE_PROGRAMS } from '@/src/features/institute/constants/institute-programs';
import {
  type InstituteNotification,
  type InstituteNotificationFilter,
  type InstituteNotificationSection,
} from '@/src/types/institute/institute-notification';

function minutesAgoIso(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function withReadState(
  notification: Omit<InstituteNotification, 'read'>,
  readIds: string[]
): InstituteNotification {
  return {
    ...notification,
    read: readIds.includes(notification.id),
  };
}

export function buildInstituteNotifications(readIds: string[]): InstituteNotification[] {
  const pendingApplicants = INSTITUTE_APPLICANTS.filter((a) => a.status === 'pending');
  const latestPending = pendingApplicants[0];
  const activeProgram = INSTITUTE_PROGRAMS.find((p) => p.status === 'active');
  const reviewProgram = INSTITUTE_PROGRAMS.find((p) => p.status === 'review');

  const items: Omit<InstituteNotification, 'read'>[] = [
    {
      id: 'inst-new-applicants',
      category: 'applicants',
      title: 'New Applicants!',
      message: latestPending
        ? `New applicants for the "${latestPending.programTitle}" program have been received.`
        : 'New applicants have been received for your active programs.',
      createdAt: minutesAgoIso(5),
      icon: 'applicants',
      actionHref: '/(institute-tabs)/applicants?status=pending',
    },
    {
      id: 'inst-verified-applicants',
      category: 'applicants',
      title: 'Verified Applicants',
      message: 'Verified applicants in your program!',
      createdAt: daysAgoIso(1),
      icon: 'verified',
      actionHref: '/(institute-tabs)/applicants?status=accepted',
    },
    {
      id: 'inst-upcoming-deadline',
      category: 'programs',
      title: 'Upcoming Deadline',
      message: activeProgram
        ? `'${activeProgram.title}' will be closed in 24 hours.`
        : 'One of your programs will close soon.',
      createdAt: daysAgoIso(2),
      icon: 'deadline',
      actionHref: '/(institute-tabs)/programs?status=active',
    },
    {
      id: 'inst-pending-documents',
      category: 'applicants',
      title: 'Pending Documents',
      message: 'Check all the documents!',
      createdAt: daysAgoIso(3),
      icon: 'program',
      actionHref: '/(institute-tabs)/applicants?status=pending',
    },
    {
      id: 'inst-program-review',
      category: 'programs',
      title: 'Program Needs Review',
      message: reviewProgram
        ? `"${reviewProgram.title}" has ${reviewProgram.pendingCount} pending reviews.`
        : 'Programs with pending reviews need your attention.',
      createdAt: daysAgoIso(4),
      icon: 'program',
      actionHref: '/(institute-tabs)/programs?status=review',
    },
    {
      id: 'inst-welcome',
      category: 'system',
      title: 'Welcome to ScholarPath Institute',
      message: 'Manage programs, review applicants, and track deadlines from your dashboard.',
      createdAt: daysAgoIso(5),
      icon: 'system',
      actionHref: '/(institute-tabs)',
    },
    {
      id: 'inst-system-update',
      category: 'system',
      title: 'Platform Update',
      message: 'New analytics tools are now available in Detailed Analytics.',
      createdAt: daysAgoIso(6),
      icon: 'system',
      actionHref: '/institute-analytics',
    },
  ];

  return items
    .map((item) => withReadState(item, readIds))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

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
