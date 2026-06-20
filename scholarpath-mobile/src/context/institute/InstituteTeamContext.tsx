import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  DEFAULT_INSTITUTE_TEAM_MEMBERS,
  getInitialsFromName,
  type InstituteTeamMember,
} from '@/src/features/institute/constants/institute-team-members';

type InstituteTeamContextValue = {
  members: InstituteTeamMember[];
  updateMember: (id: string, updates: Partial<InstituteTeamMember>) => void;
  getMemberById: (id: string) => InstituteTeamMember | undefined;
};

const InstituteTeamContext = createContext<InstituteTeamContextValue | null>(null);

export function InstituteTeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<InstituteTeamMember[]>(DEFAULT_INSTITUTE_TEAM_MEMBERS);

  const value = useMemo<InstituteTeamContextValue>(
    () => ({
      members,
      updateMember: (id, updates) =>
        setMembers((prev) =>
          prev.map((member) => {
            if (member.id !== id) return member;

            const next = { ...member, ...updates };
            if (updates.name !== undefined) {
              next.initials = getInitialsFromName(next.name);
            }
            return next;
          })
        ),
      getMemberById: (id) => members.find((member) => member.id === id),
    }),
    [members]
  );

  return (
    <InstituteTeamContext.Provider value={value}>{children}</InstituteTeamContext.Provider>
  );
}

export function useInstituteTeam() {
  const context = useContext(InstituteTeamContext);
  if (!context) {
    throw new Error('useInstituteTeam must be used within InstituteTeamProvider');
  }
  return context;
}
