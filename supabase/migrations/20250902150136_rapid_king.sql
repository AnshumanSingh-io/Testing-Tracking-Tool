/*
  # Initial Database Schema for Testing Tracker Tool

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    - `test_cases`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `version` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `test_case_versions`
      - `id` (uuid, primary key)
      - `test_case_id` (uuid, references test_cases)
      - `version` (integer)
      - `title` (text)
      - `description` (text)
      - `priority` (text)
      - `status` (text)
      - `changed_at` (timestamp)
    - `test_runs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `name` (text)
      - `tester` (text)
      - `status` (text)
      - `created_at` (timestamp)
    - `test_run_entries`
      - `id` (uuid, primary key)
      - `test_run_id` (uuid, references test_runs)
      - `test_case_id` (uuid, references test_cases)
      - `status` (text)
      - `comments` (text)
      - `executed_at` (timestamp)
    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `message` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Users can only see their own projects, test cases, and activity logs
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Test cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Not Started',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage test cases in their projects"
  ON test_cases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = test_cases.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Test case versions table
CREATE TABLE IF NOT EXISTS test_case_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id uuid REFERENCES test_cases(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  priority text NOT NULL,
  status text NOT NULL,
  changed_at timestamptz DEFAULT now()
);

ALTER TABLE test_case_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their test cases"
  ON test_case_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_cases 
      JOIN projects ON test_cases.project_id = projects.id
      WHERE test_cases.id = test_case_versions.test_case_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Test runs table
CREATE TABLE IF NOT EXISTS test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  tester text NOT NULL,
  status text NOT NULL DEFAULT 'In Progress',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage test runs in their projects"
  ON test_runs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = test_runs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Test run entries table
CREATE TABLE IF NOT EXISTS test_run_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_run_id uuid REFERENCES test_runs(id) ON DELETE CASCADE NOT NULL,
  test_case_id uuid REFERENCES test_cases(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'Not Run',
  comments text DEFAULT '',
  executed_at timestamptz
);

ALTER TABLE test_run_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage test run entries in their projects"
  ON test_run_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_runs 
      JOIN projects ON test_runs.project_id = projects.id
      WHERE test_runs.id = test_run_entries.test_run_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activity logs"
  ON activity_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_test_case_versions_test_case_id ON test_case_versions(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_project_id ON test_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_test_run_entries_test_run_id ON test_run_entries(test_run_id);
CREATE INDEX IF NOT EXISTS idx_test_run_entries_test_case_id ON test_run_entries(test_case_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);