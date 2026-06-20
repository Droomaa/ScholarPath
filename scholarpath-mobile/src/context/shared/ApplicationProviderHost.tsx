import { type ReactNode } from 'react';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';

import { ApplicationProvider } from './ApplicationContext';

export function ApplicationProviderHost({ children }: { children: ReactNode }) {
  const { userId, isAuthenticated } = useStudentSession();
  const sessionKey = isAuthenticated ? String(userId ?? 'student') : 'guest';

  return <ApplicationProvider key={sessionKey}>{children}</ApplicationProvider>;
}
