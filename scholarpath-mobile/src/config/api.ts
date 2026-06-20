import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = 8080;

/**
 * Local Go backend + Postgres.
 * Optional .env: EXPO_PUBLIC_API_HOST=127.0.0.1 (USB) or 192.168.x.x (same Wi-Fi).
 * USB dev: `npm run adb:reverse` forwards ports 8080 and 8081.
 */
const MANUAL_HOST = process.env.EXPO_PUBLIC_API_HOST?.trim() ?? '';

function getExpoDevServerHost(): string | undefined {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return host;
    }
  }

  const expoGoConfig = Constants.expoGoConfig as { debuggerHost?: string } | null;
  if (expoGoConfig?.debuggerHost) {
    return expoGoConfig.debuggerHost.split(':')[0];
  }

  const legacyManifest = Constants.manifest as { debuggerHost?: string } | null;
  if (legacyManifest?.debuggerHost) {
    return legacyManifest.debuggerHost.split(':')[0];
  }

  return undefined;
}

function resolveLocalDevHost(): string {
  if (MANUAL_HOST) {
    return MANUAL_HOST;
  }

  const expoHost = getExpoDevServerHost();

  if (Platform.OS === 'web') {
    return 'localhost';
  }

  if (Platform.OS === 'android') {
    if (Constants.isDevice) {
      return '127.0.0.1';
    }
    if (!expoHost || expoHost === 'localhost' || expoHost === '127.0.0.1') {
      return '10.0.2.2';
    }
    return expoHost;
  }

  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return expoHost;
  }

  return 'localhost';
}

export const API_BASE_URL = `http://${resolveLocalDevHost()}:${DEFAULT_PORT}`;

if (__DEV__) {
  console.log(`[API] local → ${API_BASE_URL}`);
}
