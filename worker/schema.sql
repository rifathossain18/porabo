-- Porabo D1 Schema — Phase 1 High Risk Fix

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  data TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('STUDENT', 'TUTOR')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS verification_documents (
  userId TEXT PRIMARY KEY,
  identityDocumentType TEXT NOT NULL CHECK(identityDocumentType IN ('NID', 'BIRTH_CERTIFICATE')),
  identityFront TEXT NOT NULL,
  identityBack TEXT,
  studentIdFront TEXT NOT NULL,
  studentIdBack TEXT,
  selfie TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tuition_posts (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  data TEXT NOT NULL,
  district TEXT NOT NULL,
  approvalStatus TEXT DEFAULT 'PENDING',
  status TEXT DEFAULT 'OPEN',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_studentId ON tuition_posts(studentId);
CREATE INDEX IF NOT EXISTS idx_posts_district ON tuition_posts(district);
CREATE INDEX IF NOT EXISTS idx_posts_approval ON tuition_posts(approvalStatus);

CREATE TABLE IF NOT EXISTS tuition_applications (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  tutorId TEXT NOT NULL,
  data TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_apps_postId ON tuition_applications(postId);
CREATE INDEX IF NOT EXISTS idx_apps_tutorId ON tuition_applications(tutorId);

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip TEXT PRIMARY KEY,
  attemptCount INTEGER DEFAULT 0,
  firstAttemptAt TEXT NOT NULL,
  lastAttemptAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  teacherId TEXT NOT NULL,
  teacherName TEXT NOT NULL,
  subject TEXT NOT NULL,
  gradeLevel TEXT NOT NULL,
  topic TEXT NOT NULL,
  questionText TEXT NOT NULL,
  options TEXT NOT NULL,
  correctIndex INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacherId ON quizzes(teacherId);

CREATE TABLE IF NOT EXISTS exam_sets (
  id TEXT PRIMARY KEY,
  teacherId TEXT NOT NULL,
  teacherName TEXT NOT NULL,
  title TEXT NOT NULL,
  questionIds TEXT NOT NULL,
  timeLimit INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY,
  examSetId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  studentName TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  answers TEXT,
  completedAt TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_results_exam ON exam_results(examSetId);