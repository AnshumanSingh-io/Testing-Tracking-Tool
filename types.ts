export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Failed = 'Failed',
}

export enum ExecutionStatus {
  NotRun = 'Not Run',
  Passed = 'Passed',
  Failed = 'Failed',
  Blocked = 'Blocked',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TestCaseVersion {
  id: string;
  testCaseId: string;
  version: number;
  data: Omit<TestCase, 'id' | 'projectId' | 'createdAt' | 'updatedAt' | 'version'>;
  changedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // NOTE: Storing plaintext password for this simulation.
}

export interface Activity {
    id: string;
    message: string;
    timestamp: string;
}

export interface TestRun {
  id: string;
  projectId: string;
  name: string;
  tester: string;
  createdAt: string;
  status: 'In Progress' | 'Completed';
}

export interface TestRunEntry {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: ExecutionStatus;
  comments: string;
  executedAt: string | null;
}