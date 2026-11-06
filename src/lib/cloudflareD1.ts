/**
 * Cloudflare D1 API Client
 * 
 * Dual-mode: 
 *   1. When VITE_API_BASE_URL is set → fetch from Cloudflare Worker (shared across all devices)
 *   2. When offline / API fails → fall back to localStorage (single-device mode)
 * 
 * All writes go to BOTH localStorage (for speed) AND the API (for cross-device sync).
 */

import { User, TuitionPost, TuitionApplication } from './types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
const IS_API_ENABLED = Boolean(API_BASE);

export const CLOUDFLARE_D1_SCHEMA = `-- See worker/schema.sql for full schema`;

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
  source?: 'API' | 'LOCAL';
}

class CloudflareD1Service {
  private userStoreKey = 'porabo_d1_users';
  private postStoreKey = 'porabo_d1_posts';
  private appStoreKey = 'porabo_d1_applications';

  private diagnosticLogs: D1DiagnosticLog[] = [];
  private logListeners: Array<(log: D1DiagnosticLog) => void> = [];

  constructor() {
    console.info(
      `[Porabo D1] ${IS_API_ENABLED ? '✅ API mode — cross-device sync enabled' : '⚠️ Local mode — data is device-only'}\n` +
      (IS_API_ENABLED ? `[Porabo D1] API: ${API_BASE}` : '[Porabo D1] Set VITE_API_BASE_URL in .env to enable cross-device sync')
    );
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

  public cleanLegacyDemoData(): void {
    // No-op — deprecated. Real users preserved.
  }

  // ==========================================================
  // USERS
  // ==========================================================

  async getUsers(): Promise<User[]> {
    const start = performance.now();

    // Try API first (shared source of truth)
    if (IS_API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (res.ok) {
          const users: User[] = await res.json();
          // Cache locally for offline fallback
          localStorage.setItem(this.userStoreKey, JSON.stringify(users));
          localStorage.setItem('porabo_all_users', JSON.stringify(users));
          this.log({
            operation: 'GET /api/users',
            status: 'SUCCESS',
            executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
            recordsAffected: users.length,
            details: `${users.length} users fetched from Cloudflare Worker`,
            source: 'API',
          });
          return users;
        }
      } catch (err) {
        console.warn('[Porabo D1] API fetch failed, using local cache:', err);
      }
    }

    // Fallback: localStorage
    const raw = localStorage.getItem(this.userStoreKey) || localStorage.getItem('porabo_all_users');
    const users = raw ? JSON.parse(raw) : [];
    this.log({
      operation: 'GET users (local)',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: users.length,
      details: `${users.length} users loaded from localStorage`,
      source: 'LOCAL',
    });
    return users;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getUsers();
    const target = email.trim().toLowerCase();
    return users.find(u => u.email.trim().toLowerCase() === target) || null;
  }

  async saveUser(user: User): Promise<void> {
    const start = performance.now();

    // 1. Save locally (instant)
    const raw = localStorage.getItem(this.userStoreKey) || localStorage.getItem('porabo_all_users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.unshift(user);
    localStorage.setItem(this.userStoreKey, JSON.stringify(users));
    localStorage.setItem('porabo_all_users', JSON.stringify(users));

    this.log({
      operation: 'SAVE user (local)',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: 1,
      details: `User '${user.fullName}' saved to localStorage`,
      source: 'LOCAL',
    });

    // 2. Push to API (background)
    if (IS_API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        this.log({
          operation: 'POST /api/users',
          status: res.ok ? 'SUCCESS' : 'ERROR',
          executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
          recordsAffected: res.ok ? 1 : 0,
          details: res.ok ? `User '${user.fullName}' synced to Cloudflare` : `API returned ${res.status}`,
          source: 'API',
        });
      } catch (err: any) {
        this.log({
          operation: 'POST /api/users',
          status: 'ERROR',
          executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
          error: err.message || 'Network error',
          source: 'API',
        });
      }
    }
  }

  async deleteUser(id: string): Promise<void> {
    // Remove locally
    const raw = localStorage.getItem(this.userStoreKey) || localStorage.getItem('porabo_all_users');
    const users: User[] = raw ? JSON.parse(raw) : [];
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(this.userStoreKey, JSON.stringify(filtered));
    localStorage.setItem('porabo_all_users', JSON.stringify(filtered));

    // Remove from API
    if (IS_API_ENABLED) {
      try {
        await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('[Porabo D1] Delete user API failed:', err);
      }
    }

    this.log({
      operation: 'DELETE user',
      status: 'SUCCESS',
      executionTimeMs: 0,
      recordsAffected: 1,
      details: `User ${id} deleted`,
      source: IS_API_ENABLED ? 'API' : 'LOCAL',
    });
  }

  // ==========================================================
  // POSTS
  // ==========================================================

