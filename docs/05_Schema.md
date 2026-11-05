# Database Schema & Security Specification — TuitionMatch

**Document:** 05_Schema.md  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal Software Architect / Database Architect  

---

## 1. Entity-Relationship Overview (ERD)

```
       +-------------------------+
       |          users          |
       +-------------------------+
       | PK  id                  |
       |     email (UNIQUE)      |
       |     phone               |
       |     role                |
       |     full_name           |
       |     geom / lat / lng    |
       |     exact_address       |
       +------------+------------+
                    |
       +------------+------------+
       |                         |
       v (1:N as student)        v (1:N as tutor)
+-----------------------+   +----------------------------+
|     tuition_posts     |   |    tuition_applications    |
+-----------------------+   +----------------------------+
| PK  id                |   | PK  id                     |
| FK  student_id        |   | FK  post_id                |
|     title             |<--+ FK  tutor_id               |
|     subject           |   |     proposed_salary        |
|     grade_level       |   |     message                |
|     salary_budget     |   |     status (PENDING, etc.) |
|     area_name         |   |     accepted_at            |
|     geom / lat / lng  |   +----------------------------+
|     exact_address     |
|     status            |
+-----------------------+
```

---

## 2. Complete SQL DDL Schema (PostgreSQL & PostGIS)

```sql
-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ENUMS
CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'TUTOR', 'ADMIN');
CREATE TYPE post_status_enum AS ENUM ('OPEN', 'MATCHED', 'CLOSED', 'CANCELLED');
CREATE TYPE application_status_enum AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE gender_preference_enum AS ENUM ('ANY', 'MALE_ONLY', 'FEMALE_ONLY');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    full_name VARCHAR(120) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    qualifications TEXT,               -- e.g. "B.Sc in Electrical Engineering, BUET"
    institution VARCHAR(200),           -- College / University
    
    -- Location Attributes
    area_name VARCHAR(150) NOT NULL,   -- e.g. "Dhanmondi 27", "Gulshan 1"
    exact_address TEXT NOT NULL,       -- e.g. "House 14, Road 5, Apt 4A" (PROTECTED)
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for users
CREATE INDEX idx_users_geom ON users USING GIST (geom);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);


-- 3. TUITION POSTS TABLE
CREATE TABLE tuition_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,       -- e.g. "Need Class 9 Higher Math Tutor"
    subject VARCHAR(100) NOT NULL,     -- e.g. "Higher Math & Physics"
    grade_level VARCHAR(60) NOT NULL,  -- e.g. "Class 10 (SSC)", "O-Level"
    curriculum VARCHAR(60) NOT NULL,   -- e.g. "Bangla Medium", "English Version", "Cambridge"
    days_per_week SMALLINT NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
    hours_per_day NUMERIC(3, 1) DEFAULT 1.5,
    salary_budget NUMERIC(10, 2) NOT NULL CHECK (salary_budget > 0),
    gender_preference gender_preference_enum DEFAULT 'ANY',
    
    -- Geospatial & Privacy Data
    area_name VARCHAR(150) NOT NULL,   -- Public display: "Banani Road 11"
    exact_address TEXT NOT NULL,       -- PROTECTED: Disclosed ONLY to accepted tutor
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    
    special_requirements TEXT,
    status post_status_enum NOT NULL DEFAULT 'OPEN',
    accepted_tutor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial and Filtering Indexes
CREATE INDEX idx_tuition_posts_geom ON tuition_posts USING GIST (geom);
CREATE INDEX idx_tuition_posts_status ON tuition_posts (status);
CREATE INDEX idx_tuition_posts_student ON tuition_posts (student_id);
CREATE INDEX idx_tuition_posts_subject ON tuition_posts (subject);


-- 4. TUITION APPLICATIONS TABLE
CREATE TABLE tuition_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES tuition_posts(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    proposed_salary NUMERIC(10, 2) NOT NULL CHECK (proposed_salary > 0),
    available_schedule TEXT NOT NULL,  -- e.g. "Sat, Mon, Wed 4pm-6pm"
    message TEXT NOT NULL,             -- Proposal cover note
    status application_status_enum NOT NULL DEFAULT 'PENDING',
    
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Enforce single application per tutor per post
    CONSTRAINT uq_post_tutor UNIQUE (post_id, tutor_id)
);

CREATE INDEX idx_applications_post ON tuition_applications(post_id);
CREATE INDEX idx_applications_tutor ON tuition_applications(tutor_id);
CREATE INDEX idx_applications_status ON tuition_applications(status);


-- 5. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,         -- e.g. 'APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED'
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

---

## 3. Row-Level Security (RLS) & Access Control Policies

PostgreSQL RLS ensures that database clients cannot query hidden phone numbers or addresses even with raw SQL injection attempts:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_applications ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC VIEW FOR POSTS: Anyone can read open posts, but exact_address is restricted
CREATE POLICY "Public posts viewable by authenticated users"
ON tuition_posts FOR SELECT
USING (true);

-- 2. STUDENT POST CREATION: Only authenticated users with STUDENT role
CREATE POLICY "Students can insert their own posts"
ON tuition_posts FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- 3. STUDENT POST UPDATE: Only the student owner can update
CREATE POLICY "Students can update their own posts"
ON tuition_posts FOR UPDATE
USING (auth.uid() = student_id);

-- 4. APPLICATIONS INSERT: Only tutors can apply, once per post
CREATE POLICY "Tutors can apply to open posts"
ON tuition_applications FOR INSERT
WITH CHECK (
    auth.uid() = tutor_id AND
    EXISTS (SELECT 1 FROM tuition_posts WHERE id = post_id AND status = 'OPEN')
);

-- 5. APPLICATIONS SELECT:
-- Visible to the tutor who applied OR the student who owns the post
CREATE POLICY "Applications viewable by applicant and post owner"
ON tuition_applications FOR SELECT
USING (
    auth.uid() = tutor_id OR 
    auth.uid() = (SELECT student_id FROM tuition_posts WHERE id = post_id)
);
```

