import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  buildInstituteNotifications,
  filterInstituteNotifications,
  groupInstituteNotificationsBySection,
} from '@/src/features/institute/utils/build-institute-notifications';
import {
  type InstituteNotification,
  type InstituteNotificationFilter,
  type InstituteNotificationSection,
} from '@/src/types/institute/institute-notification';

type InstituteNotificationContextValue = {
  notifications: InstituteNotification[];
  filteredNotifications: InstituteNotification[];
  sections: InstituteNotificationSection[];
  unreadCount: number;
  filter: InstituteNotificationFilter;
  setFilter: (filter: InstituteNotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const InstituteNotificationContext = createContext<InstituteNotificationContextValue | null>(null);

export function InstituteNotificationProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<InstituteNotificationFilter>('all');

  const notifications = useMemo(
    () => buildInstituteNotifications(readIds),
    [readIds]
  );

  const filteredNotifications = useMemo(
    () => filterInstituteNotifications(notifications, filter),
    [notifications, filter]
  );

  const sections = useMemo(
    () => groupInstituteNotificationsBySection(filteredNotifications),
    [filteredNotifications]
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo<InstituteNotificationContextValue>(
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
    <InstituteNotificationContext.Provider value={value}>
      {children}
    </InstituteNotificationContext.Provider>
  );
}

export function useInstituteNotifications() {
  const context = useContext(InstituteNotificationContext);
  if (!context) {
    throw new Error('useInstituteNotifications must be used within InstituteNotificationProvider');
  }
  return context;
}
