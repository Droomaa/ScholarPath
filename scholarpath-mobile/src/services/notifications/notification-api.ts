import { apiRequest } from '@/src/services/api/client';
import type { GetNotificationsResponse } from '@/src/types/shared/notification-api';

export async function getNotifications(token: string) {
  return apiRequest<GetNotificationsResponse>('/api/user/notifications', { token });
}
