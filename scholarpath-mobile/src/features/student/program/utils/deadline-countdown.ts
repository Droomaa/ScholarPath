export type DeadlineCountdown = {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
};

export function getDeadlineCountdown(deadlineAt: string): DeadlineCountdown {
  const target = new Date(deadlineAt).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, expired: false };
}

export function formatCountdownUnit(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDaysLeftLabel(deadlineAt: string) {
  const { days, expired } = getDeadlineCountdown(deadlineAt);
  if (expired) return 'Deadline lewat';
  if (days === 0) return 'Hari ini';
  if (days === 1) return '1 hari lagi';
  return `${days} hari lagi`;
}
