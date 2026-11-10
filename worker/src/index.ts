/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
}

// CORS Headers - এগুলো ছাড়া ব্রাউজার কোনো রিকোয়েস্ট অ্যাকসেপ্ট করবে না
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders, // প্রতিটা রেসপন্সে CORS হেডার যাচ্ছে
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
    // 🚨 সবচেয়ে গুরুত্বপূর্ণ: Preflight (OPTIONS) হ্যান্ডেল করা
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ============ HEALTH CHECK ============
      if (path === '/' || path === '/health') {
        return jsonResponse({ status: 'ok', service: 'porabo-api', time: new Date().toISOString() });
      }

      // ============ ADMIN AUTH ============
      if (path === '/api/admin/config' && method === 'GET') {
        try {
          const result = await env.DB.prepare(
            "SELECT value FROM admin_settings WHERE key = 'admin_password_hash'"
          ).first();
          return jsonResponse({ hasPassword: !!result });
        } catch (e) {
          return jsonResponse({ hasPassword: false }); 
        }
      }

      if (path === '/api/admin/config/init' && method === 'POST') {
        const body = await parseBody(request);
        if (!body.password) return errorResponse('Password required');
        
        const existing = await env.DB.prepare(
          "SELECT value FROM admin_settings WHERE key = 'admin_password_hash'"
        ).first();
        if (existing) return errorResponse('Admin already initialized', 400);

        const msgBuffer = new TextEncoder().encode(body.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        const recoveryCode = crypto.randomUUID().slice(0, 8).toUpperCase();

        await env.DB.batch([
          env.DB.prepare("INSERT INTO admin_settings (key, value) VALUES ('admin_password_hash', ?)").bind(hashHex),
          env.DB.prepare("INSERT INTO admin_settings (key, value) VALUES ('admin_recovery_code', ?)").bind(recoveryCode)
        ]);

        return jsonResponse({ success: true, recoveryCode });
      }

      if (path === '/api/admin/config/login' && method === 'POST') {
        const body = await parseBody(request);
        const existing: any = await env.DB.prepare(
          "SELECT value FROM admin_settings WHERE key = 'admin_password_hash'"
        ).first();
        
        if (!existing) return errorResponse('Admin not initialized', 400);

        const msgBuffer = new TextEncoder().encode(body.password || '');
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        if (hashHex === existing.value) {
          return jsonResponse({ success: true });
        }
        return errorResponse('Incorrect password', 401);
      }

      if (path === '/api/admin/config/reset' && method === 'POST') {
        const body = await parseBody(request);
        const existing: any = await env.DB.prepare(
          "SELECT value FROM admin_settings WHERE key = 'admin_recovery_code'"
        ).first();

        if (!existing || existing.value !== body.recoveryCode) {
          return errorResponse('Invalid recovery code', 401);
        }

        const msgBuffer = new TextEncoder().encode(body.newPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        await env.DB.prepare(
          "UPDATE admin_settings SET value = ? WHERE key = 'admin_password_hash'"
        ).bind(hashHex).run();

        return jsonResponse({ success: true });
      }

      // ============ USERS ============
      if (path === '/api/users' && method === 'GET') {
        const result = await env.DB.prepare('SELECT data FROM users ORDER BY createdAt DESC').all();
        const users = (result.results || []).map((r: any) => JSON.parse(r.data));
        return jsonResponse(users);
      }

      if (path === '/api/users' && method === 'POST') {
        const user = await parseBody(request);
        if (!user.id || !user.email || !user.role) return errorResponse('Missing required fields');
        await env.DB.prepare(
          `INSERT INTO users (id, data, role, email, createdAt) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, role=excluded.role, email=excluded.email`
        ).bind(user.id, JSON.stringify(user), user.role, String(user.email).toLowerCase(), user.verificationSubmittedAt || new Date().toISOString()).run();
        return jsonResponse({ success: true, user });
      }

      if (path.startsWith('/api/users/') && method === 'DELETE') {
        const id = path.replace('/api/users/', '');
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ POSTS ============
      if (path === '/api/posts' && method === 'GET') {
        const result = await env.DB.prepare('SELECT data FROM tuition_posts ORDER BY createdAt DESC').all();
        const posts = (result.results || []).map((r: any) => JSON.parse(r.data));
        return jsonResponse(posts);
      }

      if (path === '/api/posts' && method === 'POST') {
        const post = await parseBody(request);
        if (!post.id || !post.studentId) return errorResponse('Missing required fields');
        await env.DB.prepare(
          `INSERT INTO tuition_posts (id, data, studentId, district, createdAt) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data, district=excluded.district`
        ).bind(post.id, JSON.stringify(post), post.studentId, post.district || '', post.createdAt || new Date().toISOString()).run();
        return jsonResponse({ success: true, post });
      }

      if (path.startsWith('/api/posts/') && method === 'DELETE') {
        const id = path.replace('/api/posts/', '');
        await env.DB.prepare('DELETE FROM tuition_posts WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ APPLICATIONS ============
      if (path === '/api/applications' && method === 'GET') {
        const result = await env.DB.prepare('SELECT data FROM tuition_applications ORDER BY createdAt DESC').all();
        const apps = (result.results || []).map((r: any) => JSON.parse(r.data));
        return jsonResponse(apps);
      }

      if (path === '/api/applications' && method === 'POST') {
        const app = await parseBody(request);
        if (!app.id || !app.postId || !app.tutorId) return errorResponse('Missing required fields');
        await env.DB.prepare(
          `INSERT INTO tuition_applications (id, data, postId, tutorId, createdAt) VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET data=excluded.data`
        ).bind(app.id, JSON.stringify(app), app.postId, app.tutorId, app.createdAt || new Date().toISOString()).run();
        return jsonResponse({ success: true, application: app });
      }

      if (path.startsWith('/api/applications/') && method === 'DELETE') {
        const id = path.replace('/api/applications/', '');
        await env.DB.prepare('DELETE FROM tuition_applications WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      // ============ QUIZZES & EXAMS ============
      if (path === '/api/quizzes' && method === 'GET') {
        try {
          const result = await env.DB.prepare('SELECT * FROM quizzes ORDER BY createdAt DESC').all();
          return jsonResponse(result.results || []);
        } catch (e) {
          // যদি টেবিল এখনো তৈরি না হয়ে থাকে, খালি অ্যারে রিটার্ন করবে
          return jsonResponse([]);
        }
      }

      if (path === '/api/quizzes' && method === 'POST') {
        const quiz = await parseBody(request);
        await env.DB.prepare(
          `INSERT INTO quizzes (id, teacherId, teacherName, subject, gradeLevel, topic, questionText, options, correctIndex, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(quiz.id, quiz.teacherId, quiz.teacherName, quiz.subject, quiz.gradeLevel, quiz.topic, quiz.questionText, JSON.stringify(quiz.options), quiz.correctIndex, new Date().toISOString()).run();
        return jsonResponse({ success: true });
      }

      if (path === '/api/exams' && method === 'POST') {
        const exam = await parseBody(request);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await env.DB.prepare(
          `INSERT INTO exam_sets (id, teacherId, teacherName, title, questionIds, timeLimit, createdAt, expiresAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(exam.id, exam.teacherId, exam.teacherName, exam.title, JSON.stringify(exam.questionIds), exam.timeLimit, new Date().toISOString(), expiresAt).run();
        return jsonResponse({ success: true, examId: exam.id });
      }

      if (path.startsWith('/api/exams/') && method === 'GET') {
        const id = path.replace('/api/exams/', '');
        const exam: any = await env.DB.prepare('SELECT * FROM exam_sets WHERE id = ?').bind(id).first();
        
        if (!exam) return errorResponse('Exam not found or expired', 404);
        
        if (new Date(exam.expiresAt) < new Date()) {
          await env.DB.prepare('DELETE FROM exam_sets WHERE id = ?').bind(id).run();
          return errorResponse('This exam link has expired (24 hours limit).', 410);
        }

        const questionIds = JSON.parse(exam.questionIds);
        if (questionIds.length === 0) return jsonResponse({ ...exam, questions: [] });
        
        const placeholders = questionIds.map(() => '?').join(',');
        const questionsResult = await env.DB.prepare(`SELECT * FROM quizzes WHERE id IN (${placeholders})`).bind(...questionIds).all();
        
        return jsonResponse({
          ...exam,
          questions: (questionsResult.results || []).map((q: any) => ({ ...q, options: JSON.parse(q.options) }))
        });
      }

      if (path.startsWith('/api/exams/') && path.endsWith('/submit') && method === 'POST') {
        const id = path.replace('/api/exams/', '').replace('/submit', '');
        const result = await parseBody(request);
        await env.DB.prepare(
          `INSERT INTO exam_results (id, examSetId, studentId, studentName, score, total, completedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(result.id, id, result.studentId, result.studentName, result.score, result.total, new Date().toISOString()).run();
        return jsonResponse({ success: true });
      }

      if (path.startsWith('/api/exams/') && method === 'DELETE') {
        const id = path.replace('/api/exams/', '');
        await env.DB.prepare('DELETE FROM exam_sets WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
      }

      return errorResponse('Not found', 404);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error('API error:', err);
      // 🚨 এরর হলেও CORS হেডার রিটার্ন করবে, যাতে ব্রাউজার ব্লক না করে
      return errorResponse(message, 500); 
    }
  },
};