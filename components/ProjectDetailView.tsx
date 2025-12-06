
import React, { useState, useMemo, useEffect } from 'react';
import { TestCase, Project, Status, Priority, TestRun, TestRunEntry, ExecutionStatus, TestCaseVersion, User, Attachment } from '../types';
import TestCaseTable from './TestCaseTable';
import TestCaseList from './TestCaseList';
import TestCaseFocusView from './TestCaseFocusView';
import TestCaseForm from './TestCaseForm';
import TestCasesToolbar from './TestCasesToolbar';
import CreateTestRunModal from './CreateTestRunModal';
import TestRunListView from './TestRunListView';
import TestRunDetailView from './TestRunDetailView';
import TestCaseHistoryModal from './TestCaseHistoryModal';
import VersionHistoryModal from './VersionHistoryModal';
import PageHeader from './PageHeader';
import TestCaseCardSkeleton from './TestCaseCardSkeleton';
import GenerateTestCasesModal from './GenerateTestCasesModal';
import TestRepositoryModal from './TestRepositoryModal';
import TestCaseDetailModal from './TestCaseDetailModal';
import BulkUploadModal from './BulkUploadModal';

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

interface ProjectDetailViewProps {
  project: Project;
  isOwner: boolean;
  testCases: TestCase[];
  testCaseVersions: TestCaseVersion[];
  testRuns: TestRun[];
  testRunEntries: TestRunEntry[];
  attachments: Attachment[];
  allUsers: User[];
  initialRunToShow: string | null;
  onAddTestCase: (testCaseData: TestCaseData, attachments: File[]) => void;
  onAddMultipleTestCases: (testCasesData: TestCaseData[]) => void;
  onUpdateTestCase: (testCaseId: string, testCaseData: TestCaseData, newAttachments: File[], deletedAttachmentIds: string[]) => void;
  onDeleteTestCase: (id: string) => void;
  onBulkDeleteTestCases: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: Status) => void;
  onCreateTestRun: (runData: { name: string; testerId: string }, selectedTestCaseIds: string[]) => void;
  onUpdateTestRunEntry: (entryId: string, newStatus: ExecutionStatus, comments: string) => void;
  onAddTestCasesToRun: (runId: string, testCaseIds: string[]) => void;
  onRemoveTestRunEntries: (entryIds: string[]) => void;
  onRollbackTestCase: (testCaseId: string, versionId: string) => void;
  onImportTestCases: (testCases: TestCase[]) => void;
  onBack: () => void;
  onClearInitialRun: () => void;
  isLoading: boolean;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = (props) => {
  const { 
      project, isOwner, testCases, testCaseVersions, testRuns, testRunEntries, attachments, allUsers, initialRunToShow, onAddTestCase, onAddMultipleTestCases,
      onUpdateTestCase, onDeleteTestCase, onBulkDeleteTestCases, onBulkUpdateStatus, onCreateTestRun, onUpdateTestRunEntry, onAddTestCasesToRun, onRemoveTestRunEntries, onRollbackTestCase, onImportTestCases, onBack, onClearInitialRun, isLoading
  } = props;

  // Global view state
  const [activeTab, setActiveTab] = useState<'sheet' | 'runs'>('sheet');
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);
  
  // View Mode: 'table' (Excel), 'focus' (Master-Detail), or 'grid' (Cards)
  const [viewMode, setViewMode] = useState<'table' | 'focus' | 'grid'>('table');

  // Test Case states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestCaseForm, setShowTestCaseForm] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [showRepositoryModal, setShowRepositoryModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false); 
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);
  const [testCaseToView, setTestCaseToView] = useState<TestCase | null>(null);
  
  // Modal States
  const [executionHistoryCase, setExecutionHistoryCase] = useState<TestCase | null>(null);
  const [versionHistoryCase, setVersionHistoryCase] = useState<TestCase | null>(null);

  // Bulk action/selection states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [showCreateRunModal, setShowCreateRunModal] = useState(false);

  useEffect(() => {
    if (initialRunToShow) {
        setActiveTab('runs');
        setViewingRunId(initialRunToShow);
        onClearInitialRun();
    }
  }, [initialRunToShow, onClearInitialRun]);

  // -- Event Handlers --

  const handleEditTestCaseClick = (testCase: TestCase) => {
    setTestCaseToEdit(testCase);
    setShowTestCaseForm(true);
  };
  
  const handleSaveTestCase = (data: TestCaseData, newFiles: File[], deletedIds: string[]) => {
    if (testCaseToEdit) {
      onUpdateTestCase(testCaseToEdit.id, data, newFiles, deletedIds);
    } else {
      onAddTestCase(data, newFiles);
    }
    setShowTestCaseForm(false);
    setTestCaseToEdit(null);
  };

  const handleBulkAddTestCases = (cases: TestCaseData[]) => {
    onAddMultipleTestCases(cases);
    setShowGenerateModal(false);
  };
  
  const handleBulkUpload = (cases: TestCaseData[]) => {
      onAddMultipleTestCases(cases);
      setShowUploadModal(false);
  }
  
  const handleImport = (cases: TestCase[]) => {
      onImportTestCases(cases);
      setShowRepositoryModal(false);
  }

  const handleToggleSelection = (testCaseId: string) => {
    setSelectedTestCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };
  
  const handleCreateRunFromSelection = (runData: { name: string; testerId: string }) => {
    onCreateTestRun(runData, Array.from(selectedTestCases));
    setShowCreateRunModal(false);
    setSelectionMode(false);
    setSelectedTestCases(new Set());
    // Auto switch to runs tab to see it
    setActiveTab('runs');
  };
  
  const handleCancelSelectionMode = () => {
      setSelectionMode(false);
      setSelectedTestCases(new Set());
  }
  
  const handleDeleteSelected = () => {
      onBulkDeleteTestCases(Array.from(selectedTestCases));
      setSelectionMode(false);
      setSelectedTestCases(new Set());
  }
  
  const handleBulkStatusChange = (status: Status) => {
      onBulkUpdateStatus(Array.from(selectedTestCases), status);
      setSelectionMode(false);
      setSelectedTestCases(new Set());
  }

  // Quick Status Update for Focus View
  const handleQuickStatusUpdate = (id: string, status: Status) => {
      const tc = testCases.find(t => t.id === id);
      if (tc) {
          onUpdateTestCase(id, { ...tc, status }, [], []);
      }
  };
  
  const handleViewExecutionHistory = (tc: TestCase) => {
      setExecutionHistoryCase(tc);
  }

  const handleViewVersionHistory = (tc: TestCase) => {
      setVersionHistoryCase(tc);
  }

  // -- Memoized Calculations --
  
  const processedTestCases = useMemo(() => {
    let items = [...testCases];
    if (statusFilter !== 'All') items = items.filter(tc => tc.status === statusFilter);
    if (priorityFilter !== 'All') items = items.filter(tc => tc.priority === priorityFilter);
    
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        items = items.filter(tc => 
            tc.title.toLowerCase().includes(lowerSearch) || 
            tc.description.toLowerCase().includes(lowerSearch) ||
            (tc.menuUsed && tc.menuUsed.toLowerCase().includes(lowerSearch)) ||
            (tc.testData && tc.testData.toLowerCase().includes(lowerSearch))
        );
    }
    
    const [sortField, sortOrder] = sortBy.split('-');
    items.sort((a, b) => {
      if (sortField === 'createdAt') return sortOrder === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortField === 'priority') {
        const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
        return sortOrder === 'asc' ? priorityOrder[a.priority] - priorityOrder[b.priority] : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
    return items;
  }, [testCases, statusFilter, priorityFilter, sortBy, searchTerm]);


  // Full Screen Execution View
  if (viewingRunId) {
      const run = testRuns.find(r => r.id === viewingRunId);
      if (!run) return null;
      return (
          <>
            <TestRunDetailView 
                run={run}
                allTestCases={testCases} // Pass all for "Add Tests" feature
                allUsers={allUsers}
                runEntries={testRunEntries.filter(e => e.testRunId === viewingRunId)}
                onUpdateEntry={onUpdateTestRunEntry}
                onAddTests={onAddTestCasesToRun}
                onRemoveEntry={onRemoveTestRunEntries}
                onBack={() => setViewingRunId(null)} 
                onEditTestCase={handleEditTestCaseClick}
            />
            {showTestCaseForm && (
                <TestCaseForm 
                    onSave={handleSaveTestCase} 
                    onCancel={() => { setShowTestCaseForm(false); setTestCaseToEdit(null); }} 
                    testCaseToEdit={testCaseToEdit}
                    existingAttachments={testCaseToEdit ? attachments.filter(a => a.testCaseId === testCaseToEdit.id) : []}
                />
            )}
          </>
      )
  }

  return (
    <div className="animate-subtle-fade-in pb-12">
        <PageHeader title={project.name} subtitle={project.description}>
             <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Projects
            </button>
        </PageHeader>
       
        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6 flex justify-between items-end">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('sheet')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sheet' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Master Sheet
                    </div>
                </button>
                <button onClick={() => setActiveTab('runs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'runs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Executions
                    </div>
                </button>
            </nav>
        </div>
        
        {activeTab === 'sheet' && (
            <div className="animate-subtle-fade-in">
                 <TestCasesToolbar
                    isOwner={isOwner}
                    statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
                    priorityFilter={priorityFilter} onPriorityFilterChange={setPriorityFilter}
                    sortBy={sortBy} onSortByChange={setSortBy}
                    searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
                    onAddNewClick={() => { setTestCaseToEdit(null); setShowTestCaseForm(true); }}
                    onGenerateClick={() => setShowGenerateModal(true)}
                    onImportClick={() => setShowRepositoryModal(true)}
                    onUploadClick={() => setShowUploadModal(true)}
                    onEnterSelectionMode={() => setSelectionMode(true)}
                    isSelectionMode={selectionMode}
                    selectedCount={selectedTestCases.size}
                    onCancelSelection={handleCancelSelectionMode}
                    onCreateRunClick={() => setShowCreateRunModal(true)}
                    onDeleteSelected={handleDeleteSelected}
                    onBulkStatusChange={handleBulkStatusChange}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                 />
                 
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => <TestCaseCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                    {viewMode === 'table' && (
                        <TestCaseTable
                            testCases={processedTestCases}
                            attachments={attachments}
                            isOwner={isOwner}
                            onEdit={handleEditTestCaseClick}
                            onDelete={onDeleteTestCase}
                            onViewDetails={setTestCaseToView}
                            onViewVersionHistory={handleViewVersionHistory}
                            selectionMode={selectionMode}
                            selectedTestCases={selectedTestCases}
                            onToggleSelection={handleToggleSelection}
                        />
                    )}
                    {viewMode === 'grid' && (
                        <TestCaseList
                            testCases={processedTestCases}
                            isOwner={isOwner}
                            onDeleteTestCase={onDeleteTestCase}
                            onEditTestCase={handleEditTestCaseClick}
                            onViewExecutionHistory={handleViewExecutionHistory}
                            onViewVersionHistory={handleViewVersionHistory}
                            selectionMode={selectionMode}
                            selectedTestCases={selectedTestCases}
                            onToggleSelection={handleToggleSelection}
                            searchTerm={searchTerm}
                        />
                    )}
                    {viewMode === 'focus' && (
                        <TestCaseFocusView
                            testCases={processedTestCases}
                            attachments={attachments}
                            isOwner={isOwner}
                            onEdit={handleEditTestCaseClick}
                            onDelete={onDeleteTestCase}
                            onUpdateStatus={handleQuickStatusUpdate}
                        />
                    )}
                    </>
                )}
            </div>
        )}
        
        {activeTab === 'runs' && (
            <div className="animate-subtle-fade-in">
                <TestRunListView testRuns={testRuns} testRunEntries={testRunEntries} allUsers={allUsers} onSelectRun={setViewingRunId} />
            </div>
        )}

        {showTestCaseForm && (
            <TestCaseForm 
                onSave={handleSaveTestCase} 
                onCancel={() => { setShowTestCaseForm(false); setTestCaseToEdit(null); }} 
                testCaseToEdit={testCaseToEdit}
                existingAttachments={testCaseToEdit ? attachments.filter(a => a.testCaseId === testCaseToEdit.id) : []}
            />
        )}
        {showGenerateModal && <GenerateTestCasesModal onAddTestCases={handleBulkAddTestCases} onCancel={() => setShowGenerateModal(false)} />}
        {showRepositoryModal && <TestRepositoryModal currentProjectId={project.id} onImport={handleImport} onCancel={() => setShowRepositoryModal(false)} />}
        {showUploadModal && <BulkUploadModal onImport={handleBulkUpload} onCancel={() => setShowUploadModal(false)} />}
        {showCreateRunModal && <CreateTestRunModal onSave={handleCreateRunFromSelection} onCancel={() => setShowCreateRunModal(false)} allUsers={allUsers} />}
        {testCaseToView && <TestCaseDetailModal testCase={testCaseToView} attachments={attachments.filter(a => a.testCaseId === testCaseToView.id)} onCancel={() => setTestCaseToView(null)} />}
        
        {executionHistoryCase && (
            <TestCaseHistoryModal
                testCase={executionHistoryCase}
                testRuns={testRuns}
                testRunEntries={testRunEntries}
                allUsers={allUsers}
                onCancel={() => setExecutionHistoryCase(null)}
            />
        )}

        {versionHistoryCase && (
            <VersionHistoryModal 
                testCase={versionHistoryCase}
                versions={testCaseVersions.filter(v => v.testCaseId === versionHistoryCase.id)}
                onRollback={(vId) => onRollbackTestCase(versionHistoryCase.id, vId)}
                onCancel={() => setVersionHistoryCase(null)}
                isOwner={isOwner}
            />
        )}
    </div>
  );
};

export default ProjectDetailView;
