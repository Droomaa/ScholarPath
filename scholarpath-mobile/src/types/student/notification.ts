export type NotificationCategory = 'applications' | 'programs' | 'system';

export type NotificationFilter = 'all' | NotificationCategory;

export type NotificationIconType =
  | 'application'
  | 'ai'
  | 'verified'
  | 'deadline'
  | 'program'
  | 'system';

export type StudentNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  icon: NotificationIconType;
  actionLabel?: string;
  actionHref?: string;
};

export type NotificationSection = {
  id: 'recent' | 'earlier';
  label: string;
  items: StudentNotification[];
};
