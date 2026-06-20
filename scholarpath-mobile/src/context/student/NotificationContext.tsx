import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { useWishlist } from '@/src/context/student/WishlistContext';
import {
  buildStudentNotifications,
  filterNotifications,
  groupNotificationsBySection,
} from '@/src/features/student/notifications/utils/build-notifications';
import { getNotifications, mapNotificationRecords, mergeStudentNotifications } from '@/src/services/notifications';
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
  isLoading: boolean;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { registrations, activePrograms, refreshRegistrations } = useApplications();
  const session = useStudentSession();
  const { wishlistIds } = useWishlist();
  const { token, isAuthenticated } = session;

  const [apiNotifications, setApiNotifications] = useState<StudentNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [isLoading, setIsLoading] = useState(false);

  const localNotifications = useMemo(
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

  const loadNotifications = useCallback(async () => {
    if (!token) {
      setApiNotifications([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await getNotifications(token);
      setApiNotifications(mapNotificationRecords(response.data ?? [], []));
    } catch {
      setApiNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      void loadNotifications();
      return;
    }

    setApiNotifications([]);
  }, [isAuthenticated, token, loadNotifications, registrations]);

  const notifications = useMemo(() => {
    return mergeStudentNotifications(apiNotifications, localNotifications).map((item) => ({
      ...item,
      read: item.read || readIds.includes(item.id),
    }));
  }, [apiNotifications, localNotifications, readIds]);

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
      isLoading,
      setFilter,
      markAsRead: (id: string) =>
        setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      markAllAsRead: () =>
        setReadIds((prev) => {
          const nextIds = new Set(prev);
          notifications.forEach((item) => nextIds.add(item.id));
          return Array.from(nextIds);
        }),
      refresh: async () => {
        await Promise.all([loadNotifications(), refreshRegistrations()]);
      },
    }),
    [
      notifications,
      filteredNotifications,
      sections,
      unreadCount,
      filter,
      isLoading,
      loadNotifications,
      refreshRegistrations,
    ]
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
