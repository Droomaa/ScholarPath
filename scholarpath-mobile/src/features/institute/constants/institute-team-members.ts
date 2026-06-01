export type InstituteTeamRole = 'Lead Admin' | 'Reviewer' | 'Coordinator';

export type InstituteTeamMember = {
  id: string;
  name: string;
  email: string;
  role: InstituteTeamRole;
  initials: string;
  avatarColor: string;
  avatarUri?: string;
  status: 'active' | 'inactive';
};

export const INSTITUTE_TEAM_ROLES: InstituteTeamRole[] = [
  'Lead Admin',
  'Reviewer',
  'Coordinator',
];

export const DEFAULT_INSTITUTE_TEAM_MEMBERS: InstituteTeamMember[] = [
  {
    id: 'team-1',
    name: 'Dr. Elena Rodriguez',
    email: 'elena.r@scholarpath.edu',
    role: 'Lead Admin',
    initials: 'ER',
    avatarColor: '#4648D4',
    status: 'active',
  },
  {
    id: 'team-2',
    name: 'Marcus Chen',
    email: 'm.chen@scholarpath.edu',
    role: 'Reviewer',
    initials: 'MC',
    avatarColor: '#9C48EA',
    status: 'active',
  },
  {
    id: 'team-3',
    name: 'Sarah Jenkins',
    email: 's.jenkins@scholarpath.edu',
    role: 'Coordinator',
    initials: 'SJ',
    avatarColor: '#9C48EA',
    status: 'active',
  },
];

const TITLE_PREFIXES = new Set(['dr.', 'mr.', 'mrs.', 'ms.', 'prof.']);

export function getInitialsFromName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => !TITLE_PREFIXES.has(part.toLowerCase()));

  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function getRoleBadgeStyle(role: InstituteTeamRole) {
  if (role === 'Lead Admin') {
    return {
      backgroundColor: '#DAE2FD',
      borderColor: 'transparent',
      color: '#131B2E',
    };
  }

  return {
    backgroundColor: '#E9E6F3',
    borderColor: 'rgba(199, 196, 215, 0.3)',
    color: '#464554',
  };
}

export function getTeamMemberById(id: string, members: InstituteTeamMember[]) {
  return members.find((member) => member.id === id);
}
