-- ============================================
-- PORABO DATABASE SCHEMA
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,          -- Full user JSON
  role TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tuition_posts (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,          -- Full post JSON
  studentId TEXT NOT NULL,
  district TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tuition_applications (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,          -- Full application JSON
  postId TEXT NOT NULL,
  tutorId TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_posts_student ON tuition_posts(studentId);
CREATE INDEX IF NOT EXISTS idx_apps_tutor ON tuition_applications(tutorId);
CREATE INDEX IF NOT EXISTS idx_apps_post ON tuition_applications(postId);


CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);