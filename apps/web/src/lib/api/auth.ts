import { apiFetch } from "./client";
import type { AuthTokens, GoogleAuthUrl, UserProfile } from "./types";

export function register(input: { email: string; username: string; password: string; display_name?: string }) {
  return apiFetch<AuthTokens>("/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthTokens>("/auth/login", { method: "POST", body: input });
}

export function logout(refreshToken?: string) {
  return apiFetch<{ logged_out: true }>("/auth/logout", {
    method: "POST",
    body: refreshToken ? { refresh_token: refreshToken } : {},
  });
}

export function me() {
  return apiFetch<UserProfile>("/auth/me");
}

export function googleAuthUrl() {
  return apiFetch<GoogleAuthUrl>("/auth/google");
}
