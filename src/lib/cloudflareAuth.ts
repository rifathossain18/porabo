

import { User, UserRole, UserGender, RegistrationVerificationDocuments } from './types';
import { cfD1 } from './cloudflareD1';

const TOKEN_KEY = 'porabo_cf_jwt_token';
const SESSION_USER_KEY = 'porabo_active_session';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

async function authFetch<T>(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data: data as T & { error?: string } };
}

export async function cfRegister(params: {
  email: string; password: string; fullName: string; phone: string;
  role: UserRole; gender: UserGender;
  district: string; areaName: string; exactAddress: string;
  latitude: number; longitude: number;
  profilePicture: string;
  verificationDocuments: RegistrationVerificationDocuments;
  institution?: string;
  teacherDetails?: Partial<User>;
}): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await authFetch<{ user: User; token: string }>('/api/auth/register', params);
    if (!res.ok) return { success: false, error: res.data.error || 'Registration failed' };
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.data.user));
    return { success: true, user: res.data.user, token: res.data.token };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function cfLogin(
  email: string, password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const res = await authFetch<{ user: User; token: string }>('/api/auth/login', { email, password });
    if (!res.ok) return { success: false, error: res.data.error || 'Login failed' };
    localStorage.setItem(TOKEN_KEY, res.data.token);
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(res.data.user));
    return { success: true, user: res.data.user, token: res.data.token };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export function cfLogout(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
  } catch {}
}

export function cfGetSession(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(SESSION_USER_KEY);
    return { token, user: u ? JSON.parse(u) : null };
  } catch {
    return { user: null, token: null };
  }
}

export async function cfRequestPasswordReset(
  _email: string
): Promise<{ success: boolean; message: string; resetToken?: string }> {
  return {
    success: false,
    message:
      'For security, password reset requires admin verification. Contact Porabo support on WhatsApp: +880 1642-695161',
  };
}

export async function cfUpdatePassword(
  _email: string, newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const session = cfGetSession();
  if (!session.token) {
    return { success: false, error: 'You must be logged in to change password.' };
  }
  try {
    const res = await fetch(`${API_BASE}/api/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    const data: any = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cfValidateAndRefreshSession(): Promise<{
  valid: boolean; user?: User; tokenRefreshed?: boolean; error?: string;
}> {
  try {
    const session = cfGetSession();
    if (!session.token || !session.user) return { valid: false };
    const fresh = await cfD1.getUserById(session.user.id);
    if (!fresh) {
      cfLogout();
      return { valid: false, error: 'User no longer exists' };
    }
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(fresh));
    localStorage.setItem('porabo_active_session', JSON.stringify(fresh));
    return { valid: true, user: fresh };
  } catch (err: any) {
    return { valid: false, error: err.message };
  }
}