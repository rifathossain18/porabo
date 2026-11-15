/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ADMIN_JWT_SECRET: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

async function parseBody(request: Request): Promise<Record<string, any>> {
  try { return (await request.json()) as Record<string, any>; }
  catch { return {}; }
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt?: string): Promise<string> {
  const useSalt = salt || toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(useSalt), iterations: 100000, hash: 'SHA-256' },
    key, 256
  );
  return `${useSalt}:${toHex(bits)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored || !stored.includes(':') || stored.startsWith('LEGACY:') || stored === 'RE_REGISTER_REQUIRED') return false;
  const [salt] = stored.split(':');
  return (await hashPassword(password, salt)) === stored;
}

function b64uEnc(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64uDec(s: string): string {
  let o = s.replace(/-/g, '+').replace(/_/g, '/');
  while (o.length % 4) o += '=';
  return decodeURIComponent(escape(atob(o)));
}

async function signJwt(payload: any, secret: string): Promise<string> {
  const h = b64uEnc(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const b = b64uEnc(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  }));
  const data = `${h}.${b}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64uEnc(String.fromCharCode(...new Uint8Array(sig)))}`;
}

async function verifyJwt(token: string, secret: string): Promise<any | null> {
  try {
    const [h, p, s] = token.split('.');
    if (!s) return null;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigStr = b64uDec(s);
    const sigBytes = new Uint8Array(sigStr.split('').map(c => c.charCodeAt(0)));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;
    const payload = JSON.parse(b64uDec(p));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

interface AuthContext {
  isAdmin: boolean;
  user: { userId: string; email: string; role: string } | null;
}

async function getAuth(request: Request, env: Env): Promise<AuthContext> {
  let isAdmin = false;
  let user: AuthContext['user'] = null;
  const adminTok = request.headers.get('X-Admin-Token');
  if (adminTok) {
    const p = await verifyJwt(adminTok, env.ADMIN_JWT_SECRET);
    if (p?.role === 'ADMIN') isAdmin = true;
  }
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const p = await verifyJwt(auth.slice(7), env.JWT_SECRET);
    if (p?.sub) user = { userId: p.sub, email: p.email, role: p.role };
  }
  return { isAdmin, user };
}

async function rateLimit(env: Env, key: string, max: number, windowMs: number): Promise<boolean> {
  const row: any = await env.DB.prepare(
    'SELECT attemptCount, firstAttemptAt FROM admin_login_attempts WHERE ip = ?'
  ).bind(key).first();
  if (!row) return true;
  if (new Date(row.firstAttemptAt).getTime() < Date.now() - windowMs) return true;
  return row.attemptCount < max;
}

async function recordFail(env: Env, key: string): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO admin_login_attempts (ip, attemptCount, firstAttemptAt, lastAttemptAt)
    VALUES (?, 1, ?, ?)
    ON CONFLICT(ip) DO UPDATE SET
      attemptCount = CASE WHEN datetime(firstAttemptAt) < datetime('now', '-15 minutes')
                          THEN 1 ELSE attemptCount + 1 END,
      firstAttemptAt = CASE WHEN datetime(firstAttemptAt) < datetime('now', '-15 minutes')
                            THEN excluded.firstAttemptAt ELSE firstAttemptAt END,
      lastAttemptAt = excluded.lastAttemptAt
  `).bind(key, now, now).run();
}

function flattenUser(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const u = { ...raw };
  delete u.password;
  delete u.password_hash;
  if (u.teacherDetails && typeof u.teacherDetails === 'object') {
    const { teacherDetails, ...flat } = u;
    return { ...flat, ...teacherDetails };
  }
  return u;
}

// ══════════════════════════════════════════════════════════
// AUTO-MIGRATIONS
// ══════════════════════════════════════════════════════════
async function autoMigrateUsers(env: Env): Promise<{ migrated: number; total: number }> {
  try {
    const marker: any = await env.DB.prepare(
      "SELECT value FROM admin_settings WHERE key = 'users_flattened_v2'"
    ).first();
    if (marker && marker.value === 'done') return { migrated: 0, total: 0 };

    const all = await env.DB.prepare('SELECT id, data FROM users').all();
    const rows = (all.results || []) as Array<{ id: string; data: string }>;
    let migrated = 0;
    const now = new Date().toISOString();

    for (const row of rows) {
      try {
        const u = JSON.parse(row.data);
        if (u.teacherDetails && typeof u.teacherDetails === 'object') {
          const { teacherDetails, ...rest } = u;
          delete rest.password;
          delete rest.password_hash;
          const flat = { ...rest, ...teacherDetails };
          await env.DB.prepare('UPDATE users SET data = ?, updatedAt = ? WHERE id = ?')
            .bind(JSON.stringify(flat), now, row.id).run();
          migrated++;
        }
      } catch (err) {
        console.warn(`Migration failed for user ${row.id}:`, err);
      }
    }

    await env.DB.prepare(
      "INSERT OR REPLACE INTO admin_settings (key, value, updatedAt) VALUES ('users_flattened_v2', 'done', ?)"
    ).bind(now).run();
    return { migrated, total: rows.length };
  } catch (err) {
    console.error('[migrate] Auto-migrate failed:', err);
    return { migrated: 0, total: 0 };
  }
}