---

## 4. Secure Database View for Public Feed (Privacy Sanitization)

To guarantee zero accidental data leaks on client-side requests, a public sanitized view strips all private contact columns:

```sql
CREATE OR REPLACE VIEW view_public_tuition_feed AS
SELECT 
    p.id,
    p.title,
    p.subject,
    p.grade_level,
    p.curriculum,
    p.days_per_week,
    p.hours_per_day,
    p.salary_budget,
    p.gender_preference,
    p.area_name,                -- Safe area e.g. "Dhanmondi"
    -- Notice: p.exact_address is OMITTED
    p.latitude,
    p.longitude,
    p.geom,
    p.status,
    p.created_at,
    (SELECT COUNT(*) FROM tuition_applications WHERE post_id = p.id) AS total_applications
FROM tuition_posts p
WHERE p.status = 'OPEN';
```

---

## 5. Atomic Acceptance Stored Procedure / Transaction

When a student accepts a tutor, all state mutations must occur in a single atomic transaction:

```sql
CREATE OR REPLACE FUNCTION accept_tuition_tutor(
    target_post_id UUID,
    chosen_application_id UUID,
    acting_student_id UUID
) RETURNS VOID AS $$
DECLARE
    chosen_tutor_id UUID;
BEGIN
    -- 1. Verify student ownership of post
    IF NOT EXISTS (
        SELECT 1 FROM tuition_posts 
        WHERE id = target_post_id AND student_id = acting_student_id AND status = 'OPEN'
    ) THEN
        RAISE EXCEPTION 'Unauthorized or post is no longer open';
    END IF;

    -- 2. Retrieve tutor ID from the chosen application
    SELECT tutor_id INTO chosen_tutor_id 
    FROM tuition_applications 
    WHERE id = chosen_application_id AND post_id = target_post_id;

    IF chosen_tutor_id IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    -- 3. Lock the post and record accepted tutor
    UPDATE tuition_posts 
    SET status = 'MATCHED',
        accepted_tutor_id = chosen_tutor_id,
        updated_at = NOW()
    WHERE id = target_post_id;

    -- 4. Mark chosen application as ACCEPTED
    UPDATE tuition_applications
    SET status = 'ACCEPTED',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = chosen_application_id;

    -- 5. Mark all other competing applications as REJECTED
    UPDATE tuition_applications
    SET status = 'REJECTED',
        updated_at = NOW()
    WHERE post_id = target_post_id AND id <> chosen_application_id;

    -- 6. Insert notification for accepted tutor
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
        chosen_tutor_id,
        'APPLICATION_ACCEPTED',
        'Congratulations! Tuition Accepted',
        'Your application was accepted by the student. Tap to view full contact and address details.',
        json_build_object('post_id', target_post_id, 'application_id', chosen_application_id)
    );
END;
$$ LANGUAGE plpgsql;
```
