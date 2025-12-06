
import Dexie, { Table } from 'dexie';
import { Project, TestCase, User, Activity, TestRun, TestRunEntry, TestCaseVersion, Attachment } from './types';

export class TestingTrackerDexie extends Dexie {
  projects!: Table<Project>;
  testCases!: Table<TestCase>;
  testCaseVersions!: Table<TestCaseVersion>;
  testRuns!: Table<TestRun>;
  testRunEntries!: Table<TestRunEntry>;
  users!: Table<User>;
  activityLog!: Table<Activity>;
  attachments!: Table<Attachment>;

  constructor() {
    super('testingTrackerDB');
    (this as any).version(2).stores({
      projects: 'id, ownerId, *members', // *members creates a multi-entry index
      testCases: 'id, projectId, menuUsed, status',
      testCaseVersions: 'id, testCaseId',
      testRuns: 'id, projectId, testerId',
      testRunEntries: 'id, testRunId, testCaseId',
      users: 'id, &username, role',
      activityLog: 'id, userId, timestamp',
      attachments: 'id, testCaseId',
    });
  }
}

export const db = new TestingTrackerDexie();