// 🆕 Migrate existing ACCEPTED applications to include studentId (so review survives post deletion)
async function autoMigrateAcceptedApps(env: Env): Promise<{ migrated: number; total: number }> {
  try {
    const marker: any = await env.DB.prepare(
      "SELECT value FROM admin_settings WHERE key = 'accepted_apps_v1'"
    ).first();
    if (marker && marker.value === 'done') return { migrated: 0, total: 0 };

    const all = await env.DB.prepare("SELECT id, postId, data FROM tuition_applications WHERE status = 'ACCEPTED'").all();
    const rows = (all.results || []) as Array<{ id: string; postId: string; data: string }>;
    let migrated = 0;
    const now = new Date().toISOString();

    for (const row of rows) {
      try {
        const appData = JSON.parse(row.data);
        if (appData.studentId) continue;

        // Look up post to find studentId
        const post: any = await env.DB.prepare(
          'SELECT studentId FROM tuition_posts WHERE id = ?'
        ).bind(row.postId).first();
        if (post && post.studentId) {
          appData.studentId = post.studentId;
          await env.DB.prepare('UPDATE tuition_applications SET data = ?, updatedAt = ? WHERE id = ?')
            .bind(JSON.stringify(appData), now, row.id).run();
          migrated++;
        }
      } catch (err) {
        console.warn(`Migration failed for app ${row.id}:`, err);
      }
    }

    await env.DB.prepare(
      "INSERT OR REPLACE INTO admin_settings (key, value, updatedAt) VALUES ('accepted_apps_v1', 'done', ?)"
    ).bind(now).run();
    return { migrated, total: rows.length };
  } catch (err) {
    console.error('[migrate] Accepted-apps migrate failed:', err);
    return { migrated: 0, total: 0 };
  }
}

