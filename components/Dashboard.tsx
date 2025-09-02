import React, { useState, useCallback, useMemo } from 'react';
import { Project, TestCase, User, Status, TestRun, TestRunEntry, ExecutionStatus, TestCaseVersion, Priority } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useTestCases } from '../hooks/useTestCases';
import { useTestRuns } from '../hooks/useTestRuns';
import { useActivityLog } from '../hooks/useActivityLog';
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'project' | 'profile'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Database hooks
  const { projects, loading: projectsLoading, addProject, updateProject, deleteProject } = useProjects(user.id);
  const { testCases, testCaseVersions, loading: testCasesLoading, addTestCase, addMultipleTestCases, updateTestCase, deleteTestCase, rollbackTestCase } = useTestCases(selectedProjectId);
  const { testRuns, testRunEntries, loading: testRunsLoading, createTestRun, updateTestRunEntry } = useTestRuns(selectedProjectId);
  const { activities, logActivity } = useActivityLog(user.id);

  const isLoading = projectsLoading || testCasesLoading || testRunsLoading;

  // Project Handlers
  const handleSaveProject = useCallback(async (projectData: { name: string, description: string }) => {
    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, projectData);
        await logActivity(`Updated project "${projectData.name}".`);
      } else {
        await addProject(projectData);
        await logActivity(`Created project "${projectData.name}".`);
      }
      setShowProjectForm(false);
      setProjectToEdit(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }, [projectToEdit, addProject, updateProject, logActivity]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && window.confirm('Delete this project and all its test cases & runs? This cannot be undone.')) {
      try {
        await deleteProject(projectId);
        await logActivity(`Deleted project "${project.name}".`);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }, [projects, deleteProject, logActivity]);

  // Test Case Handlers
  const handleAddTestCase = useCallback(async (testCaseData: TestCaseData) => {
    try {
      await addTestCase(testCaseData);
      await logActivity(`Added test case "${testCaseData.title}".`);
    } catch (error) {
      console.error('Error adding test case:', error);
    }
  }, [addTestCase, logActivity]);
  
  const handleAddMultipleTestCases = useCallback(async (testCasesData: TestCaseData[]) => {
    try {
      await addMultipleTestCases(testCasesData);
      await logActivity(`Generated and added ${testCasesData.length} new test cases with AI.`);
    } catch (error) {
      console.error('Error adding multiple test cases:', error);
    }
  }, [addMultipleTestCases, logActivity]);

  const handleUpdateTestCase = useCallback(async (testCaseId: string, testCaseData: TestCaseData) => {
    try {
      await updateTestCase(testCaseId, testCaseData);
      await logActivity(`Updated test case "${testCaseData.title}".`);
    } catch (error) {
      console.error('Error updating test case:', error);
    }
  }, [updateTestCase, logActivity]);

  const handleDeleteTestCase = useCallback(async (testCaseId: string) => {
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (testCase) {
      try {
        await deleteTestCase(testCaseId);
        await logActivity(`Deleted test case "${testCase.title}".`);
      } catch (error) {
        console.error('Error deleting test case:', error);
      }
    }
  }, [testCases, deleteTestCase, logActivity]);

  const handleRollbackTestCase = useCallback(async (testCaseId: string, versionId: string) => {
    const versionToRestore = testCaseVersions.find(v => v.id === versionId);
    if (versionToRestore) {
      try {
        await rollbackTestCase(testCaseId, versionId);
        await logActivity(`Rolled back test case "${versionToRestore.data.title}" to version ${versionToRestore.version}.`);
      } catch (error) {
        console.error('Error rolling back test case:', error);
      }
    }
  }, [testCaseVersions, rollbackTestCase, logActivity]);

  // Test Run Handlers
  const handleCreateTestRun = useCallback(async (runData: { name: string; tester: string }, selectedTestCaseIds: string[]) => {
    try {
      await createTestRun(runData, selectedTestCaseIds);
      await logActivity(`Created test run "${runData.name}".`);
    } catch (error) {
      console.error('Error creating test run:', error);
    }
  }, [createTestRun, logActivity]);

  const handleUpdateTestRunEntry = useCallback(async (entryId: string, newStatus: ExecutionStatus, comments: string) => {
    try {
      await updateTestRunEntry(entryId, newStatus, comments);
    } catch (error) {
      console.error('Error updating test run entry:', error);
    }
  }, [updateTestRunEntry]);

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
  };

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
            testCases={testCases}
            testCaseVersions={testCaseVersions}
            testRuns={testRuns}
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
            activityLog={activities}
          />
        );
    }
  };

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