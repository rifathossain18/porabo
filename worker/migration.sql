-- Porabo D1 Migration — Hybrid Mode (preserves all data)

-- ========== USERS ==========
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN updatedAt TEXT;

UPDATE users 
SET password_hash = 'LEGACY:' || json_extract(data, '$.password')
WHERE password_hash IS NULL 
  AND data IS NOT NULL
  AND json_extract(data, '$.password') IS NOT NULL;

UPDATE users SET updatedAt = createdAt WHERE updatedAt IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ========== POSTS ==========
ALTER TABLE tuition_posts ADD COLUMN approvalStatus TEXT;
ALTER TABLE tuition_posts ADD COLUMN status TEXT;
ALTER TABLE tuition_posts ADD COLUMN updatedAt TEXT;

UPDATE tuition_posts 
SET approvalStatus = COALESCE(json_extract(data, '$.approvalStatus'), 'APPROVED')
WHERE approvalStatus IS NULL;

UPDATE tuition_posts 
SET status = COALESCE(json_extract(data, '$.status'), 'OPEN')
WHERE status IS NULL;

UPDATE tuition_posts SET updatedAt = createdAt WHERE updatedAt IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_studentId ON tuition_posts(studentId);
CREATE INDEX IF NOT EXISTS idx_posts_district ON tuition_posts(district);
CREATE INDEX IF NOT EXISTS idx_posts_approval ON tuition_posts(approvalStatus);

-- ========== APPLICATIONS ==========
ALTER TABLE tuition_applications ADD COLUMN status TEXT;
ALTER TABLE tuition_applications ADD COLUMN updatedAt TEXT;

UPDATE tuition_applications 
SET status = COALESCE(json_extract(data, '$.status'), 'PENDING')
WHERE status IS NULL;

UPDATE tuition_applications SET updatedAt = createdAt WHERE updatedAt IS NULL;
CREATE INDEX IF NOT EXISTS idx_apps_postId ON tuition_applications(postId);
CREATE INDEX IF NOT EXISTS idx_apps_tutorId ON tuition_applications(tutorId);
CREATE INDEX IF NOT EXISTS idx_apps_status ON tuition_applications(status);

-- ========== ADMIN SETTINGS ==========
ALTER TABLE admin_settings ADD COLUMN updatedAt TEXT;
UPDATE admin_settings SET updatedAt = datetime('now') WHERE updatedAt IS NULL;

-- ========== NEW TABLE ==========
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip TEXT PRIMARY KEY,
  attemptCount INTEGER DEFAULT 0,
  firstAttemptAt TEXT NOT NULL,
  lastAttemptAt TEXT NOT NULL
);

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

-- ========== EXAM RESULTS ==========
ALTER TABLE exam_results ADD COLUMN answers TEXT;