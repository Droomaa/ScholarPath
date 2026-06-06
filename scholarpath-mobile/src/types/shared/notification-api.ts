export type NotificationRecord = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
};

export type GetNotificationsResponse = {
  data: NotificationRecord[];
};