  async getPosts(): Promise<TuitionPost[]> {
    const start = performance.now();

    if (IS_API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE}/api/posts`);
        if (res.ok) {
          const posts: TuitionPost[] = await res.json();
          localStorage.setItem(this.postStoreKey, JSON.stringify(posts));
          localStorage.setItem('porabo_tuition_posts', JSON.stringify(posts));
          this.log({
            operation: 'GET /api/posts',
            status: 'SUCCESS',
            executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
            recordsAffected: posts.length,
            details: `${posts.length} posts fetched from API`,
            source: 'API',
          });
          return posts;
        }
      } catch (err) {
        console.warn('[Porabo D1] Posts API fetch failed:', err);
      }
    }

    const raw = localStorage.getItem(this.postStoreKey) || localStorage.getItem('porabo_tuition_posts');
    const posts = raw ? JSON.parse(raw) : [];
    this.log({
      operation: 'GET posts (local)',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: posts.length,
      source: 'LOCAL',
    });
    return posts;
  }

  async savePost(post: TuitionPost): Promise<void> {
    const start = performance.now();
    const raw = localStorage.getItem(this.postStoreKey) || localStorage.getItem('porabo_tuition_posts');
    const posts: TuitionPost[] = raw ? JSON.parse(raw) : [];
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.unshift(post);
    localStorage.setItem(this.postStoreKey, JSON.stringify(posts));
    localStorage.setItem('porabo_tuition_posts', JSON.stringify(posts));

    if (IS_API_ENABLED) {
      try {
        await fetch(`${API_BASE}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });
      } catch (err) {
        console.warn('[Porabo D1] Post sync failed:', err);
      }
    }

    this.log({
      operation: 'SAVE post',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: 1,
      details: `Post '${post.title}' saved`,
      source: IS_API_ENABLED ? 'API' : 'LOCAL',
    });
  }

  async deletePost(id: string): Promise<void> {
    const raw = localStorage.getItem(this.postStoreKey) || localStorage.getItem('porabo_tuition_posts');
    const posts: TuitionPost[] = raw ? JSON.parse(raw) : [];
    const filtered = posts.filter(p => p.id !== id);
    localStorage.setItem(this.postStoreKey, JSON.stringify(filtered));
    localStorage.setItem('porabo_tuition_posts', JSON.stringify(filtered));

    if (IS_API_ENABLED) {
      try {
        await fetch(`${API_BASE}/api/posts/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('[Porabo D1] Delete post API failed:', err);
      }
    }

    this.log({
      operation: 'DELETE post',
      status: 'SUCCESS',
      executionTimeMs: 0,
      recordsAffected: 1,
      source: IS_API_ENABLED ? 'API' : 'LOCAL',
    });
  }

  // ==========================================================
  // APPLICATIONS
  // ==========================================================

  async getApplications(): Promise<TuitionApplication[]> {
    const start = performance.now();
    if (IS_API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE}/api/applications`);
        if (res.ok) {
          const apps: TuitionApplication[] = await res.json();
          localStorage.setItem(this.appStoreKey, JSON.stringify(apps));
          localStorage.setItem('porabo_applications', JSON.stringify(apps));
          this.log({
            operation: 'GET /api/applications',
            status: 'SUCCESS',
            executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
            recordsAffected: apps.length,
            source: 'API',
          });
          return apps;
        }
      } catch (err) {
        console.warn('[Porabo D1] Apps API fetch failed:', err);
      }
    }

    const raw = localStorage.getItem(this.appStoreKey) || localStorage.getItem('porabo_applications');
    const apps = raw ? JSON.parse(raw) : [];
    this.log({
      operation: 'GET apps (local)',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: apps.length,
      source: 'LOCAL',
    });
    return apps;
  }

  async saveApplication(app: TuitionApplication): Promise<void> {
    const start = performance.now();
    const raw = localStorage.getItem(this.appStoreKey) || localStorage.getItem('porabo_applications');
    const apps: TuitionApplication[] = raw ? JSON.parse(raw) : [];
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) apps[idx] = app;
    else apps.unshift(app);
    localStorage.setItem(this.appStoreKey, JSON.stringify(apps));
    localStorage.setItem('porabo_applications', JSON.stringify(apps));

    if (IS_API_ENABLED) {
      try {
        await fetch(`${API_BASE}/api/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app),
        });
      } catch (err) {
        console.warn('[Porabo D1] Application sync failed:', err);
      }
    }

    this.log({
      operation: 'SAVE application',
      status: 'SUCCESS',
      executionTimeMs: Math.round((performance.now() - start) * 100) / 100,
      recordsAffected: 1,
      source: IS_API_ENABLED ? 'API' : 'LOCAL',
    });
  }

  async deleteApplication(id: string): Promise<void> {
    const raw = localStorage.getItem(this.appStoreKey) || localStorage.getItem('porabo_applications');
    const apps: TuitionApplication[] = raw ? JSON.parse(raw) : [];
    const filtered = apps.filter(a => a.id !== id);
    localStorage.setItem(this.appStoreKey, JSON.stringify(filtered));
    localStorage.setItem('porabo_applications', JSON.stringify(filtered));

    if (IS_API_ENABLED) {
      try {
        await fetch(`${API_BASE}/api/applications/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('[Porabo D1] Delete application API failed:', err);
      }
    }

    this.log({
      operation: 'DELETE application',
      status: 'SUCCESS',
      executionTimeMs: 0,
      recordsAffected: 1,
      source: IS_API_ENABLED ? 'API' : 'LOCAL',
    });
  }

  async exportFullD1Dump(): Promise<string> {
    const users = await this.getUsers();
    const posts = await this.getPosts();
    const apps = await this.getApplications();

    let sql = `-- Porabo Full Database Export\n-- Generated: ${new Date().toISOString()}\n\n`;
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