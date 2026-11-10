CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  teacherId TEXT NOT NULL,
  teacherName TEXT NOT NULL,
  subject TEXT NOT NULL,
  gradeLevel TEXT NOT NULL,
  topic TEXT NOT NULL,
  questionText TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON string array of 4 options
  correctIndex INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exam_sets (
  id TEXT PRIMARY KEY,
  teacherId TEXT NOT NULL,
  teacherName TEXT NOT NULL,
  title TEXT NOT NULL,
  questionIds TEXT NOT NULL, -- JSON array of quiz IDs
  timeLimit INTEGER NOT NULL, -- in minutes
  createdAt TEXT NOT NULL,
  expiresAt TEXT NOT NULL -- 1 day after creation
);

CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY,
  examSetId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  studentName TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completedAt TEXT NOT NULL
);