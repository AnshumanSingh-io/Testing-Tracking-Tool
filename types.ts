
export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum Status {
  Pending = 'PENDING',
  Pass = 'PASS',
  Fail = 'FAIL',
  Blocked = 'BLOCKED',
}

export enum ExecutionStatus {
  NotRun = 'Not Run',
  Passed = 'Passed',
  Failed = 'Failed',
  Blocked = 'Blocked',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SUPER_USER = 'SUPER_USER',
  USER = 'USER',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  ownerId: string;
  members: string[]; // Array of User IDs
}

export interface TestCase {
  id: string;
  projectId: string;
  // Mapped from Excel: TEST SCENARIO'S
  title: string; 
  // Mapped from Excel: MENU USED
  menuUsed: string;
  // Mapped from Excel: TEST DATA
  testData: string;
  // Mapped from Excel: EXPECTED BEHAVIOUR
  description: string; 
  // Mapped from Excel: OBSERVED BEHAVIOUR
  observedBehaviour: string;
  // Mapped from Excel: STATUS
  status: Status;
  // Mapped from Excel: SCREENSHOT REFERENCE
  screenshotRef: string;
  // Mapped from Excel: SUGGESTIONS
  suggestions: string;
  
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Attachment {
  id: string;
  testCaseId: string;
  name: string;
  type: string;
  size: number;
  content: Blob; 
  uploadedAt: string;
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
  role: UserRole;
}

export interface Activity {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
}

export interface TestRun {
  id:string;
  projectId: string;
  name: string;
  testerId: string;
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
  executedById?: string;
}
