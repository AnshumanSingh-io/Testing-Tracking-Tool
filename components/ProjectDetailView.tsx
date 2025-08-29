import React, { useState, useMemo } from 'react';
import { TestCase, Project, Status, Priority, TestRun, TestRunEntry, ExecutionStatus, TestCaseVersion } from '../types';
import TestCaseList from './TestCaseList';
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

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

interface ProjectDetailViewProps {
  project: Project;
  testCases: TestCase[];
  testCaseVersions: TestCaseVersion[];
  testRuns: TestRun[];
  testRunEntries: TestRunEntry[];
  onAddTestCase: (testCaseData: TestCaseData) => void;
  onAddMultipleTestCases: (testCasesData: TestCaseData[]) => void;
  onUpdateTestCase: (testCaseId: string, testCaseData: TestCaseData) => void;
  onDeleteTestCase: (id: string) => void;
  onCreateTestRun: (runData: { name: string; tester: string }, selectedTestCaseIds: string[]) => void;
  onUpdateTestRunEntry: (entryId: string, newStatus: ExecutionStatus, comments: string) => void;
  onRollbackTestCase: (testCaseId: string, versionId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = (props) => {
  const { 
      project, testCases, testCaseVersions, testRuns, testRunEntries, onAddTestCase, onAddMultipleTestCases,
      onUpdateTestCase, onDeleteTestCase, onCreateTestRun, onUpdateTestRunEntry, onRollbackTestCase, onBack, isLoading
  } = props;

  // Global view state
  const [activeTab, setActiveTab] = useState<'cases' | 'runs'>('cases');
  const [viewingRunId, setViewingRunId] = useState<string | null>(null);

  // Test Case states
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTestCaseForm, setShowTestCaseForm] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [testCaseToEdit, setTestCaseToEdit] = useState<TestCase | null>(null);
  const [testCaseForExecutionHistory, setTestCaseForExecutionHistory] = useState<TestCase | null>(null);
  const [testCaseForVersionHistory, setTestCaseForVersionHistory] = useState<TestCase | null>(null);

  // Test Run selection states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedForRun, setSelectedForRun] = useState<Set<string>>(new Set());
  const [showCreateRunModal, setShowCreateRunModal] = useState(false);

  // -- Event Handlers --

  const handleEditTestCaseClick = (testCase: TestCase) => {
    setTestCaseToEdit(testCase);
    setShowTestCaseForm(true);
  };
  
  const handleViewExecutionHistoryClick = (testCase: TestCase) => {
    setTestCaseForExecutionHistory(testCase);
  }

  const handleViewVersionHistoryClick = (testCase: TestCase) => {
    setTestCaseForVersionHistory(testCase);
  }

  const handleSaveTestCase = (data: TestCaseData) => {
    if (testCaseToEdit) {
      onUpdateTestCase(testCaseToEdit.id, data);
    } else {
      onAddTestCase(data);
    }
    setShowTestCaseForm(false);
    setTestCaseToEdit(null);
  };

  const handleBulkAddTestCases = (cases: TestCaseData[]) => {
    onAddMultipleTestCases(cases);
    setShowGenerateModal(false);
  };

  const toggleSelection = (testCaseId: string) => {
    setSelectedForRun(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };
  
  const handleCreateRun = (runData: { name: string; tester: string }) => {
    onCreateTestRun(runData, Array.from(selectedForRun));
    setShowCreateRunModal(false);
    setSelectionMode(false);
    setSelectedForRun(new Set());
  };
  
  const cancelSelectionMode = () => {
      setSelectionMode(false);
      setSelectedForRun(new Set());
  }

  // -- Memoized Calculations --
  
  const processedTestCases = useMemo(() => {
    let items = [...testCases];
    if (statusFilter !== 'All') items = items.filter(tc => tc.status === statusFilter);
    if (priorityFilter !== 'All') items = items.filter(tc => tc.priority === priorityFilter);
    
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
  }, [testCases, statusFilter, priorityFilter, sortBy]);

  if (viewingRunId) {
      const run = testRuns.find(r => r.id === viewingRunId);
      if (!run) return null; // Should not happen
      return (
          <TestRunDetailView 
              run={run}
              allTestCases={testCases}
              runEntries={testRunEntries.filter(e => e.testRunId === viewingRunId)}
              onUpdateEntry={onUpdateTestRunEntry}
              onBack={() => setViewingRunId(null)}
          />
      )
  }

  return (
    <div className="animate-subtle-fade-in">
        <PageHeader title={project.name} subtitle={project.description}>
             <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Projects
            </button>
        </PageHeader>
       
        {/* Tabs */}
        <div className="border-b border-gray-800 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('cases')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cases' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Test Cases</button>
                <button onClick={() => setActiveTab('runs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'runs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Test Runs</button>
            </nav>
        </div>
        
        {activeTab === 'cases' && (
            <div className="animate-subtle-fade-in">
                 <TestCasesToolbar
                    statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
                    priorityFilter={priorityFilter} onPriorityFilterChange={setPriorityFilter}
                    sortBy={sortBy} onSortByChange={setSortBy}
                    searchTerm={searchTerm} onSearchTermChange={setSearchTerm}
                    onAddNewClick={() => { setTestCaseToEdit(null); setShowTestCaseForm(true); }}
                    onGenerateClick={() => setShowGenerateModal(true)}
                    onSelectForRunClick={() => setSelectionMode(true)}
                    isSelectionMode={selectionMode}
                 />
                 
                {selectionMode && (
                    <div className="bg-gray-950 border border-indigo-500/50 rounded-lg p-4 mb-6 flex justify-between items-center animate-fade-in">
                        <span className="text-white font-semibold">{selectedForRun.size} test case(s) selected</span>
                        <div>
                             <button onClick={cancelSelectionMode} className="text-gray-300 hover:text-white mr-4">Cancel</button>
                             <button onClick={() => setShowCreateRunModal(true)} disabled={selectedForRun.size === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed">
                                Create Test Run
                             </button>
                        </div>
                    </div>
                )}
                
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <TestCaseCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        <TestCaseList 
                            testCases={processedTestCases} 
                            searchTerm={searchTerm}
                            onDeleteTestCase={onDeleteTestCase}
                            onEditTestCase={handleEditTestCaseClick}
                            onViewExecutionHistory={handleViewExecutionHistoryClick}
                            onViewVersionHistory={handleViewVersionHistoryClick}
                            selectionMode={selectionMode}
                            selectedTestCases={selectedForRun}
                            onToggleSelection={toggleSelection}
                        />
                        
                        {testCases.length === 0 && (
                            <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800 mt-6"><h3 className="text-2xl font-semibold text-gray-300">No Test Cases Yet</h3><p className="text-gray-400 mt-2">Click "New Test Case" to get started!</p></div>
                        )}
                        {testCases.length > 0 && processedTestCases.length === 0 && searchTerm === '' && (
                             <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800 mt-6"><h3 className="text-2xl font-semibold text-gray-300">No Matching Test Cases</h3><p className="text-gray-400 mt-2">Try adjusting the filters.</p></div>
                        )}
                    </>
                )}
            </div>
        )}
        
        {activeTab === 'runs' && (
            <div className="animate-subtle-fade-in">
                <TestRunListView testRuns={testRuns} testRunEntries={testRunEntries} onSelectRun={setViewingRunId} />
            </div>
        )}

        {showTestCaseForm && <TestCaseForm onSave={handleSaveTestCase} onCancel={() => { setShowTestCaseForm(false); setTestCaseToEdit(null); }} testCaseToEdit={testCaseToEdit} />}
        {showGenerateModal && <GenerateTestCasesModal onAddTestCases={handleBulkAddTestCases} onCancel={() => setShowGenerateModal(false)} />}
        {showCreateRunModal && <CreateTestRunModal onSave={handleCreateRun} onCancel={() => setShowCreateRunModal(false)} />}
        {testCaseForExecutionHistory && <TestCaseHistoryModal testCase={testCaseForExecutionHistory} testRuns={testRuns} testRunEntries={testRunEntries} onCancel={() => setTestCaseForExecutionHistory(null)} />}
        {testCaseForVersionHistory && (
            <VersionHistoryModal
                testCase={testCaseForVersionHistory}
                versions={testCaseVersions.filter(v => v.testCaseId === testCaseForVersionHistory.id)}
                onRollback={(versionId) => {
                    onRollbackTestCase(testCaseForVersionHistory.id, versionId);
                    setTestCaseForVersionHistory(null);
                }}
                onCancel={() => setTestCaseForVersionHistory(null)}
            />
        )}
    </div>
  );
};

export default ProjectDetailView;