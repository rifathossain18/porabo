/**
 * Cloudflare D1 API Client — Pure API Mode
 * 
 * ⚠️  NO localStorage for data. Everything goes through Cloudflare Worker API.
 * Only session token & UI preferences stay in localStorage (necessary for login state).
 * 
 * If API fails → returns empty array (no silent fallback to old local data).
 */

import { User, TuitionPost, TuitionApplication } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
const IS_API_ENABLED = Boolean(API_BASE);

if (!IS_API_ENABLED) {
  console.error(
    '[Porabo D1] ❌ VITE_API_BASE_URL is missing. App cannot load data.\n' +
    'Add VITE_API_BASE_URL=https://your-worker.workers.dev to .env and restart dev server.'
  );
} else {
  console.info(`[Porabo D1] ✅ Pure API mode. Connected to: ${API_BASE}`);
}

export const CLOUDFLARE_D1_SCHEMA = `-- See worker/schema.sql`;

// Minimal KV (only used for non-critical UI state, NOT business data)
export const cloudflareKV = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(`cf_kv_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async put<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(`cf_kv_${key}`, JSON.stringify(value));
    } catch {}
  },
  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(`cf_kv_${key}`);
    } catch {}
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

class CloudflareD1Service {
  private diagnosticLogs: D1DiagnosticLog[] = [];
  private logListeners: Array<(log: D1DiagnosticLog) => void> = [];

  constructor() {
    this.purgeLegacyLocalData();
  }



    // ==========================================================
  // ADMIN AUTH
  // ==========================================================

      async getAdminConfig(): Promise<{ hasPassword: boolean }> {
    try {
      return await this.apiFetch<{ hasPassword: boolean }>('/api/admin/config');
    } catch (err) {
      console.warn('[Porabo D1] Admin config check failed:', err);
      return { hasPassword: false }; // ফেইল করলে নতুন সেটআপ ফর্ম দেখাবে
    }
  }

  async initAdminPassword(password: string): Promise<{ success: boolean; recoveryCode?: string; error?: string }> {
    try {
      return await this.apiFetch('/api/admin/config/init', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async verifyAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.apiFetch('/api/admin/config/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
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
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete ALL old localStorage data that belonged to the previous localStorage-first architecture.
   * Runs once per browser session. Keeps only UI preferences & session tokens.
   */
  public purgeLegacyLocalData(): void {
    try {
      const DATA_KEYS = [
        'porabo_d1_users',
        'porabo_all_users',
        'porabo_d1_posts',
        'porabo_tuition_posts',
        'porabo_d1_applications',
        'porabo_applications',
      ];
      let purged = 0;
      for (const key of DATA_KEYS) {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          purged++;
        }
      }
      if (purged > 0) {
        console.info(
          `[Porabo D1] 🧹 Purged ${purged} legacy localStorage data keys. All data now lives in Cloudflare D1.`
        );
      }
    } catch (err) {
      console.warn('[Porabo D1] Legacy purge error:', err);
    }
  }

  public subscribeToDiagnostics(listener: (log: D1DiagnosticLog) => void): () => void {
    this.logListeners.push(listener);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }

  public getDiagnosticLogs(): D1DiagnosticLog[] {
    return [...this.diagnosticLogs];
  }

  public clearDiagnosticLogs(): void {
    this.diagnosticLogs = [];
  }

  private log(entry: Omit<D1DiagnosticLog, 'id' | 'timestamp'>): void {
    const full: D1DiagnosticLog = {
      ...entry,
      id: `diag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.diagnosticLogs.unshift(full);
    if (this.diagnosticLogs.length > 150) this.diagnosticLogs.pop();
    this.logListeners.forEach(l => {
      try { l(full); } catch {}
    });
  }

  // Legacy no-op (kept for compat with App.tsx calls)
  public cleanLegacyDemoData(): void {
    this.purgeLegacyLocalData();
  }

  // ==========================================================
  // HTTP HELPERS
  // ==========================================================

  private async apiFetch<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!IS_API_ENABLED) {
      throw new Error(
        'API not configured. Set VITE_API_BASE_URL in .env'
      );
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errMsg = `API error ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body === 'object' && 'error' in body) {
          errMsg = String(body.error);
        }
      } catch {}
      throw new Error(errMsg);
    }

    return res.json() as Promise<T>;
  }

  // ==========================================================
  // USERS
  // ==========================================================

  async getUsers(): Promise<User[]> {
    const start = performance.now();
    try {
      const users = await this.apiFetch<User[]>('/api/users');
      this.log({
        operation: 'GET /api/users',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: users.length,
        details: `${users.length} users from Cloudflare D1`,
      });
      return users;
    } catch (err: any) {
      this.log({
        operation: 'GET /api/users',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] getUsers failed:', err);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    // Optimize: fetch all + filter (D1 dataset is small enough)
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const target = email.trim().toLowerCase();
    const users = await this.getUsers();
    return users.find(u => u.email.trim().toLowerCase() === target) || null;
  }

  async saveUser(user: User): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      this.log({
        operation: 'POST /api/users',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `User '${user.fullName}' (${user.role}) saved to Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'POST /api/users',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] saveUser failed:', err);
      throw err;
    }
  }

  async deleteUser(id: string): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      this.log({
        operation: 'DELETE /api/users/:id',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `User ${id} deleted from Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'DELETE /api/users/:id',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] deleteUser failed:', err);
    }
  }

  // ==========================================================
  // POSTS
  // ==========================================================

  async getPosts(): Promise<TuitionPost[]> {
    const start = performance.now();
    try {
      const posts = await this.apiFetch<TuitionPost[]>('/api/posts');
      this.log({
        operation: 'GET /api/posts',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: posts.length,
        details: `${posts.length} posts from Cloudflare D1`,
      });
      return posts;
    } catch (err: any) {
      this.log({
        operation: 'GET /api/posts',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] getPosts failed:', err);
      return [];
    }
  }

  async savePost(post: TuitionPost): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(post),
      });
      this.log({
        operation: 'POST /api/posts',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `Post '${post.title}' saved to Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'POST /api/posts',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] savePost failed:', err);
      throw err;
    }
  }

  async deletePost(id: string): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch(`/api/posts/${id}`, { method: 'DELETE' });
      this.log({
        operation: 'DELETE /api/posts/:id',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `Post ${id} deleted from Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'DELETE /api/posts/:id',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] deletePost failed:', err);
    }
  }

  // ==========================================================
  // APPLICATIONS
  // ==========================================================

  async getApplications(): Promise<TuitionApplication[]> {
    const start = performance.now();
    try {
      const apps = await this.apiFetch<TuitionApplication[]>('/api/applications');
      this.log({
        operation: 'GET /api/applications',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: apps.length,
        details: `${apps.length} applications from Cloudflare D1`,
      });
      return apps;
    } catch (err: any) {
      this.log({
        operation: 'GET /api/applications',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] getApplications failed:', err);
      return [];
    }
  }

  async saveApplication(app: TuitionApplication): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify(app),
      });
      this.log({
        operation: 'POST /api/applications',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `Application ${app.id} (${app.status}) saved to Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'POST /api/applications',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] saveApplication failed:', err);
      throw err;
    }
  }

  async deleteApplication(id: string): Promise<void> {
    const start = performance.now();
    try {
      await this.apiFetch(`/api/applications/${id}`, { method: 'DELETE' });
      this.log({
        operation: 'DELETE /api/applications/:id',
        status: 'SUCCESS',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        recordsAffected: 1,
        details: `Application ${id} deleted from Cloudflare D1`,
      });
    } catch (err: any) {
      this.log({
        operation: 'DELETE /api/applications/:id',
        status: 'ERROR',
        executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
        error: err?.message || String(err),
      });
      console.error('[Porabo D1] deleteApplication failed:', err);
    }
  }

  // ==========================================================
  // EXPORT
  // ==========================================================

  async exportFullD1Dump(): Promise<string> {
    const users = await this.getUsers();
    const posts = await this.getPosts();
    const apps = await this.getApplications();

    let sql = `-- Porabo Full Database Export (Cloudflare D1)\n-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `-- Users (${users.length})\n`;
    users.forEach(u => {
      sql += `INSERT INTO users (id, data, role, email, createdAt) VALUES ('${u.id}', '${JSON.stringify(u).replace(/'/g, "''")}', '${u.role}', '${u.email.toLowerCase()}', '${new Date().toISOString()}');\n`;
    });
    sql += `\n-- Posts (${posts.length})\n`;
    posts.forEach(p => {
      sql += `INSERT INTO tuition_posts (id, data, studentId, district, createdAt) VALUES ('${p.id}', '${JSON.stringify(p).replace(/'/g, "''")}', '${p.studentId}', '${p.district}', '${p.createdAt}');\n`;
    });
    sql += `\n-- Applications (${apps.length})\n`;
    apps.forEach(a => {
      sql += `INSERT INTO tuition_applications (id, data, postId, tutorId, createdAt) VALUES ('${a.id}', '${JSON.stringify(a).replace(/'/g, "''")}', '${a.postId}', '${a.tutorId}', '${a.createdAt}');\n`;
    });
    return sql;
  }
}

export const cfD1 = new CloudflareD1Service();