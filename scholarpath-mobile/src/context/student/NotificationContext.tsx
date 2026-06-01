import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { useWishlist } from '@/src/context/student/WishlistContext';
import {
  buildStudentNotifications,
  filterNotifications,
  groupNotificationsBySection,
} from '@/src/features/student/notifications/utils/build-notifications';
import {
  type NotificationFilter,
  type NotificationSection,
  type StudentNotification,
} from '@/src/types/student/notification';

type NotificationContextValue = {
  notifications: StudentNotification[];
  filteredNotifications: StudentNotification[];
  sections: NotificationSection[];
  unreadCount: number;
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { registrations, activePrograms } = useApplications();
  const session = useStudentSession();
  const { wishlistIds } = useWishlist();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const notifications = useMemo(
    () =>
      buildStudentNotifications({
        registrations,
        activePrograms,
        wishlistIds,
        session,
        readIds,
      }),
    [registrations, activePrograms, wishlistIds, session, readIds]
  );

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, filter),
    [notifications, filter]
  );

  const sections = useMemo(
    () => groupNotificationsBySection(filteredNotifications),
    [filteredNotifications]
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      filteredNotifications,
      sections,
      unreadCount,
      filter,
      setFilter,
      markAsRead: (id: string) =>
        setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      markAllAsRead: () =>
        setReadIds((prev) => {
          const nextIds = new Set(prev);
          notifications.forEach((item) => nextIds.add(item.id));
          return Array.from(nextIds);
        }),
    }),
    [notifications, filteredNotifications, sections, unreadCount, filter]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
