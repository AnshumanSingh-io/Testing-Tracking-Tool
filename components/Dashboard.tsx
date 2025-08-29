import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, TestCase, User, Status, Activity, TestRun, TestRunEntry, ExecutionStatus, TestCaseVersion, Priority } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Sidebar from './Sidebar';
import ProjectListView from './ProjectListView';
import ProjectDetailView from './ProjectDetailView';
import ProjectForm from './ProjectForm';
import ProfilePage from './ProfilePage';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  updateUser: (user: User) => void;
}

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, updateUser }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>(`projects_${user.id}`, []);
  const [testCases, setTestCases] = useLocalStorage<TestCase[]>(`testCases_${user.id}`, []);
  const [testCaseVersions, setTestCaseVersions] = useLocalStorage<TestCaseVersion[]>(`testCaseVersions_${user.id}`, []);
  const [testRuns, setTestRuns] = useLocalStorage<TestRun[]>(`testRuns_${user.id}`, []);
  const [testRunEntries, setTestRunEntries] = useLocalStorage<TestRunEntry[]>(`testRunEntries_${user.id}`, []);
  const [activityLog, setActivityLog] = useLocalStorage<Activity[]>(`activityLog_${user.id}`, []);

  const [currentView, setCurrentView] = useState<'dashboard' | 'project' | 'profile'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 750); // Simulate data fetch
    return () => clearTimeout(timer);
  }, []);

  const logActivity = useCallback((message: string) => {
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toISOString(),
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 19)]);
  }, [setActivityLog]);

  // Project Handlers
  const handleSaveProject = useCallback((projectData: { name: string, description: string }) => {
    if (projectToEdit) {
      setProjects(prev => prev.map(p => p.id === projectToEdit.id ? { ...p, ...projectData } : p));
      logActivity(`Updated project "${projectData.name}".`);
    } else {
      const newProject: Project = { ...projectData, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      setProjects(prev => [newProject, ...prev]);
      logActivity(`Created project "${projectData.name}".`);
    }
    setShowProjectForm(false);
    setProjectToEdit(null);
  }, [projectToEdit, setProjects, logActivity]);

  const handleDeleteProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && window.confirm('Delete this project and all its test cases & runs? This cannot be undone.')) {
        logActivity(`Deleted project "${project.name}".`);
        const associatedTestCaseIds = testCases.filter(tc => tc.projectId === projectId).map(tc => tc.id);
        const associatedTestRunIds = testRuns.filter(tr => tr.projectId === projectId).map(tr => tr.id);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTestCases(prev => prev.filter(tc => tc.projectId !== projectId));
        setTestCaseVersions(prev => prev.filter(v => !associatedTestCaseIds.includes(v.testCaseId)));
        setTestRuns(prev => prev.filter(tr => tr.projectId !== projectId));
        setTestRunEntries(prev => prev.filter(tre => !associatedTestRunIds.includes(tre.testRunId)));
    }
  }, [projects, testCases, testRuns, setProjects, setTestCases, setTestRuns, setTestRunEntries, setTestCaseVersions, logActivity]);

  // Test Case Handlers
  const handleAddTestCase = useCallback((testCaseData: TestCaseData) => {
    if (!selectedProjectId) return;
    const now = new Date().toISOString();
    const newTestCase: TestCase = { ...testCaseData, id: crypto.randomUUID(), projectId: selectedProjectId, createdAt: now, updatedAt: now, version: 1 };
    setTestCases(prev => [newTestCase, ...prev]);
    
    const initialVersion: TestCaseVersion = {
        id: crypto.randomUUID(),
        testCaseId: newTestCase.id,
        version: 1,
        data: { ...testCaseData },
        changedAt: now
    };
    setTestCaseVersions(prev => [initialVersion, ...prev]);
    
    logActivity(`Added test case "${testCaseData.title}".`);
  }, [selectedProjectId, setTestCases, setTestCaseVersions, logActivity]);
  
  const handleAddMultipleTestCases = useCallback((testCasesData: TestCaseData[]) => {
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

    setTestCases(prev => [...newTestCases, ...prev]);
    setTestCaseVersions(prev => [...newVersions, ...prev]);
    logActivity(`Generated and added ${newTestCases.length} new test cases with AI.`);
  }, [selectedProjectId, setTestCases, setTestCaseVersions, logActivity]);


  const handleUpdateTestCase = useCallback((testCaseId: string, testCaseData: TestCaseData) => {
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
              status: currentTestCase.status
          },
          changedAt: currentTestCase.updatedAt,
      };
      setTestCaseVersions(prev => [previousVersion, ...prev]);

      setTestCases(prev => prev.map(tc => 
          tc.id === testCaseId 
          ? { ...tc, ...testCaseData, updatedAt: now, version: tc.version + 1 } 
          : tc
      ));
      logActivity(`Updated test case "${testCaseData.title}".`);
  }, [testCases, setTestCases, setTestCaseVersions, logActivity]);

  const handleDeleteTestCase = useCallback((testCaseId: string) => {
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (testCase) {
        logActivity(`Deleted test case "${testCase.title}".`);
        setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
        setTestRunEntries(prev => prev.filter(tre => tre.testCaseId !== testCaseId));
        setTestCaseVersions(prev => prev.filter(v => v.testCaseId !== testCaseId));
    }
  }, [testCases, setTestCases, setTestRunEntries, setTestCaseVersions, logActivity]);

  const handleRollbackTestCase = useCallback((testCaseId: string, versionId: string) => {
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
            status: currentTestCase.status
        },
        changedAt: currentTestCase.updatedAt,
    };
    setTestCaseVersions(prev => [snapshotBeforeRollback, ...prev]);
    
    const newVersionNumber = currentTestCase.version + 1;
    setTestCases(prev => prev.map(tc => 
        tc.id === testCaseId 
        ? { 
            ...tc, 
            ...versionToRestore.data, 
            updatedAt: now, 
            version: newVersionNumber 
          } 
        : tc
    ));
    
    logActivity(`Rolled back test case "${versionToRestore.data.title}" to version ${versionToRestore.version}.`);
  }, [testCases, testCaseVersions, setTestCases, setTestCaseVersions, logActivity]);

  // Test Run Handlers
  const handleCreateTestRun = useCallback((runData: { name: string; tester: string }, selectedTestCaseIds: string[]) => {
      if (!selectedProjectId) return;
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
      setTestRuns(prev => [newTestRun, ...prev]);
      setTestRunEntries(prev => [...prev, ...newEntries]);
      logActivity(`Created test run "${newTestRun.name}".`);
  }, [selectedProjectId, setTestRuns, setTestRunEntries, logActivity]);

  const handleUpdateTestRunEntry = useCallback((entryId: string, newStatus: ExecutionStatus, comments: string) => {
      setTestRunEntries(prev => prev.map(entry => 
          entry.id === entryId 
          ? { ...entry, status: newStatus, comments, executedAt: new Date().toISOString() } 
          : entry
      ));
      // Optional: log this activity
  }, [setTestRunEntries]);

  // Navigation and View Logic
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
  };
  
  const handleShowEditForm = (project: Project) => {
    setProjectToEdit(project);
    setShowProjectForm(true);
  };
  
  const handleBackToDashboard = () => {
      setSelectedProjectId(null);
      setCurrentView('dashboard');
  };
  
  const handleNavigate = (view: 'dashboard' | 'profile') => {
      setSelectedProjectId(null);
      setCurrentView(view);
  }

  const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  const summaryStats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTestCases = testCases.length;
    const completedCount = testCases.filter(tc => tc.status === Status.Completed).length;
    const completionPercentage = totalTestCases > 0 ? Math.round((completedCount / totalTestCases) * 100) : 0;
    const activeTestRuns = testRuns.filter(tr => tr.status === 'In Progress').length;
    return { totalProjects, totalTestCases, completionPercentage, activeTestRuns };
  }, [projects, testCases, testRuns]);
  
  const renderContent = () => {
      switch(currentView) {
          case 'profile':
              return <ProfilePage user={user} onSave={updateUser} projectCount={projects.length} />;
          case 'project':
              return selectedProject ? (
                  <ProjectDetailView
                    isLoading={isLoading}
                    project={selectedProject}
                    testCases={testCases.filter(tc => tc.projectId === selectedProjectId)}
                    testCaseVersions={testCaseVersions}
                    testRuns={testRuns.filter(tr => tr.projectId === selectedProjectId)}
                    testRunEntries={testRunEntries}
                    onAddTestCase={handleAddTestCase}
                    onAddMultipleTestCases={handleAddMultipleTestCases}
                    onUpdateTestCase={handleUpdateTestCase}
                    onDeleteTestCase={handleDeleteTestCase}
                    onCreateTestRun={handleCreateTestRun}
                    onUpdateTestRunEntry={handleUpdateTestRunEntry}
                    onRollbackTestCase={handleRollbackTestCase}
                    onBack={handleBackToDashboard}
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
      <Sidebar user={user} onLogout={onLogout} onNavigate={handleNavigate} currentView={currentView} />
      <main className="flex-1 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </div>
        {showProjectForm && (
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => { setShowProjectForm(false); setProjectToEdit(null); }}
            projectToEdit={projectToEdit}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;