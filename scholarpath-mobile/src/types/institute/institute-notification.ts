export type InstituteNotificationCategory = 'applicants' | 'programs' | 'system';

export type InstituteNotificationFilter = 'all' | InstituteNotificationCategory;

export type InstituteNotificationIconType =
  | 'applicants'
  | 'verified'
  | 'deadline'
  | 'program'
  | 'system';

export type InstituteNotification = {
  id: string;
  category: InstituteNotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  icon: InstituteNotificationIconType;
  actionHref?: string;
};

export type InstituteNotificationSection = {
  id: 'recent' | 'earlier';
  label: string;
  items: InstituteNotification[];
};