// ══════════════════════════════════════════════════════════
// 🆕 30-DAY AUTO-CLEANUP: Delete posts from database
// Preserves ACCEPTED applications so students can still review tutors
// ══════════════════════════════════════════════════════════
async function autoCleanupOldPosts(env: Env, force = false): Promise<{ deleted: number; preserved: number; skipped: boolean }> {
  try {
    const marker: any = await env.DB.prepare(
      "SELECT value FROM admin_settings WHERE key = 'last_post_cleanup'"
    ).first();

    const now = Date.now();
    if (!force && marker && marker.value) {
      const lastRun = parseInt(marker.value) || 0;
      // Run once per hour max
      if (now - lastRun < 60 * 60 * 1000) {
        return { deleted: 0, preserved: 0, skipped: true };
      }
    }

    const cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Find posts older than 30 days
    const oldPosts = await env.DB.prepare(
      'SELECT id FROM tuition_posts WHERE createdAt < ?'
    ).bind(cutoff).all();
    const postIds = (oldPosts.results || []).map((p: any) => p.id);

    if (postIds.length === 0) {
      await env.DB.prepare(
        "INSERT OR REPLACE INTO admin_settings (key, value, updatedAt) VALUES ('last_post_cleanup', ?, ?)"
      ).bind(String(now), new Date().toISOString()).run();
      return { deleted: 0, preserved: 0, skipped: false };
    }

    // Count accepted apps before cleanup (for report)
    const placeholders = postIds.map(() => '?').join(',');
    const acceptedBefore = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM tuition_applications WHERE postId IN (${placeholders}) AND status = 'ACCEPTED'`
    ).bind(...postIds).first();
    const preservedCount = (acceptedBefore as any)?.c || 0;

    // Step 1: Delete non-accepted applications for these posts (cleanup)
    await env.DB.prepare(
      `DELETE FROM tuition_applications WHERE postId IN (${placeholders}) AND status != 'ACCEPTED'`
    ).bind(...postIds).run();

    // Step 2: Delete the posts themselves
    await env.DB.prepare(
      `DELETE FROM tuition_posts WHERE id IN (${placeholders})`
    ).bind(...postIds).run();

    await env.DB.prepare(
      "INSERT OR REPLACE INTO admin_settings (key, value, updatedAt) VALUES ('last_post_cleanup', ?, ?)"
    ).bind(String(now), new Date().toISOString()).run();

    console.log(`[cleanup] Deleted ${postIds.length} posts, preserved ${preservedCount} accepted applications`);

    return { deleted: postIds.length, preserved: preservedCount, skipped: false };
  } catch (err) {
    console.error('[cleanup] Failed:', err);
    return { deleted: 0, preserved: 0, skipped: false };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    try {
      if (path === '/' || path === '/health') {
        autoMigrateUsers(env).catch(() => {});
        autoMigrateAcceptedApps(env).catch(() => {});
        autoCleanupOldPosts(env).catch(() => {});
        return jsonResponse({ status: 'ok', time: new Date().toISOString() });
      }

      // ========== REGISTER ==========
      if (path === '/api/auth/register' && method === 'POST') {
        const body = await parseBody(request);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        if (!email.includes('@')) return errorResponse('Valid email required');
        if (password.length < 6) return errorResponse('Password must be at least 6 chars');
        if (!body.fullName || !body.role) return errorResponse('Missing fields');

        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) return errorResponse('Email already registered', 409);

        const { password: _pw, teacherDetails, ...userData } = body;
        const userId = `usr_cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const user: any = {
          ...userData,
          ...(teacherDetails && typeof teacherDetails === 'object' ? teacherDetails : {}),
          id: userId, email, role: body.role,
        };
        delete user.teacherDetails;

        const hash = await hashPassword(password);
        const now = new Date().toISOString();

        await env.DB.prepare(
          `INSERT INTO users (id, email, password_hash, data, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(userId, email, hash, JSON.stringify(user), body.role, now, now).run();

        const token = await signJwt({ sub: userId, email, role: body.role }, env.JWT_SECRET);
        return jsonResponse({ success: true, user, token });
      }

      // ========== LOGIN ==========
      if (path === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(request);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        if (!email || !password) return errorResponse('Email and password required');
        if (!(await rateLimit(env, ip, 10, 15 * 60 * 1000))) return errorResponse('Too many attempts. Try again in 15 minutes.', 429);

        const row: any = await env.DB.prepare(
          'SELECT id, email, password_hash, data, role FROM users WHERE email = ?'
        ).bind(email).first();

        if (!row) { await recordFail(env, ip); return errorResponse('Invalid email or password', 401); }
        if (!row.password_hash || row.password_hash.startsWith('LEGACY:') || row.password_hash === 'RE_REGISTER_REQUIRED') {
          return errorResponse('Account needs password reset. Contact support: +880 1642-695161', 403);
        }
        if (!(await verifyPassword(password, row.password_hash))) {
          await recordFail(env, ip);
          return errorResponse('Invalid email or password', 401);
        }

        const user = flattenUser(JSON.parse(row.data));
        user.id = row.id; user.email = row.email; user.role = row.role;
        const token = await signJwt({ sub: row.id, email: row.email, role: row.role }, env.JWT_SECRET);
        return jsonResponse({ success: true, user, token });
      }

      // ========== UPDATE PASSWORD ==========
      if (path === '/api/auth/update-password' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.user) return errorResponse('Unauthorized', 401);
        const body = await parseBody(request);
        const pw = String(body.newPassword || '');
        if (pw.length < 6) return errorResponse('Password must be at least 6 chars');
        const hash = await hashPassword(pw);
        await env.DB.prepare('UPDATE users SET password_hash = ?, updatedAt = ? WHERE id = ?')
          .bind(hash, new Date().toISOString(), ctx.user.userId).run();
        return jsonResponse({ success: true });
      }

      // ========== ADMIN: MANUAL MIGRATE ==========
      if (path === '/api/admin/migrate-users' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin) return errorResponse('Admin token required', 401);
        try { await env.DB.prepare("DELETE FROM admin_settings WHERE key = 'users_flattened_v2'").run(); } catch {}
        const result = await autoMigrateUsers(env);
        return jsonResponse({ success: true, ...result });
      }

      // 🆕 ADMIN: MANUAL CLEANUP (force immediate)
      if (path === '/api/admin/cleanup-posts' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin) return errorResponse('Admin token required', 401);
        const result = await autoCleanupOldPosts(env, true);
        return jsonResponse({ success: true, ...result });
      }

      // ========== ADMIN CONFIG ==========
      if (path === '/api/admin/config' && method === 'GET') {
        try {
          const row = await env.DB.prepare("SELECT value FROM admin_settings WHERE key = 'admin_password_hash'").first();
          return jsonResponse({ hasPassword: !!row });
        } catch { return jsonResponse({ hasPassword: false }); }
      }

      if (path === '/api/admin/config/init' && method === 'POST') {
        const existing = await env.DB.prepare("SELECT value FROM admin_settings WHERE key = 'admin_password_hash'").first();
        if (existing) return errorResponse('Admin already initialized', 400);
        const body = await parseBody(request);
        const pw = String(body.password || '');
        if (pw.length < 6) return errorResponse('Password must be at least 6 chars');
        const hash = await hashPassword(pw);
        const recovery = toHex(crypto.getRandomValues(new Uint8Array(4)).buffer).toUpperCase();
        const now = new Date().toISOString();
        await env.DB.batch([
          env.DB.prepare("INSERT INTO admin_settings (key, value, updatedAt) VALUES ('admin_password_hash', ?, ?)").bind(hash, now),
          env.DB.prepare("INSERT INTO admin_settings (key, value, updatedAt) VALUES ('admin_recovery_code', ?, ?)").bind(recovery, now),
        ]);
        return jsonResponse({ success: true, recoveryCode: recovery });
      }

      if (path === '/api/admin/config/login' && method === 'POST') {
        if (!(await rateLimit(env, ip, 5, 15 * 60 * 1000))) return errorResponse('Too many attempts. Try again in 15 minutes.', 429);
        const body = await parseBody(request);
        const row: any = await env.DB.prepare("SELECT value FROM admin_settings WHERE key = 'admin_password_hash'").first();
        if (!row) return errorResponse('Admin not initialized', 400);
        if (!(await verifyPassword(String(body.password || ''), row.value))) {
          await recordFail(env, ip);
          return errorResponse('Invalid password', 401);
        }
        const adminToken = await signJwt({ sub: 'admin', email: 'admin@porabo.local', role: 'ADMIN' }, env.ADMIN_JWT_SECRET);
        return jsonResponse({ success: true, adminToken });
      }

      if (path === '/api/admin/config/reset' && method === 'POST') {
        if (!(await rateLimit(env, ip, 3, 60 * 60 * 1000))) return errorResponse('Too many reset attempts. Try again in 1 hour.', 429);
        const body = await parseBody(request);
        const code = String(body.recoveryCode || '').toUpperCase();
        const pw = String(body.newPassword || '');
        if (pw.length < 6) return errorResponse('Password must be at least 6 chars');
        const row: any = await env.DB.prepare("SELECT value FROM admin_settings WHERE key = 'admin_recovery_code'").first();
        if (!row || row.value !== code) { await recordFail(env, ip); return errorResponse('Invalid recovery code', 401); }
        await env.DB.prepare("UPDATE admin_settings SET value = ?, updatedAt = ? WHERE key = 'admin_password_hash'")
          .bind(await hashPassword(pw), new Date().toISOString()).run();
        return jsonResponse({ success: true });
      }

      // ========== USERS ==========
      if (path === '/api/users' && method === 'GET') {
        const result = await env.DB.prepare('SELECT data FROM users ORDER BY createdAt DESC').all();
        const users = (result.results || [])
          .map((r: any) => { try { return flattenUser(JSON.parse(r.data)); } catch { return null; } })
          .filter(Boolean);
        return jsonResponse(users);
      }

      if (path === '/api/users' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const rawUser = await parseBody(request);
        if (!rawUser.id) return errorResponse('Missing user.id');
        if (!ctx.isAdmin && ctx.user!.userId !== rawUser.id) return errorResponse('Forbidden', 403);

        const { password: _p, password_hash: _ph, teacherDetails, ...rest } = rawUser;
        const user: any = { ...rest, ...(teacherDetails && typeof teacherDetails === 'object' ? teacherDetails : {}) };
        delete user.teacherDetails;

        const now = new Date().toISOString();
        const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(user.id).first();
        if (existing) {
          await env.DB.prepare('UPDATE users SET data = ?, role = ?, updatedAt = ? WHERE id = ?')
            .bind(JSON.stringify(user), user.role || 'STUDENT', now, user.id).run();
        } else {
          await env.DB.prepare(
            `INSERT INTO users (id, email, password_hash, data, role, createdAt, updatedAt) VALUES (?, ?, 'RE_REGISTER_REQUIRED', ?, ?, ?, ?)`
          ).bind(user.id, user.email || '', JSON.stringify(user), user.role || 'STUDENT', now, now).run();
        }
        return jsonResponse({ success: true, user });
      }

      if (path.startsWith('/api/users/') && method === 'DELETE') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const id = path.replace('/api/users/', '');
        if (!ctx.isAdmin && ctx.user!.userId !== id) return errorResponse('Forbidden', 403);
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ========== POSTS ==========
      if (path === '/api/posts' && method === 'GET') {
        // 🆕 Fire-and-forget cleanup
        autoCleanupOldPosts(env).catch(() => {});
        const result = await env.DB.prepare('SELECT data FROM tuition_posts ORDER BY createdAt DESC').all();
        return jsonResponse((result.results || []).map((r: any) => JSON.parse(r.data)));
      }

      if (path === '/api/posts' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const post = await parseBody(request);
        if (!post.id || !post.studentId) return errorResponse('Missing fields');
        if (!ctx.isAdmin && ctx.user!.userId !== post.studentId) return errorResponse('Forbidden', 403);
        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO tuition_posts (id, studentId, data, district, approvalStatus, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, district=excluded.district,
             approvalStatus=excluded.approvalStatus, status=excluded.status, updatedAt=excluded.updatedAt`
        ).bind(post.id, post.studentId, JSON.stringify(post), post.district || '',
          post.approvalStatus || 'PENDING', post.status || 'OPEN',
          post.createdAt || now, now).run();
        return jsonResponse({ success: true, post });
      }

      if (path.startsWith('/api/posts/') && method === 'DELETE') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const id = path.replace('/api/posts/', '');
        if (!ctx.isAdmin) {
          const p: any = await env.DB.prepare('SELECT studentId FROM tuition_posts WHERE id = ?').bind(id).first();
          if (p && p.studentId !== ctx.user!.userId) return errorResponse('Forbidden', 403);
        }
        await env.DB.prepare('DELETE FROM tuition_posts WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ========== APPLICATIONS ==========
      if (path === '/api/applications' && method === 'GET') {
        const result = await env.DB.prepare('SELECT data FROM tuition_applications ORDER BY createdAt DESC').all();
        return jsonResponse((result.results || []).map((r: any) => JSON.parse(r.data)));
      }

      if (path === '/api/applications' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const app = await parseBody(request);
        if (!app.id || !app.postId || !app.tutorId) return errorResponse('Missing fields');

        // Permission: admin OR tutor (own app) OR student (owns the post)
        let hasPermission = ctx.isAdmin;
        if (!hasPermission && ctx.user) {
          if (ctx.user.userId === app.tutorId) hasPermission = true;
          if (!hasPermission) {
            const post: any = await env.DB.prepare('SELECT studentId FROM tuition_posts WHERE id = ?').bind(app.postId).first();
            if (post && post.studentId === ctx.user.userId) hasPermission = true;
          }
          // 🆕 Also allow if application is ACCEPTED and currentUser is the saved studentId
          // (handles post-deleted scenario where post lookup fails)
          if (!hasPermission && app.status === 'ACCEPTED' && app.studentId === ctx.user.userId) {
            hasPermission = true;
          }
        }
        if (!hasPermission) return errorResponse('Forbidden: You do not own this application or post', 403);

        const now = new Date().toISOString();
        await env.DB.prepare(
          `INSERT INTO tuition_applications (id, postId, tutorId, data, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, status=excluded.status, updatedAt=excluded.updatedAt`
        ).bind(app.id, app.postId, app.tutorId, JSON.stringify(app),
          app.status || 'PENDING', app.createdAt || now, now).run();
        return jsonResponse({ success: true, application: app });
      }

      if (path.startsWith('/api/applications/') && method === 'DELETE') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const id = path.replace('/api/applications/', '');
        if (!ctx.isAdmin) {
          const a: any = await env.DB.prepare('SELECT tutorId FROM tuition_applications WHERE id = ?').bind(id).first();
          if (a && a.tutorId !== ctx.user!.userId) return errorResponse('Forbidden', 403);
        }
        await env.DB.prepare('DELETE FROM tuition_applications WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ========== QUIZZES ==========
      if (path === '/api/quizzes' && method === 'GET') {
        try {
          const result = await env.DB.prepare('SELECT * FROM quizzes ORDER BY createdAt DESC').all();
          return jsonResponse(result.results || []);
        } catch { return jsonResponse([]); }
      }

      if (path === '/api/quizzes' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && ctx.user?.role !== 'TUTOR') return errorResponse('Only tutors', 403);
        const q = await parseBody(request);
        await env.DB.prepare(
          `INSERT INTO quizzes (id, teacherId, teacherName, subject, gradeLevel, topic, questionText, options, correctIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(q.id, q.teacherId, q.teacherName, q.subject, q.gradeLevel, q.topic || '', q.questionText, JSON.stringify(q.options), q.correctIndex, new Date().toISOString()).run();
        return jsonResponse({ success: true });
      }

      // ========== EXAMS ==========
      if (path === '/api/exams' && method === 'POST') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && ctx.user?.role !== 'TUTOR') return errorResponse('Only tutors', 403);
        const e = await parseBody(request);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare(
          `INSERT INTO exam_sets (id, teacherId, teacherName, title, questionIds, timeLimit, createdAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(e.id, e.teacherId, e.teacherName, e.title, JSON.stringify(e.questionIds), e.timeLimit, new Date().toISOString(), expiresAt).run();
        return jsonResponse({ success: true, examId: e.id });
      }

      if (path.startsWith('/api/exams/') && !path.includes('/submit') && method === 'GET') {
        const id = path.replace('/api/exams/', '');
        const exam: any = await env.DB.prepare('SELECT * FROM exam_sets WHERE id = ?').bind(id).first();
        if (!exam) return errorResponse('Exam not found', 404);
        if (new Date(exam.expiresAt) < new Date()) {
          await env.DB.prepare('DELETE FROM exam_sets WHERE id = ?').bind(id).run();
          return errorResponse('Exam expired', 410);
        }
        const ids = JSON.parse(exam.questionIds);
        const ph = ids.map(() => '?').join(',');
        const qs = await env.DB.prepare(`SELECT id, questionText, options FROM quizzes WHERE id IN (${ph})`).bind(...ids).all();
        return jsonResponse({
          ...exam,
          questions: (qs.results || []).map((q: any) => ({ id: q.id, questionText: q.questionText, options: JSON.parse(q.options) })),
        });
      }

      if (path.startsWith('/api/exams/') && path.endsWith('/submit') && method === 'POST') {
        const examId = path.replace('/api/exams/', '').replace('/submit', '');
        const body = await parseBody(request);
        const answers = Array.isArray(body.answers) ? body.answers : [];
        const exam: any = await env.DB.prepare('SELECT * FROM exam_sets WHERE id = ?').bind(examId).first();
        if (!exam) return errorResponse('Exam not found', 404);
        const ids = JSON.parse(exam.questionIds);
        const ph = ids.map(() => '?').join(',');
        const qs = await env.DB.prepare(`SELECT id, correctIndex FROM quizzes WHERE id IN (${ph})`).bind(...ids).all();
        const map = new Map((qs.results || []).map((q: any) => [q.id, q]));
        let score = 0;
        ids.forEach((qid: string, i: number) => {
          const q: any = map.get(qid);
          if (q && answers[i] === q.correctIndex) score++;
        });
        const rid = `res_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        await env.DB.prepare(
          `INSERT INTO exam_results (id, examSetId, studentId, studentName, score, total, answers, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(rid, examId, body.studentId || 'anon', body.studentName || 'Anon', score, ids.length, JSON.stringify(answers), new Date().toISOString()).run();
        return jsonResponse({ success: true, score, total: ids.length, resultId: rid });
      }

      if (path.startsWith('/api/exams/') && method === 'DELETE') {
        const ctx = await getAuth(request, env);
        if (!ctx.isAdmin && !ctx.user) return errorResponse('Unauthorized', 401);
        const id = path.replace('/api/exams/', '');
        if (!ctx.isAdmin) {
          const e: any = await env.DB.prepare('SELECT teacherId FROM exam_sets WHERE id = ?').bind(id).first();
          if (e && e.teacherId !== ctx.user!.userId) return errorResponse('Forbidden', 403);
        }
        await env.DB.prepare('DELETE FROM exam_sets WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      return errorResponse('Not found', 404);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Internal error';
      console.error('API error:', err);
      return errorResponse(msg, 500);
    }
  },
};