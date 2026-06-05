import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@scholarpath/auth_token';
const USER_KEY = '@scholarpath/auth_user';

export type StoredAuthUser = {
  userId: number;
  name: string;
  email: string;
  role: string;
};

export type StoredAuthSession = {
  token: string;
  user: StoredAuthUser;
};

export async function getStoredAuthSession(): Promise<StoredAuthSession | null> {
  const [storedToken, storedUser] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!storedToken || !storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser) as StoredAuthUser;
    if (!user.userId || !user.role) {
      return null;
    }
    return { token: storedToken, user };
  } catch {
    return null;
  }
}

export async function saveAuthSession(session: StoredAuthSession): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, session.token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}
