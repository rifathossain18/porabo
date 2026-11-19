/**
 * Cloudflare D1 API Client
 */

import { User, TuitionPost, TuitionApplication, VerificationDocumentSet, TeacherVerificationResubmission } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
const IS_API_ENABLED = Boolean(API_BASE);

if (!IS_API_ENABLED) {
  console.error('[Porabo D1] ❌ VITE_API_BASE_URL missing.');
} else {
  console.info(`[Porabo D1] ✅ Connected to: ${API_BASE}`);
}

export const CLOUDFLARE_D1_SCHEMA = `-- See worker/schema.sql`;

export const cloudflareKV = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(`cf_kv_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async put<T>(key: string, value: T): Promise<void> {
    try { localStorage.setItem(`cf_kv_${key}`, JSON.stringify(value)); } catch {}
  },
  async delete(key: string): Promise<void> {
    try { localStorage.removeItem(`cf_kv_${key}`); } catch {}
  }
};

export interface D1DiagnosticLog {
  id: string;
  timestamp: string;
  operation: string;
  status: 'SUCCESS' | 'ERROR';
  executionTimeMs: number;
  recordsAffected?: number;
  details?: string;
  error?: string;
}

function getAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  try {
    const userTok = localStorage.getItem('porabo_cf_jwt_token');
    if (userTok) h['Authorization'] = `Bearer ${userTok}`;
    const adminTok = sessionStorage.getItem('porabo_admin_token');
    if (adminTok) h['X-Admin-Token'] = adminTok;
  } catch {}
  return h;
}

class CloudflareD1Service {
  private diagnosticLogs: D1DiagnosticLog[] = [];
  private logListeners: Array<(log: D1DiagnosticLog) => void> = [];

  constructor() {
    this.purgeLegacyLocalData();
  }

  // ============ ADMIN AUTH ============
  async getAdminConfig(): Promise<{ hasPassword: boolean }> {
    try {
      return await this.apiFetch<{ hasPassword: boolean }>('/api/admin/config');
    } catch { return { hasPassword: false }; }
  }

  async initAdminPassword(password: string): Promise<{ success: boolean; recoveryCode?: string; error?: string }> {
    try {
      return await this.apiFetch('/api/admin/config/init', {
        method: 'POST', body: JSON.stringify({ password }),
      });
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  async verifyAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.apiFetch<{ success: boolean; adminToken: string }>(
        '/api/admin/config/login',
        { method: 'POST', body: JSON.stringify({ password }) }
      );
      if (res.success && res.adminToken) {
        sessionStorage.setItem('porabo_admin_token', res.adminToken);
        sessionStorage.setItem('porabo_admin_auth', 'true');
        return { success: true };
      }
      return { success: false, error: 'Invalid password' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async resetAdminPassword(recoveryCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.apiFetch('/api/admin/config/reset', {
        method: 'POST',
        body: JSON.stringify({ recoveryCode, newPassword }),
      });
    } catch (err: any) { return { success: false, error: err.message }; }
  }

  // 🆕 Force migrate nested teacher data to flat
  async migrateUsers(): Promise<{ success: boolean; migrated?: number; total?: number; error?: string }> {
    try {
      return await this.apiFetch('/api/admin/migrate-users', { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public purgeLegacyLocalData(): void {
    try {
      const KEYS = [
        'porabo_d1_users', 'porabo_all_users',
        'porabo_d1_posts', 'porabo_tuition_posts',
        'porabo_d1_applications', 'porabo_applications',
      ];
      let purged = 0;
      for (const key of KEYS) {
        if (localStorage.getItem(key)) { localStorage.removeItem(key); purged++; }
      }
      if (purged > 0) console.info(`[Porabo D1] 🧹 Purged ${purged} legacy keys.`);
    } catch {}
  }

  public subscribeToDiagnostics(listener: (log: D1DiagnosticLog) => void): () => void {
    this.logListeners.push(listener);
    return () => { this.logListeners = this.logListeners.filter(l => l !== listener); };
  }

  public getDiagnosticLogs(): D1DiagnosticLog[] { return [...this.diagnosticLogs]; }
  public clearDiagnosticLogs(): void { this.diagnosticLogs = []; }
  public cleanLegacyDemoData(): void { this.purgeLegacyLocalData(); }

  private log(entry: Omit<D1DiagnosticLog, 'id' | 'timestamp'>): void {
    const full: D1DiagnosticLog = {
      ...entry,
      id: `diag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.diagnosticLogs.unshift(full);
    if (this.diagnosticLogs.length > 150) this.diagnosticLogs.pop();
    this.logListeners.forEach(l => { try { l(full); } catch {} });
  }

  private async apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!IS_API_ENABLED) throw new Error('API not configured. Set VITE_API_BASE_URL');

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errMsg = `API error ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body === 'object' && 'error' in body) errMsg = String(body.error);
      } catch {}
      throw new Error(errMsg);
    }
    return res.json() as Promise<T>;
  }

  // ============ USERS ============
  async getUsers(): Promise<User[]> {
    try { return await this.apiFetch<User[]>('/api/users'); }
    catch { return []; }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getAdminUser(id: string): Promise<User> {
    const users = await this.apiFetch<User[]>("/api/users");
    const user = users.find((candidate) => candidate.id === id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const target = email.trim().toLowerCase();
    const users = await this.getUsers();
    return users.find(u => u.email.trim().toLowerCase() === target) || null;
  }

  async getVerificationDocuments(
    userId: string,
  ): Promise<VerificationDocumentSet | null> {
    try {
      return await this.apiFetch<VerificationDocumentSet | null>(
        `/api/admin/verification-documents/${encodeURIComponent(userId)}`,
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Verification documents not found') return null;
        if (
          error.message === 'API error 404' ||
          error.message === 'Not Found' ||
          error.message === 'Not found'
        ) {
          throw new Error(
            'The admin verification endpoint is unavailable. Deploy the updated Worker API.',
          );
        }
      }
      throw error;
    }
  }

  async getOwnVerificationDocuments(
    userId: string,
  ): Promise<VerificationDocumentSet | null> {
    return this.apiFetch<VerificationDocumentSet | null>(
      `/api/users/${encodeURIComponent(userId)}/verification-resubmission`,
    );
  }

  async resubmitTutorVerification(
    userId: string,
    submission: TeacherVerificationResubmission,
  ): Promise<User> {
    const result = await this.apiFetch<{ success: boolean; user: User }>(
      `/api/users/${encodeURIComponent(userId)}/verification-resubmission`,
      { method: 'POST', body: JSON.stringify(submission) },
    );
    return result.user;
  }

  async saveUser(user: User): Promise<void> {
    await this.apiFetch('/api/users', {
      method: 'POST', body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<void> {
    try { await this.apiFetch(`/api/users/${id}`, { method: 'DELETE' }); }
    catch (err) { console.error('[Porabo D1] deleteUser failed:', err); }
  }

  // ============ POSTS ============
  async getPosts(): Promise<TuitionPost[]> {
    try { return await this.apiFetch<TuitionPost[]>('/api/posts'); }
    catch { return []; }
  }

  async savePost(post: TuitionPost): Promise<void> {
    await this.apiFetch('/api/posts', {
      method: 'POST', body: JSON.stringify(post),
    });
  }

  async deletePost(id: string): Promise<void> {
    try { await this.apiFetch(`/api/posts/${id}`, { method: 'DELETE' }); }
    catch (err) { console.error('[Porabo D1] deletePost failed:', err); }
  }

  // ============ APPLICATIONS ============
  async getApplications(): Promise<TuitionApplication[]> {
    try { return await this.apiFetch<TuitionApplication[]>('/api/applications'); }
    catch { return []; }
  }

  async saveApplication(app: TuitionApplication): Promise<void> {
    await this.apiFetch('/api/applications', {
      method: 'POST', body: JSON.stringify(app),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    try { await this.apiFetch(`/api/applications/${id}`, { method: 'DELETE' }); }
    catch (err) { console.error('[Porabo D1] deleteApplication failed:', err); }
  }

  // ============ QUIZZES & EXAMS ============
  async getQuizzes(): Promise<any[]> {
    try {
      const quizzes = await this.apiFetch<any[]>('/api/quizzes');
      return quizzes.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options)
          : Array.isArray(q.options) ? q.options : [],
      }));
    } catch { return []; }
  }

  async saveQuiz(quiz: any): Promise<boolean> {
    try {
      await this.apiFetch('/api/quizzes', { method: 'POST', body: JSON.stringify(quiz) });
      return true;
    } catch { return false; }
  }

  async createExamSet(exam: any): Promise<{ success: boolean; examId?: string }> {
    try {
      return await this.apiFetch('/api/exams', { method: 'POST', body: JSON.stringify(exam) });
    } catch { return { success: false }; }
  }

  async getExamSet(id: string): Promise<any> {
    try { return await this.apiFetch(`/api/exams/${id}`); }
    catch (err: any) { throw new Error(err.message); }
  }

  async submitExamResult(payload: {
    examSetId: string;
    studentId?: string;
    studentName?: string;
    answers: number[];
  }): Promise<{ score: number; total: number } | null> {
    try {
      return await this.apiFetch<{ score: number; total: number }>(
        `/api/exams/${payload.examSetId}/submit`,
        { method: 'POST', body: JSON.stringify(payload) }
      );
    } catch { return null; }
  }

  async exportFullD1Dump(): Promise<string> {
    return '-- Use wrangler d1 export';
  }
}

export const cfD1 = new CloudflareD1Service();