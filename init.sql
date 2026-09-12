-- PostgreSQL Schema for AcuityPro
-- Baby Memorial Hospital (BMH), Kozhikode

CREATE TABLE IF NOT EXISTS wards (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  floor VARCHAR(20) DEFAULT 'Floor 1',
  bed_capacity INTEGER NOT NULL DEFAULT 20,
  beds JSONB,
  department_type VARCHAR(50) NOT NULL DEFAULT 'General',
  target_utilization INTEGER NOT NULL DEFAULT 85,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(20) DEFAULT 'MANUAL',
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nurses (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  competency VARCHAR(30) NOT NULL, -- Novice, Advanced Beginner, Competent, Proficient, Expert
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE SET NULL,
  contact_number VARCHAR(25),
  email VARCHAR(100),
  experience_years NUMERIC(4,1) DEFAULT 1.0,
  max_acuity_capacity INTEGER NOT NULL DEFAULT 10,
  status VARCHAR(20) DEFAULT 'Active', -- Active, On Leave
  shift_preference VARCHAR(30) DEFAULT 'Flexible',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  uhid VARCHAR(50) UNIQUE NOT NULL,
  admission_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  room_bed VARCHAR(30) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE SET NULL,
  admission_date DATE NOT NULL,
  diagnosis TEXT,
  current_acuity_score INTEGER DEFAULT 1,
  current_acuity_category INTEGER DEFAULT 1, -- 1, 2, 3, 4
  last_acuity_update TIMESTAMP,
  source VARCHAR(20) DEFAULT 'MANUAL',
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acuity_form_templates (
  id VARCHAR(64) PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(100) NOT NULL,
  fields_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acuity_assessments (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE SET NULL,
  evaluated_by VARCHAR(100),
  shift_date DATE NOT NULL,
  shift_type VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  category INTEGER NOT NULL,
  responses_json JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS duty_rosters (
  id VARCHAR(64) PRIMARY KEY,
  nurse_id VARCHAR(64) REFERENCES nurses(id) ON DELETE CASCADE,
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  shift_type VARCHAR(30) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_nurse_date UNIQUE (nurse_id, assignment_date)
);

CREATE TABLE IF NOT EXISTS patient_nurse_assignments (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id VARCHAR(64) REFERENCES nurses(id) ON DELETE CASCADE,
  ward_id VARCHAR(64) REFERENCES wards(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  shift_type VARCHAR(30) NOT NULL,
  assigned_mode VARCHAR(20) DEFAULT 'AI_AUTO',
  continuity_score NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
