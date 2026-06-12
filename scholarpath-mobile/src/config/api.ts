import { Platform } from "react-native";

/**
 * Override for physical-device testing on the same LAN as your dev machine.
 * Example: '192.168.1.42'
 */
const LAN_HOST = "172.20.10.2";

const DEFAULT_PORT = 8080;

function resolveDevHost(): string {
  if (LAN_HOST) {
    return LAN_HOST;
  }

  // Android emulator maps localhost to 10.0.2.2
  if (Platform.OS === "android") {
    return "10.0.2.2";
  }

  return "localhost";
}

export const API_BASE_URL = `http://${resolveDevHost()}:${DEFAULT_PORT}`;
