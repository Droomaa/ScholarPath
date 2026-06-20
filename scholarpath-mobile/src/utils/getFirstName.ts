export function getFirstName(fullName: string) {
  const trimmed = fullName.trim();
  if (!trimmed) return 'Siswa';
  return trimmed.split(/\s+/)[0] ?? 'Siswa';
}
