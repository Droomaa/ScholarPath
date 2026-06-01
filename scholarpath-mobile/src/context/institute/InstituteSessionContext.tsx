import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  defaultInstituteSession,
  type InstituteSessionContextValue,
  type InstituteSessionState,
} from '@/src/types/institute/institute';

const InstituteSessionContext = createContext<InstituteSessionContextValue | null>(null);

export function InstituteSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<InstituteSessionState>(defaultInstituteSession);

  const value = useMemo<InstituteSessionContextValue>(
    () => ({
      ...session,
      signInAsInstitute: ({ instituteName, email, contactNumber, address, about, isNewAccount } = {}) => {
        const derivedName =
          instituteName?.trim() ||
          (email?.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : '') ||
          'Institusi';

        const trimmedAbout = about?.trim() ?? '';
        const defaultAbout = trimmedAbout
          ? trimmedAbout
          : `${derivedName} is dedicated to bridging traditional education and the digital economy. We provide world-class scholarships and grants to empower the next generation of innovators and global leaders.`;

        const eightMonthsAgo = new Date();
        eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);

        setSession({
          instituteName: derivedName,
          email: email?.trim() ?? '',
          contactNumber: contactNumber?.trim() ?? '',
          address: address?.trim() ?? '',
          about: defaultAbout,
          logoUri: '',
          memberSince: isNewAccount ? new Date().toISOString() : eightMonthsAgo.toISOString(),
        });
      },
      updateInstituteProfile: (updates) =>
        setSession((prev) => ({
          ...prev,
          ...updates,
        })),
      signOut: () => setSession(defaultInstituteSession),
    }),
    [session]
  );

  return (
    <InstituteSessionContext.Provider value={value}>{children}</InstituteSessionContext.Provider>
  );
}

export function useInstituteSession() {
  const context = useContext(InstituteSessionContext);
  if (!context) {
    throw new Error('useInstituteSession must be used within InstituteSessionProvider');
  }
  return context;
}
