import { API_BASE_URL } from '@/src/config/api';

import { ApiError } from './client';

export type UploadFileResponse = {
  message: string;
  file_url: string;
  file_name: string;
};

export async function uploadPdfFile(
  token: string,
  file: { uri: string; name: string; size: number }
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: 'application/pdf',
  } as unknown as Blob);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    throw new ApiError(
      `Tidak dapat mengunggah file ke server (${API_BASE_URL}).`,
      0
    );
  }

  let payload: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text ? { error: text } : null;
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof (payload as { error: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : `Upload failed (${response.status})`;

    throw new ApiError(message, response.status);
  }

  return payload as UploadFileResponse;
}
