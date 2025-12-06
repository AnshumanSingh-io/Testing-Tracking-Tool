
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, TestCase, User, Activity, TestRun, TestRunEntry, ExecutionStatus, TestCaseVersion, Attachment, UserRole, Status } from '../types';
import { db } from '../db';
import Sidebar from './Sidebar';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';
import ProjectForm from './ProjectForm';
import ProfilePage from './ProfilePage';
import AssignedRunsView from './AssignedRunsView';
import UserManagement from './UserManagement';
import AnalyticsView from './AnalyticsView';

interface DashboardProps {
  user: User;
  allUsers: User[];
  onLogout: () => void;
  updateUser: (user: User) => void;
}

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

const Dashboard: React.FC<DashboardProps> = ({ user, allUsers, onLogout, updateUser }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCaseVersions, setTestCaseVersions] = useState<TestCaseVersion[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [testRunEntries, setTestRunEntries] = useState<TestRunEntry[]>([]);
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  const [currentView, setCurrentView] = useState<'dashboard' | 'project' | 'profile' | 'assigned_runs' | 'user_management' | 'analytics'>('dashboard');
  const [previousView, setPreviousView] = useState<'dashboard' | 'assigned_runs'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [initialRunToShow, setInitialRunToShow] = useState<string | null>(null);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // --- Permission Helpers ---
  const canCreateProject = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_USER;
  // Admin can delete any. Super User can delete owned. User can delete none.
  const canDeleteProject = (project: Project) => {
      if (user.role === UserRole.ADMIN) return true;
      if (user.role === UserRole.SUPER_USER && project.ownerId === user.id) return true;
      return false;
  };
  // Admin is owner of all. Super User is owner of created.
  const isProjectOwner = (project: Project) => {
      if (user.role === UserRole.ADMIN) return true;
      return project.ownerId === user.id;
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let fetchedProjects: Project[] = [];
        let fetchedActivity: Activity[] = [];

        // 1. Fetch Projects based on Role
        if (user.role === UserRole.ADMIN) {
            fetchedProjects = await db.projects.toArray();
            fetchedActivity = await db.activityLog.reverse().sortBy('timestamp');
        } else if (user.role === UserRole.SUPER_USER) {
            // Own projects + projects where they are a member
            const ownProjects = await db.projects.where('ownerId').equals(user.id).toArray();
            const memberProjects = await db.projects.where('members').equals(user.id).toArray();
            const projectMap = new Map();
            [...ownProjects, ...memberProjects].forEach(p => projectMap.set(p.id, p));
            fetchedProjects = Array.from(projectMap.values());
            
            // Activities of self + activities related to projects they own/member of (approximated by user association in this simple schema)
            const allActivities = await db.activityLog.reverse().sortBy('timestamp');
            fetchedActivity = allActivities; // Simplified for demo
        } else {
            // Normal User: Only member projects
            fetchedProjects = await db.projects.where('members').equals(user.id).toArray();
            // Only own activity
            fetchedActivity = await db.activityLog.where({ userId: user.id }).reverse().sortBy('timestamp');
        }

        setProjects(fetchedProjects);
        setActivityLog(fetchedActivity.slice(0, 50));

        // 2. Fetch Dependent Data (Test Cases, Runs, etc) based on visible projects
        const visibleProjectIds = fetchedProjects.map(p => p.id);
        
        const [
            dbTestCases,
            dbTestCaseVersions,
            dbTestRuns,
            dbTestRunEntries,
            dbAttachments,
            dbUsers
        ] = await Promise.all([
            db.testCases.toArray(),
            db.testCaseVersions.toArray(),
            db.testRuns.toArray(),
            db.testRunEntries.toArray(),
            db.attachments.toArray(),
            db.users.toArray()
        ]);

        setTestCases(dbTestCases.filter(tc => visibleProjectIds.includes(tc.projectId)));
        setTestCaseVersions(dbTestCaseVersions); 
        setTestRuns(dbTestRuns.filter(tr => visibleProjectIds.includes(tr.projectId)));
        setTestRunEntries(dbTestRunEntries);
        setAttachments(dbAttachments);
        setUsersList(dbUsers);

      } catch (error) {
        console.error("Failed to fetch data from IndexedDB", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id, user.role]);

  const logActivity = useCallback(async (message: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      userId: user.id,
      message,
      timestamp: new Date().toISOString(),
    };
    await db.activityLog.add(newActivity);
    setActivityLog(prev => [newActivity, ...prev.slice(0, 49)]);
  }, [user.id]);

  // Project Handlers
  const handleSaveProject = useCallback(async (projectData: { name: string, description: string, members: string[] }) => {
    if (projectToEdit) {
      const updatedProject = { ...projectToEdit, ...projectData };
      await db.projects.update(projectToEdit.id, projectData);
      setProjects(prev => prev.map(p => p.id === projectToEdit.id ? updatedProject : p));
      logActivity(`Updated project "${projectData.name}".`);
    } else {
      const newProject: Project = { 
          ...projectData, 
          id: crypto.randomUUID(), 
          createdAt: new Date().toISOString(), 
          ownerId: user.id,
          members: projectData.members || [] 
      };
      await db.projects.add(newProject);
      setProjects(prev => [newProject, ...prev]);
      logActivity(`Created project "${projectData.name}".`);
    }
    setShowProjectForm(false);
    setProjectToEdit(null);
  }, [projectToEdit, logActivity, user.id]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!canDeleteProject(project)) {
        alert("You do not have permission to delete this project.");
        return;
    }

    if (window.confirm('Delete this project and all its test cases & runs? This cannot be undone.')) {
        await (db as any).transaction('rw', ['projects', 'testCases', 'testCaseVersions', 'testRuns', 'testRunEntries', 'attachments'], async () => {
            const associatedTestCaseIds = (await db.testCases.where({ projectId }).toArray()).map(tc => tc.id);
            const associatedTestRunIds = (await db.testRuns.where({ projectId }).toArray()).map(tr => tr.id);
            
            await db.projects.delete(projectId);
            await db.testCases.where({ projectId }).delete();
            if (associatedTestCaseIds.length > 0) {
              await db.testCaseVersions.where('testCaseId').anyOf(associatedTestCaseIds).delete();
              await db.attachments.where('testCaseId').anyOf(associatedTestCaseIds).delete();
            }
            await db.testRuns.where({ projectId }).delete();
            if (associatedTestRunIds.length > 0) {
              await db.testRunEntries.where('testRunId').anyOf(associatedTestRunIds).delete();
            }
        });
        
        logActivity(`Deleted project "${project.name}".`);
        
        setProjects(prev => prev.filter(p => p.id !== projectId));
        // Client side filtering for other entities
        setTestCases(prev => prev.filter(tc => tc.projectId !== projectId));
        setTestRuns(prev => prev.filter(tr => tr.projectId !== projectId));
    }
  }, [projects, logActivity, user.role, user.id]);

  // Test Case Handlers
  const handleAddTestCase = useCallback(async (testCaseData: TestCaseData, newAttachments: File[]) => {
    if (!selectedProjectId) return;
    const now = new Date().toISOString();
    const newTestCase: TestCase = { ...testCaseData, id: crypto.randomUUID(), projectId: selectedProjectId, createdAt: now, updatedAt: now, version: 1 };
    
    const initialVersion: TestCaseVersion = {
        id: crypto.randomUUID(),
        testCaseId: newTestCase.id,
        version: 1,
        data: { ...testCaseData },
        changedAt: now
    };

    const attachmentObjects: Attachment[] = newAttachments.map(file => ({
        id: crypto.randomUUID(),
        testCaseId: newTestCase.id,
        name: file.name,
        type: file.type,
        size: file.size,
        content: file,
        uploadedAt: now
    }));

    await (db as any).transaction('rw', ['testCases', 'testCaseVersions', 'attachments'], async () => {
        await db.testCases.add(newTestCase);
        await db.testCaseVersions.add(initialVersion);
        if (attachmentObjects.length > 0) {
            await db.attachments.bulkAdd(attachmentObjects);
        }
    });
    
    setTestCases(prev => [newTestCase, ...prev]);
    setTestCaseVersions(prev => [initialVersion, ...prev]);
    setAttachments(prev => [...prev, ...attachmentObjects]);
    logActivity(`Added test record "${testCaseData.title}" with ${attachmentObjects.length} attachments.`);
  }, [selectedProjectId, logActivity]);
  
  const handleAddMultipleTestCases = useCallback(async (testCasesData: TestCaseData[]) => {
    if (!selectedProjectId) return;
    const now = new Date().toISOString();
    const newTestCases: TestCase[] = [];
    const newVersions: TestCaseVersion[] = [];

    testCasesData.forEach(testCaseData => {
        const newTestCase: TestCase = {
            ...testCaseData,
            id: crypto.randomUUID(),
            projectId: selectedProjectId,
            createdAt: now,
            updatedAt: now,
            version: 1
        };
        newTestCases.push(newTestCase);

        const initialVersion: TestCaseVersion = {
            id: crypto.randomUUID(),
            testCaseId: newTestCase.id,
            version: 1,
            data: { ...testCaseData },
            changedAt: now
        };
        newVersions.push(initialVersion);
    });

    await (db as any).transaction('rw', ['testCases', 'testCaseVersions'], async () => {
        await db.testCases.bulkAdd(newTestCases);
        await db.testCaseVersions.bulkAdd(newVersions);
    });

    setTestCases(prev => [...newTestCases, ...prev]);
    setTestCaseVersions(prev => [...newVersions, ...prev]);
    logActivity(`Generated and added ${newTestCases.length} new test cases.`);
  }, [selectedProjectId, logActivity]);


  const handleUpdateTestCase = useCallback(async (testCaseId: string, testCaseData: TestCaseData, newFiles: File[], deletedAttachmentIds: string[]) => {
      const now = new Date().toISOString();
      const currentTestCase = testCases.find(tc => tc.id === testCaseId);
      if (!currentTestCase) return;

      const previousVersion: TestCaseVersion = {
          id: crypto.randomUUID(),
          testCaseId: currentTestCase.id,
          version: currentTestCase.version,
          data: {
              title: currentTestCase.title,
              description: currentTestCase.description,
              priority: currentTestCase.priority,
              status: currentTestCase.status,
              menuUsed: currentTestCase.menuUsed,
              testData: currentTestCase.testData,
              observedBehaviour: currentTestCase.observedBehaviour,
              screenshotRef: currentTestCase.screenshotRef,
              suggestions: currentTestCase.suggestions,
          },
          changedAt: currentTestCase.updatedAt,
      };
      
      const updatedTestCase = { ...currentTestCase, ...testCaseData, updatedAt: now, version: currentTestCase.version + 1 };
      
      const newAttachmentObjects: Attachment[] = newFiles.map(file => ({
        id: crypto.randomUUID(),
        testCaseId: testCaseId,
        name: file.name,
        type: file.type,
        size: file.size,
        content: file,
        uploadedAt: now
      }));

      // SYNC LOGIC: Propagate Status and Observed Behaviour to Active Test Runs
      const activeRunIds = testRuns.filter(tr => tr.status === 'In Progress').map(tr => tr.id);
      
      let newExecutionStatus = ExecutionStatus.NotRun;
      if (testCaseData.status === Status.Pass) newExecutionStatus = ExecutionStatus.Passed;
      else if (testCaseData.status === Status.Fail) newExecutionStatus = ExecutionStatus.Failed;
      else if (testCaseData.status === Status.Blocked) newExecutionStatus = ExecutionStatus.Blocked;
      
      // Find entries in active runs to sync
      const entriesToUpdate = testRunEntries
        .filter(tre => tre.testCaseId === testCaseId && activeRunIds.includes(tre.testRunId))
        .map(entry => ({
            ...entry,
            status: newExecutionStatus,
            comments: testCaseData.observedBehaviour || '',
            executedAt: now,
            executedById: user.id
        }));

      await (db as any).transaction('rw', ['testCases', 'testCaseVersions', 'attachments', 'testRunEntries'], async () => {
        await db.testCaseVersions.add(previousVersion);
        await db.testCases.update(testCaseId, { ...testCaseData, updatedAt: now, version: currentTestCase.version + 1 });
        
        if (deletedAttachmentIds.length > 0) {
            await db.attachments.bulkDelete(deletedAttachmentIds);
        }
        if (newAttachmentObjects.length > 0) {
            await db.attachments.bulkAdd(newAttachmentObjects);
        }

        // Push synced entries
        if (entriesToUpdate.length > 0) {
             await db.testRunEntries.bulkPut(entriesToUpdate);
        }
      });

      setTestCaseVersions(prev => [previousVersion, ...prev]);
      setTestCases(prev => prev.map(tc => 
          tc.id === testCaseId 
          ? updatedTestCase
          : tc
      ));
      
      setAttachments(prev => {
          const filtered = prev.filter(a => !deletedAttachmentIds.includes(a.id));
          return [...filtered, ...newAttachmentObjects];
      });

      // Update TestRunEntries state
      if (entriesToUpdate.length > 0) {
          setTestRunEntries(prev => prev.map(entry => {
              const updated = entriesToUpdate.find(u => u.id === entry.id);
              return updated || entry;
          }));
      }

      logActivity(`Updated test record "${testCaseData.title}" (Synced to ${entriesToUpdate.length} active runs).`);
  }, [testCases, logActivity, testRuns, testRunEntries, user.id]);

  const handleBulkUpdateStatus = useCallback(async (testCaseIds: string[], newStatus: Status) => {
      const now = new Date().toISOString();
      
      const casesToUpdate = testCases.filter(tc => testCaseIds.includes(tc.id));
      if (casesToUpdate.length === 0) return;

      const newVersions: TestCaseVersion[] = [];
      const updatedCases: TestCase[] = [];
      const entriesToUpdate: TestRunEntry[] = [];

      const activeRunIds = testRuns.filter(tr => tr.status === 'In Progress').map(tr => tr.id);
      
      let newExecutionStatus = ExecutionStatus.NotRun;
      if (newStatus === Status.Pass) newExecutionStatus = ExecutionStatus.Passed;
      else if (newStatus === Status.Fail) newExecutionStatus = ExecutionStatus.Failed;
      else if (newStatus === Status.Blocked) newExecutionStatus = ExecutionStatus.Blocked;
      if (newStatus === Status.Pending) newExecutionStatus = ExecutionStatus.NotRun;


      for (const tc of casesToUpdate) {
          // 1. Create Version Snapshot
          newVersions.push({
              id: crypto.randomUUID(),
              testCaseId: tc.id,
              version: tc.version,
              data: {
                  title: tc.title,
                  description: tc.description,
                  priority: tc.priority,
                  status: tc.status, // Old status
                  menuUsed: tc.menuUsed,
                  testData: tc.testData,
                  observedBehaviour: tc.observedBehaviour,
                  screenshotRef: tc.screenshotRef,
                  suggestions: tc.suggestions,
              },
              changedAt: tc.updatedAt,
          });

          // 2. Prepare Updated Case
          updatedCases.push({
              ...tc,
              status: newStatus,
              updatedAt: now,
              version: tc.version + 1
          });

          // 3. Sync to Active Runs
          const relevantEntries = testRunEntries.filter(tre => tre.testCaseId === tc.id && activeRunIds.includes(tre.testRunId));
          for (const entry of relevantEntries) {
              entriesToUpdate.push({
                  ...entry,
                  status: newExecutionStatus,
                  executedAt: newExecutionStatus !== ExecutionStatus.NotRun ? now : null,
                  executedById: newExecutionStatus !== ExecutionStatus.NotRun ? user.id : undefined
              });
          }
      }

      // 4. DB Transaction
      await (db as any).transaction('rw', ['testCases', 'testCaseVersions', 'testRunEntries'], async () => {
           await db.testCaseVersions.bulkAdd(newVersions);
           await db.testCases.bulkPut(updatedCases);
           if (entriesToUpdate.length > 0) {
               await db.testRunEntries.bulkPut(entriesToUpdate);
           }
      });

      // 5. State Updates
      setTestCases(prev => prev.map(tc => {
          const updated = updatedCases.find(u => u.id === tc.id);
          return updated || tc;
      }));
      setTestCaseVersions(prev => [...newVersions, ...prev]);
      if (entriesToUpdate.length > 0) {
           setTestRunEntries(prev => prev.map(entry => {
                const updated = entriesToUpdate.find(u => u.id === entry.id);
                return updated || entry;
            }));
      }

      logActivity(`Bulk updated status to ${newStatus} for ${casesToUpdate.length} test cases.`);

  }, [testCases, testRuns, testRunEntries, user.id, logActivity]);

  const handleDeleteTestCase = useCallback(async (testCaseId: string) => {
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (testCase) {
        await (db as any).transaction('rw', ['testCases', 'testRunEntries', 'testCaseVersions', 'attachments'], async() => {
            await db.testCases.delete(testCaseId);
            await db.testRunEntries.where({ testCaseId }).delete();
            await db.testCaseVersions.where({ testCaseId }).delete();
            await db.attachments.where({ testCaseId }).delete();
        });

        logActivity(`Deleted test record "${testCase.title}".`);
        setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
        setTestRunEntries(prev => prev.filter(tre => tre.testCaseId !== testCaseId));
        setTestCaseVersions(prev => prev.filter(v => v.testCaseId !== testCaseId));
        setAttachments(prev => prev.filter(a => a.testCaseId !== testCaseId));
    }
  }, [testCases, logActivity]);

  const handleBulkDeleteTestCases = useCallback(async (testCaseIds: string[]) => {
    if (testCaseIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${testCaseIds.length} test record(s)? This cannot be undone.`)) {
        return;
    }
    
    await (db as any).transaction('rw', ['testCases', 'testRunEntries', 'testCaseVersions', 'attachments'], async () => {
        await db.testCases.bulkDelete(testCaseIds);
        await db.testRunEntries.where('testCaseId').anyOf(testCaseIds).delete();
        await db.testCaseVersions.where('testCaseId').anyOf(testCaseIds).delete();
        await db.attachments.where('testCaseId').anyOf(testCaseIds).delete();
    });

    logActivity(`Bulk deleted ${testCaseIds.length} test records.`);
    const idsToDelete = new Set(testCaseIds);
    setTestCases(prev => prev.filter(tc => !idsToDelete.has(tc.id)));
    setTestRunEntries(prev => prev.filter(tre => !idsToDelete.has(tre.testCaseId)));
    setTestCaseVersions(prev => prev.filter(v => !idsToDelete.has(v.testCaseId)));
    setAttachments(prev => prev.filter(a => !idsToDelete.has(a.testCaseId)));
  }, [logActivity]);

  const handleRollbackTestCase = useCallback(async (testCaseId: string, versionId: string) => {
    const versionToRestore = testCaseVersions.find(v => v.id === versionId);
    const currentTestCase = testCases.find(tc => tc.id === testCaseId);

    if (!versionToRestore || !currentTestCase) return;

    const now = new Date().toISOString();
    
    const snapshotBeforeRollback: TestCaseVersion = {
        id: crypto.randomUUID(),
        testCaseId: currentTestCase.id,
        version: currentTestCase.version,
        data: {
            title: currentTestCase.title,
            description: currentTestCase.description,
            priority: currentTestCase.priority,
            status: currentTestCase.status,
            menuUsed: currentTestCase.menuUsed,
            testData: currentTestCase.testData,
            observedBehaviour: currentTestCase.observedBehaviour,
            screenshotRef: currentTestCase.screenshotRef,
            suggestions: currentTestCase.suggestions,
        },
        changedAt: currentTestCase.updatedAt,
    };
    
    const newVersionNumber = currentTestCase.version + 1;
    const rolledBackTestCase = { 
        ...currentTestCase, 
        ...versionToRestore.data, 
        updatedAt: now, 
        version: newVersionNumber 
    };

    await (db as any).transaction('rw', ['testCases', 'testCaseVersions'], async () => {
        await db.testCaseVersions.add(snapshotBeforeRollback);
        await db.testCases.update(testCaseId, { 
            ...versionToRestore.data, 
            updatedAt: now, 
            version: newVersionNumber 
        });
    });
    
    setTestCaseVersions(prev => [snapshotBeforeRollback, ...prev]);
    setTestCases(prev => prev.map(tc => 
        tc.id === testCaseId ? rolledBackTestCase : tc
    ));
    
    logActivity(`Rolled back test record "${versionToRestore.data.title}" to version ${versionToRestore.version}.`);
  }, [testCases, testCaseVersions, logActivity]);

  // --- IMPORT / CLONE LOGIC ---
  const handleImportTestCases = useCallback(async (importedCases: TestCase[]) => {
      if (!selectedProjectId) return;
      const now = new Date().toISOString();
      const newCases: TestCase[] = [];
      const newVersions: TestCaseVersion[] = [];

      importedCases.forEach(tc => {
          const newId = crypto.randomUUID();
          const newCase: TestCase = {
              ...tc,
              id: newId,
              projectId: selectedProjectId,
              status: Status.Pending, // Reset status
              createdAt: now,
              updatedAt: now,
              version: 1,
              // Keep description, title, priority, menuUsed, testData
              // Reset specific execution details if desired, but retaining expected behaviour is key
              observedBehaviour: '', // Clear observed behavior
              screenshotRef: '', // Clear screenshot ref
          };
          
          const initialVersion: TestCaseVersion = {
              id: crypto.randomUUID(),
              testCaseId: newId,
              version: 1,
              data: { 
                  title: newCase.title,
                  description: newCase.description,
                  priority: newCase.priority,
                  status: newCase.status,
                  menuUsed: newCase.menuUsed,
                  testData: newCase.testData,
                  observedBehaviour: '',
                  screenshotRef: '',
                  suggestions: newCase.suggestions
               },
              changedAt: now
          };

          newCases.push(newCase);
          newVersions.push(initialVersion);
      });

      await (db as any).transaction('rw', ['testCases', 'testCaseVersions'], async () => {
          await db.testCases.bulkAdd(newCases);
          await db.testCaseVersions.bulkAdd(newVersions);
      });

      setTestCases(prev => [...newCases, ...prev]);
      setTestCaseVersions(prev => [...newVersions, ...prev]);
      logActivity(`Imported ${newCases.length} test cases from Library.`);

  }, [selectedProjectId, logActivity]);


  // Test Run Handlers
  const handleCreateTestRun = useCallback(async (runData: { name: string; testerId: string }, selectedTestCaseIds: string[]) => {
      if (!selectedProjectId) return;
      const tester = allUsers.find(u => u.id === runData.testerId);
      const newTestRun: TestRun = {
          ...runData,
          id: crypto.randomUUID(),
          projectId: selectedProjectId,
          createdAt: new Date().toISOString(),
          status: 'In Progress',
      };
      const newEntries: TestRunEntry[] = selectedTestCaseIds.map(tcId => ({
          id: crypto.randomUUID(),
          testRunId: newTestRun.id,
          testCaseId: tcId,
          status: ExecutionStatus.NotRun,
          comments: '',
          executedAt: null,
      }));

      await (db as any).transaction('rw', ['testRuns', 'testRunEntries'], async () => {
        await db.testRuns.add(newTestRun);
        await db.testRunEntries.bulkAdd(newEntries);
      });

      setTestRuns(prev => [newTestRun, ...prev]);
      setTestRunEntries(prev => [...prev, ...newEntries]);
      logActivity(`Created test run "${newTestRun.name}" and assigned to ${tester?.username || 'Unknown'}.`);
  }, [selectedProjectId, logActivity, allUsers]);

  const handleUpdateTestRunEntry = useCallback(async (entryId: string, newStatus: ExecutionStatus, comments: string) => {
      const executedAt = new Date().toISOString();
      const executedById = user.id;

      // 1. Get Entry and Test Case
      const entry = await db.testRunEntries.get(entryId);
      if (!entry) return;
      
      const testCase = await db.testCases.get(entry.testCaseId);
      if (!testCase) return;

      // 2. Map Execution Status to Test Case Status
      let mappedStatus = Status.Pending;
      if (newStatus === ExecutionStatus.Passed) mappedStatus = Status.Pass;
      else if (newStatus === ExecutionStatus.Failed) mappedStatus = Status.Fail;
      else if (newStatus === ExecutionStatus.Blocked) mappedStatus = Status.Blocked;

      // 3. Prepare Version Snapshot (Save current state of Test Case before update)
      const now = new Date().toISOString();
      const previousVersion: TestCaseVersion = {
          id: crypto.randomUUID(),
          testCaseId: testCase.id,
          version: testCase.version,
          data: {
              title: testCase.title,
              description: testCase.description,
              priority: testCase.priority,
              status: testCase.status,
              menuUsed: testCase.menuUsed,
              testData: testCase.testData,
              observedBehaviour: testCase.observedBehaviour,
              screenshotRef: testCase.screenshotRef,
              suggestions: testCase.suggestions,
          },
          changedAt: testCase.updatedAt,
      };

      const nextVersionNumber = testCase.version + 1;

      // 4. Update Objects
      const updatedEntry: TestRunEntry = {
          ...entry,
          status: newStatus,
          comments: comments,
          executedAt: executedAt,
          executedById: executedById
      };

      const updatedTestCase: TestCase = {
          ...testCase,
          status: mappedStatus,
          observedBehaviour: comments, // Exact sync: observed behavior equals comments
          updatedAt: now,
          version: nextVersionNumber
      };

      // 5. Commit Transaction
      await (db as any).transaction('rw', ['testCases', 'testCaseVersions', 'testRunEntries'], async () => {
          await db.testRunEntries.put(updatedEntry);
          await db.testCaseVersions.add(previousVersion);
          await db.testCases.put(updatedTestCase);
      });

      // 6. Update Local State
      setTestRunEntries(prev => prev.map(e => e.id === entryId ? updatedEntry : e));
      setTestCases(prev => prev.map(tc => tc.id === testCase.id ? updatedTestCase : tc));
      setTestCaseVersions(prev => [previousVersion, ...prev]);

  }, [user.id, testCases]);

  const handleAddTestCasesToRun = useCallback(async (runId: string, testCaseIds: string[]) => {
      // 1. Validate
      if (!runId || testCaseIds.length === 0) return;
      
      // 2. Create Entries
      const newEntries: TestRunEntry[] = testCaseIds.map(tcId => ({
        id: crypto.randomUUID(),
        testRunId: runId,
        testCaseId: tcId,
        status: ExecutionStatus.NotRun,
        comments: '',
        executedAt: null,
      }));

      // 3. DB Update
      await db.testRunEntries.bulkAdd(newEntries);
      
      // 4. State Update
      setTestRunEntries(prev => [...prev, ...newEntries]);
      logActivity(`Added ${newEntries.length} tests to existing run.`);

  }, [logActivity]);

  const handleRemoveTestRunEntries = useCallback(async (entryIds: string[]) => {
      if (entryIds.length === 0) return;
      
      // 1. DB Update
      await db.testRunEntries.bulkDelete(entryIds);
      
      // 2. State Update
      setTestRunEntries(prev => prev.filter(e => !entryIds.includes(e.id)));
      logActivity(`Removed ${entryIds.length} test cases from run.`);
  }, [logActivity]);

  // User Management
  const handleUserRoleUpdate = async (userId: string, newRole: UserRole) => {
      if (user.role !== UserRole.ADMIN) return;
      await db.users.update(userId, { role: newRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      logActivity(`Updated user role for ${usersList.find(u => u.id === userId)?.username} to ${newRole}`);
  };

  // Navigation and View Logic
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setPreviousView('dashboard');
    setCurrentView('project');
  };
  
  const handleShowEditForm = (project: Project) => {
    setProjectToEdit(project);
    setShowProjectForm(true);
  };
  
  const handleBackToDashboard = () => {
      setSelectedProjectId(null);
      setInitialRunToShow(null); 
      setCurrentView('dashboard');
  };
  
  const handleNavigate = (view: 'dashboard' | 'profile' | 'assigned_runs' | 'user_management' | 'analytics') => {
      setSelectedProjectId(null);
      setCurrentView(view);
  }
  
  const handleSelectAssignedRun = (projectId: string, runId: string) => {
    setSelectedProjectId(projectId);
    setInitialRunToShow(runId);
    setPreviousView('assigned_runs');
    setCurrentView('project');
  };

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  
  const assignedTestRuns = useMemo(() => testRuns.filter(tr => tr.testerId === user.id), [testRuns, user.id]);

  const summaryStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTestCases = testCases.length;
    const completedCount = testCases.filter(tc => tc.status === Status.Pass || tc.status === Status.Fail).length;
    const completionPercentage = totalTestCases > 0 ? Math.round((completedCount / totalTestCases) * 100) : 0;
    const activeTestRuns = testRuns.filter(tr => tr.status === 'In Progress').length;
    return { totalProjects, totalTestCases, completionPercentage, activeTestRuns };
  }, [projects, testCases, testRuns]);
  
  const renderContent = () => {
      switch(currentView) {
          case 'analytics':
              return <AnalyticsView summaryStats={summaryStats} activityLog={activityLog} />;
          case 'profile':
              return <ProfilePage user={user} onSave={updateUser} projectCount={projects.filter(p => p.ownerId === user.id).length} />;
          case 'assigned_runs':
              return <AssignedRunsView 
                isLoading={isLoading}
                assignedTestRuns={assignedTestRuns}
                allUsers={allUsers}
                allProjects={projects}
                testRunEntries={testRunEntries}
                onSelectAssignedRun={handleSelectAssignedRun}
              />;
          case 'user_management':
              return <UserManagement 
                users={usersList} 
                currentUser={user} 
                onUpdateRole={handleUserRoleUpdate} 
              />
          case 'project':
              return selectedProject ? (
                  <ProjectDetailView
                    isLoading={isLoading}
                    project={selectedProject}
                    isOwner={isProjectOwner(selectedProject)}
                    testCases={testCases.filter(tc => tc.projectId === selectedProjectId)}
                    testCaseVersions={testCaseVersions}
                    testRuns={testRuns.filter(tr => tr.projectId === selectedProjectId)}
                    testRunEntries={testRunEntries}
                    attachments={attachments}
                    allUsers={usersList} 
                    initialRunToShow={initialRunToShow}
                    onClearInitialRun={() => setInitialRunToShow(null)}
                    onAddTestCase={handleAddTestCase}
                    onAddMultipleTestCases={handleAddMultipleTestCases}
                    onUpdateTestCase={handleUpdateTestCase}
                    onDeleteTestCase={handleDeleteTestCase}
                    onBulkDeleteTestCases={handleBulkDeleteTestCases}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                    onCreateTestRun={handleCreateTestRun}
                    onUpdateTestRunEntry={handleUpdateTestRunEntry}
                    onAddTestCasesToRun={handleAddTestCasesToRun}
                    onRemoveTestRunEntries={handleRemoveTestRunEntries}
                    onRollbackTestCase={handleRollbackTestCase}
                    onImportTestCases={handleImportTestCases} // Pass Import Handler
                    onBack={previousView === 'assigned_runs' ? () => handleNavigate('assigned_runs') : handleBackToDashboard}
                  />
              ) : null;
          case 'dashboard':
          default:
              return (
                  <ProjectListView
                    isLoading={isLoading}
                    projects={projects}
                    testCases={testCases}
                    onSelectProject={handleSelectProject}
                    onEditProject={handleShowEditForm}
                    onDeleteProject={handleDeleteProject}
                    onShowAddProjectForm={() => { setProjectToEdit(null); setShowProjectForm(true); }}
                    summaryStats={summaryStats}
                    activityLog={activityLog}
                  />
              );
      }
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans flex">
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        onNavigate={handleNavigate} 
        currentView={currentView} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
            <div key={currentView}>
                {renderContent()}
            </div>
        </div>
        {showProjectForm && canCreateProject && (
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => { setShowProjectForm(false); setProjectToEdit(null); }}
            projectToEdit={projectToEdit}
            allUsers={usersList}
            currentUser={user}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
