import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "@/src/client/client.gen";

export interface AuthTokens {
  access: string;
  refresh: string;
}

const AUTH_STORAGE_KEY = "auth_tokens";

export class AuthUtils {
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const tokensJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error("Failed to get tokens:", error);
      return null;
    }
  }

  static async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
      // Update client headers immediately after setting tokens
      await this.updateClientAuth();
    } catch (error) {
      console.error("Failed to set tokens:", error);
      throw error;
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      // Clear client headers
      client.setConfig({
        baseUrl:
          process.env.EXPO_PUBLIC_API_BASE_URL ||
          "http://localhost:8000/api/v1",
        headers: {},
      });
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null && tokens.access !== null;
  }

  static async getAuthorizationHeader(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens ? `Bearer ${tokens.access}` : null;
  }

  static async updateClientAuth(): Promise<void> {
    try {
      const tokens = await this.getTokens();
      client.setConfig({
        baseUrl:
          process.env.EXPO_PUBLIC_API_BASE_URL ||
          "http://localhost:8000/api/v1",
        headers: tokens
          ? {
              Authorization: `Bearer ${tokens.access}`,
            }
          : {},
      });
    } catch (error) {
      console.error("Failed to update client auth:", error);
    }
  }

  static async initializeAuth(): Promise<void> {
    // Initialize client auth headers on app start
    await this.updateClientAuth();
  }
}
