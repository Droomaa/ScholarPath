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
import { getNotifications, mapNotificationRecords } from '@/src/services/notifications';
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
  isUsingFallback: boolean;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { registrations, activePrograms } = useApplications();
  const session = useStudentSession();
  const { wishlistIds } = useWishlist();
  const { token, isAuthenticated } = session;

  const [apiNotifications, setApiNotifications] = useState<StudentNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const fallbackNotifications = useMemo(
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
      setIsUsingFallback(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await getNotifications(token);
      setApiNotifications(mapNotificationRecords(response.data ?? [], []));
      setIsUsingFallback(false);
    } catch {
      setApiNotifications([]);
      setIsUsingFallback(true);
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
    setIsUsingFallback(true);
  }, [isAuthenticated, token, loadNotifications]);

  const notifications = useMemo(() => {
    if (isUsingFallback) {
      return fallbackNotifications;
    }

    return apiNotifications.map((item) => ({
      ...item,
      read: item.read || readIds.includes(item.id),
    }));
  }, [apiNotifications, fallbackNotifications, isUsingFallback, readIds]);

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
      isUsingFallback,
      setFilter,
      markAsRead: (id: string) =>
        setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      markAllAsRead: () =>
        setReadIds((prev) => {
          const nextIds = new Set(prev);
          notifications.forEach((item) => nextIds.add(item.id));
          return Array.from(nextIds);
        }),
      refresh: loadNotifications,
    }),
    [
      notifications,
      filteredNotifications,
      sections,
      unreadCount,
      filter,
      isLoading,
      isUsingFallback,
      loadNotifications,
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
