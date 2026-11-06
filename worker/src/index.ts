/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
}

interface UserRow {
  data: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

async function parseBody(request: Request): Promise<Record<string, any>> {
  try {
    const body = await request.json();
    return (body || {}) as Record<string, any>;
  } catch {
    return {};
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ============ HEALTH CHECK ============
      if (path === '/' || path === '/health') {
        return jsonResponse({
          status: 'ok',
          service: 'porabo-api',
          time: new Date().toISOString(),
        });
      }

      // ============ USERS ============
      if (path === '/api/users' && method === 'GET') {
        const result = await env.DB.prepare(
          'SELECT data FROM users ORDER BY createdAt DESC'
        ).all<UserRow>();
        const users = (result.results || []).map((r) => JSON.parse(r.data));
        return jsonResponse(users);
      }

      if (path === '/api/users' && method === 'POST') {
        const user = await parseBody(request);
        if (!user.id || !user.email || !user.role) {
          return errorResponse('Missing required fields: id, email, role');
        }
        await env.DB.prepare(
          `INSERT INTO users (id, data, role, email, createdAt)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, role=excluded.role, email=excluded.email`
        )
          .bind(
            user.id,
            JSON.stringify(user),
            user.role,
            String(user.email).toLowerCase(),
            user.verificationSubmittedAt || new Date().toISOString()
          )
          .run();
        return jsonResponse({ success: true, user });
      }

      if (path.startsWith('/api/users/') && method === 'DELETE') {
        const id = path.replace('/api/users/', '');
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ TUITION POSTS ============
      if (path === '/api/posts' && method === 'GET') {
        const result = await env.DB.prepare(
          'SELECT data FROM tuition_posts ORDER BY createdAt DESC'
        ).all<UserRow>();
        const posts = (result.results || []).map((r) => JSON.parse(r.data));
        return jsonResponse(posts);
      }

      if (path === '/api/posts' && method === 'POST') {
        const post = await parseBody(request);
        if (!post.id || !post.studentId) {
          return errorResponse('Missing required fields: id, studentId');
        }
        await env.DB.prepare(
          `INSERT INTO tuition_posts (id, data, studentId, district, createdAt)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, district=excluded.district`
        )
          .bind(
            post.id,
            JSON.stringify(post),
            post.studentId,
            post.district || '',
            post.createdAt || new Date().toISOString()
          )
          .run();
        return jsonResponse({ success: true, post });
      }

      if (path.startsWith('/api/posts/') && method === 'DELETE') {
        const id = path.replace('/api/posts/', '');
        await env.DB.prepare('DELETE FROM tuition_posts WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ APPLICATIONS ============
      if (path === '/api/applications' && method === 'GET') {
        const result = await env.DB.prepare(
          'SELECT data FROM tuition_applications ORDER BY createdAt DESC'
        ).all<UserRow>();
        const apps = (result.results || []).map((r) => JSON.parse(r.data));
        return jsonResponse(apps);
      }

      if (path === '/api/applications' && method === 'POST') {
        const app = await parseBody(request);
        if (!app.id || !app.postId || !app.tutorId) {
          return errorResponse('Missing required fields: id, postId, tutorId');
        }
        await env.DB.prepare(
          `INSERT INTO tuition_applications (id, data, postId, tutorId, createdAt)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data`
        )
          .bind(
            app.id,
            JSON.stringify(app),
            app.postId,
            app.tutorId,
            app.createdAt || new Date().toISOString()
          )
          .run();
        return jsonResponse({ success: true, application: app });
      }

      if (path.startsWith('/api/applications/') && method === 'DELETE') {
        const id = path.replace('/api/applications/', '');
        await env.DB.prepare('DELETE FROM tuition_applications WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ BULK SYNC ============
      if (path === '/api/sync' && method === 'POST') {
        const payload = await parseBody(request);
        const users: any[] = Array.isArray(payload.users) ? payload.users : [];
        const posts: any[] = Array.isArray(payload.posts) ? payload.posts : [];
        const applications: any[] = Array.isArray(payload.applications) ? payload.applications : [];

        for (const u of users) {
          await env.DB.prepare(
            `INSERT INTO users (id, data, role, email, createdAt) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO NOTHING`
          )
            .bind(
              u.id,
              JSON.stringify(u),
              u.role,
              String(u.email).toLowerCase(),
              u.verificationSubmittedAt || new Date().toISOString()
            )
            .run();
        }
        for (const p of posts) {
          await env.DB.prepare(
            `INSERT INTO tuition_posts (id, data, studentId, district, createdAt) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO NOTHING`
          )
            .bind(
              p.id,
              JSON.stringify(p),
              p.studentId,
              p.district || '',
              p.createdAt || new Date().toISOString()
            )
            .run();
        }
        for (const a of applications) {
          await env.DB.prepare(
            `INSERT INTO tuition_applications (id, data, postId, tutorId, createdAt) VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(id) DO NOTHING`
          )
            .bind(
              a.id,
              JSON.stringify(a),
              a.postId,
              a.tutorId,
              a.createdAt || new Date().toISOString()
            )
            .run();
        }
        return jsonResponse({
          success: true,
          synced: {
            users: users.length,
            posts: posts.length,
            applications: applications.length,
          },
        });
      }

      return errorResponse('Not found', 404);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('API error:', err);
      return errorResponse(message, 500);
    }
  },
};