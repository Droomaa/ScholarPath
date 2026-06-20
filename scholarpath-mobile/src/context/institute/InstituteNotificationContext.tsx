import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import { useInstitutePrograms } from '@/src/context/institute/InstituteProgramsContext';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  buildApplicantActivityNotifications,
  fetchInstituteNotifications,
  mapBackendNotifications,
  mergeInstituteNotifications,
  resolveInstituteNotificationError,
} from '@/src/services/institute/map-institute-notifications';
import {
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
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  setFilter: (filter: InstituteNotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
};

const InstituteNotificationContext = createContext<InstituteNotificationContextValue | null>(null);

export function InstituteNotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useInstituteSession();
  const { applicants } = useInstituteApplicants();
  const { programs } = useInstitutePrograms();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<InstituteNotificationFilter>('all');
  const [apiRecords, setApiRecords] = useState<
    Awaited<ReturnType<typeof fetchInstituteNotifications>>['data'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent' = 'silent') => {
      if (!token || !isAuthenticated) {
        setApiRecords(null);
        setError(null);
        return;
      }

      if (mode === 'initial') {
        setIsLoading(true);
      }
      if (mode === 'refresh') {
        setIsRefreshing(true);
      }

      try {
        const response = await fetchInstituteNotifications(token);
        setApiRecords(response.data ?? []);
        setError(null);
      } catch (err) {
        setError(resolveInstituteNotificationError(err));
      } finally {
        if (mode === 'initial') {
          setIsLoading(false);
        }
        if (mode === 'refresh') {
          setIsRefreshing(false);
        }
      }
    },
    [token, isAuthenticated]
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setApiRecords(null);
      setError(null);
      return;
    }

    void loadNotifications('initial');
  }, [isAuthenticated, token, loadNotifications]);

  const notifications = useMemo(() => {
    const apiNotifications = mapBackendNotifications(apiRecords ?? [], readIds);
    const activityNotifications = buildApplicantActivityNotifications(applicants, programs, readIds);
    return mergeInstituteNotifications(apiNotifications, activityNotifications).map((item) => ({
      ...item,
      read: item.read || readIds.includes(item.id),
    }));
  }, [apiRecords, applicants, programs, readIds]);

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
      isLoading,
      isRefreshing,
      error,
      setFilter,
      refreshNotifications: () => loadNotifications('refresh'),
      markAsRead: (id: string) =>
        setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
      markAllAsRead: () =>
        setReadIds((prev) => {
          const nextIds = new Set(prev);
          notifications.forEach((item) => nextIds.add(item.id));
          return Array.from(nextIds);
        }),
    }),
    [
      notifications,
      filteredNotifications,
      sections,
      unreadCount,
      filter,
      isLoading,
      isRefreshing,
      error,
      loadNotifications,
    ]
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
