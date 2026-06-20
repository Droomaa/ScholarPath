import { API_BASE_URL } from '@/src/config/api';

export function resolveUploadUrl(fileUrl: string | undefined): string | undefined {
  if (!fileUrl?.trim()) {
    return undefined;
  }

  const trimmed = fileUrl.trim();

  if (trimmed.startsWith('/uploads/')) {
    return `${API_BASE_URL}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const isLocalHost =
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '10.0.2.2';

    if (isLocalHost) {
      return `${API_BASE_URL}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}
