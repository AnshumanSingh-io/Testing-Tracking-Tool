
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TestRun, TestRunEntry, TestCase, ExecutionStatus, Priority, User } from '../types';
import AddTestsToRunModal from './AddTestsToRunModal';

interface TestRunDetailViewProps {
    run: TestRun;
    runEntries: TestRunEntry[];
    allTestCases: TestCase[];
    allUsers: User[];
    onUpdateEntry: (entryId: string, status: ExecutionStatus, comments: string) => void;
    onAddTests: (runId: string, testCaseIds: string[]) => void;
    onRemoveEntry: (entryIds: string[]) => void;
    onBack: () => void;
    onEditTestCase: (testCase: TestCase) => void;
}

const ExecutionStatusConfig: Record<ExecutionStatus, { color: string, icon: React.ReactNode, label: string, buttonClass: string }> = {
    [ExecutionStatus.NotRun]: { 
        color: 'text-gray-400', 
        icon: <div className="w-3 h-3 rounded-full border-2 border-gray-500"></div>,
        label: 'Not Run',
        buttonClass: 'bg-gray-800 hover:bg-gray-700 text-gray-300'
    },
    [ExecutionStatus.Passed]: { 
        color: 'text-emerald-400', 
        icon: <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
        label: 'Passed',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'
    },
    [ExecutionStatus.Failed]: { 
        color: 'text-rose-400', 
        icon: <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>,
        label: 'Failed',
        buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20'
    },
    [ExecutionStatus.Blocked]: { 
        color: 'text-amber-400', 
        icon: <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/></svg>,
        label: 'Blocked',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20'
    },
};

const TestRunDetailView: React.FC<TestRunDetailViewProps> = ({ 
    run, 
    runEntries, 
    allTestCases, 
    allUsers, 
    onUpdateEntry, 
    onAddTests,
    onRemoveEntry,
    onBack,
    onEditTestCase 
}) => {
    // State
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [executionComment, setExecutionComment] = useState('');
    const [isManageMode, setIsManageMode] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const commentRef = useRef<HTMLTextAreaElement>(null);

    // Derived Data
    const testCaseMap = useMemo(() => new Map(allTestCases.map(tc => [tc.id, tc])), [allTestCases]);
    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u.username])), [allUsers]);

    const combinedList = useMemo(() => {
        return runEntries.map(entry => ({
            entry,
            testCase: testCaseMap.get(entry.testCaseId)
        })).filter(item => item.testCase !== undefined);
    }, [runEntries, testCaseMap]);

    const filteredList = useMemo(() => {
        return combinedList.filter(({ entry, testCase }) => {
            const matchesStatus = filterStatus === 'All' 
                ? true 
                : filterStatus === 'To Do' 
                    ? entry.status === ExecutionStatus.NotRun 
                    : entry.status === filterStatus;
            
            const matchesSearch = searchTerm === '' 
                ? true 
                : testCase!.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  testCase!.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesStatus && matchesSearch;
        }).sort((a, b) => {
            const pMap = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
            if (pMap[a.testCase!.priority] !== pMap[b.testCase!.priority]) {
                return pMap[b.testCase!.priority] - pMap[a.testCase!.priority];
            }
            return 0; 
        });
    }, [combinedList, filterStatus, searchTerm]);

    // Select first item on load if not selected
    useEffect(() => {
        if (!selectedEntryId && filteredList.length > 0) {
            setSelectedEntryId(filteredList[0].entry.id);
        }
    }, [filteredList, selectedEntryId]);

    // Update comment local state when selection changes
    useEffect(() => {
        if (selectedEntryId) {
            const entry = runEntries.find(e => e.id === selectedEntryId);
            setExecutionComment(entry?.comments || '');
        }
    }, [selectedEntryId, runEntries]);


    const currentItem = useMemo(() => 
        filteredList.find(item => item.entry.id === selectedEntryId), 
    [filteredList, selectedEntryId]);


    // Handlers
    const handleStatusUpdate = (status: ExecutionStatus) => {
        if (!selectedEntryId) return;
        
        onUpdateEntry(selectedEntryId, status, executionComment);

        if (autoAdvance) {
            // Logic to find next 'Not Run' or simply next item
            const currentIndex = filteredList.findIndex(item => item.entry.id === selectedEntryId);
            if (currentIndex < filteredList.length - 1) {
                // Try to find next NotRun
                let nextIndex = -1;
                for(let i = currentIndex + 1; i < filteredList.length; i++) {
                    if (filteredList[i].entry.status === ExecutionStatus.NotRun) {
                        nextIndex = i;
                        break;
                    }
                }
                // If no NotRun found, just go next
                if (nextIndex === -1) nextIndex = currentIndex + 1;
                
                setSelectedEntryId(filteredList[nextIndex].entry.id);
            }
        }
    };

    const handleRemove = (entryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm('Remove this test case from the current run? Data in this run will be lost.')) {
            onRemoveEntry([entryId]);
            if(selectedEntryId === entryId) setSelectedEntryId(null);
        }
    };

    const handleAddTests = (ids: string[]) => {
        onAddTests(run.id, ids);
        setShowAddModal(false);
        setIsManageMode(false); // Switch back to execute mode
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Only handle if not in textarea/input
        if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const idx = filteredList.findIndex(i => i.entry.id === selectedEntryId);
            if (idx < filteredList.length - 1) setSelectedEntryId(filteredList[idx + 1].entry.id);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = filteredList.findIndex(i => i.entry.id === selectedEntryId);
            if (idx > 0) setSelectedEntryId(filteredList[idx - 1].entry.id);
        }
    };
    
    const handleExport = () => {
        const headers = ['Test Case ID', 'Title', 'Priority', 'Menu', 'Status', 'Expected Behaviour', 'Actual Result (Comments)', 'Executed At', 'Executed By'];
        const rows = combinedList.map(({ entry, testCase }) => [
            testCase!.id,
            `"${testCase!.title.replace(/"/g, '""')}"`, // Escape quotes
            testCase!.priority,
            `"${(testCase!.menuUsed || '').replace(/"/g, '""')}"`,
            entry.status,
            `"${testCase!.description.replace(/"/g, '""')}"`,
            `"${(entry.comments || '').replace(/"/g, '""')}"`,
            entry.executedAt ? new Date(entry.executedAt).toLocaleString() : '',
            userMap.get(entry.executedById || '') || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${run.name.replace(/\s+/g, '_')}_Report.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    // Data for modal: Available tests are those in 'allTestCases' NOT currently in 'runEntries'
    const availableTestCases = useMemo(() => {
        const currentIds = new Set(runEntries.map(e => e.testCaseId));
        return allTestCases.filter(tc => !currentIds.has(tc.id));
    }, [allTestCases, runEntries]);


    // Stats
    const stats = useMemo(() => {
        const total = runEntries.length;
        const passed = runEntries.filter(e => e.status === ExecutionStatus.Passed).length;
        const failed = runEntries.filter(e => e.status === ExecutionStatus.Failed).length;
        const blocked = runEntries.filter(e => e.status === ExecutionStatus.Blocked).length;
        const executed = passed + failed + blocked;
        return { total, executed, passed, failed, blocked };
    }, [runEntries]);

    const progressPercent = stats.total > 0 ? Math.round((stats.executed / stats.total) * 100) : 0;

    return (
        <div 
            className="flex flex-col h-[calc(100vh-140px)] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 animate-fade-in outline-none" 
            tabIndex={0} 
            onKeyDown={handleKeyDown}
        >
            {/* Top Bar: Navigation & Stats */}
            <div className="bg-gray-950 border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        title="Back to Runs"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white truncate max-w-xs">{run.name}</h2>
                             <span className="px-2 py-0.5 rounded bg-gray-800 text-xs text-gray-400 font-mono hidden sm:inline-block">
                                Tester: {userMap.get(run.testerId) || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1">
                            <span className="text-emerald-400">{stats.passed} Pass</span>
                            <span className="text-rose-400">{stats.failed} Fail</span>
                            <span className="text-amber-400">{stats.blocked} Block</span>
                            <span className="text-gray-500">{stats.total - stats.executed} To Do</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="w-48 hidden lg:block">
                        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            <span>Progress</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(stats.passed / stats.total) * 100}%` }}></div>
                            <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${(stats.failed / stats.total) * 100}%` }}></div>
                            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(stats.blocked / stats.total) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow flex items-center gap-2"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                             Export
                        </button>
                        <button
                            onClick={() => setIsManageMode(!isManageMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isManageMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             {isManageMode ? 'Done' : 'Manage Run'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Sidebar: Test List */}
                <div className="w-80 md:w-96 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0 transition-all">
                    
                    {/* Add Button (Visible in Manage Mode) */}
                    {isManageMode && (
                        <div className="p-3 pb-0 animate-fade-in">
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                Add Tests
                            </button>
                        </div>
                    )}

                    <div className="p-3 border-b border-gray-800 space-y-3 mt-1">
                        <input 
                            type="text" 
                            placeholder="Search tests..." 
                            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['All', 'To Do', 'Passed', 'Failed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${filterStatus === f ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredList.map(({ entry, testCase }) => (
                            <div 
                                key={entry.id}
                                onClick={() => setSelectedEntryId(entry.id)}
                                className={`p-4 border-b border-gray-800/50 cursor-pointer transition-all hover:bg-gray-900 group relative ${selectedEntryId === entry.id ? 'bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1 pr-6">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        testCase!.priority === Priority.High ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                                        testCase!.priority === Priority.Medium ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                                        'border-sky-500/30 text-sky-400 bg-sky-500/10'
                                    }`}>
                                        {testCase!.priority}
                                    </span>
                                    <div className="flex items-center gap-1.5" title={entry.status}>
                                        {ExecutionStatusConfig[entry.status].icon}
                                    </div>
                                </div>
                                <h4 className={`text-sm font-medium line-clamp-2 ${selectedEntryId === entry.id ? 'text-white' : 'text-gray-400'}`}>
                                    {testCase!.title}
                                </h4>
                                <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
                                    <span>{testCase!.menuUsed || 'General'}</span>
                                    {entry.executedAt && <span>{new Date(entry.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>}
                                </div>
                                
                                {isManageMode && (
                                    <button 
                                        onClick={(e) => handleRemove(entry.id, e)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-rose-600 text-gray-400 hover:text-white rounded-full shadow-lg transition-colors z-10"
                                        title="Remove from Run"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        {filteredList.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No test cases match filters.</div>
                        )}
                    </div>
                </div>

                {/* Right Pane: Execution Area */}
                <div className="flex-1 flex flex-col bg-gray-900 min-w-0">
                    {currentItem ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-gray-500 bg-black/30 border border-gray-700 px-2 py-1 rounded">
                                                {currentItem.testCase!.menuUsed || 'GENERAL'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded border font-bold uppercase ${ExecutionStatusConfig[currentItem.entry.status].color.replace('text-', 'text-').replace('text-', 'border-')}`}>
                                                {currentItem.entry.status}
                                            </span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-white leading-tight">{currentItem.testCase!.title}</h1>
                                        {currentItem.testCase!.screenshotRef && (
                                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 bg-gray-800/50 w-fit px-2 py-0.5 rounded">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                                                 <span className="uppercase font-bold">Ref:</span> {currentItem.testCase!.screenshotRef}
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => onEditTestCase(currentItem.testCase!)}
                                        className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                        Edit Case Details
                                    </button>
                                </div>

                                {/* Scenarios */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Expected */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                                Expected Behaviour
                                            </h3>
                                            <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed shadow-inner min-h-[120px]">
                                                {currentItem.testCase!.description}
                                            </div>
                                        </div>
                                        {currentItem.testCase!.testData && (
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Test Data</h3>
                                                <div className="bg-black/30 border border-gray-800 rounded p-3 font-mono text-xs text-indigo-200 whitespace-pre-wrap">
                                                    {currentItem.testCase!.testData}
                                                </div>
                                            </div>
                                        )}
                                        {currentItem.testCase!.suggestions && (
                                            <div>
                                                <h3 className="text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-2">Suggestions / Notes</h3>
                                                <div className="bg-amber-900/10 border border-amber-900/20 rounded p-3 text-xs text-amber-200/80 whitespace-pre-wrap italic">
                                                    {currentItem.testCase!.suggestions}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actual / Comments Input */}
                                    <div className="space-y-2 flex flex-col">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            Actual Result / Notes
                                        </h3>
                                        <textarea
                                            ref={commentRef}
                                            value={executionComment}
                                            onChange={(e) => setExecutionComment(e.target.value)}
                                            placeholder="Describe the observed behaviour..."
                                            className="w-full flex-1 min-h-[150px] bg-gray-950 border border-gray-700 rounded-lg p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                                        />
                                        <div className="flex justify-end">
                                             <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={autoAdvance} 
                                                    onChange={(e) => setAutoAdvance(e.target.checked)}
                                                    className="rounded bg-gray-800 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                Auto-advance on status change
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Bar */}
                            <div className="bg-gray-950 border-t border-gray-800 p-4 md:p-6 shrink-0">
                                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                                    <div className="text-sm text-gray-500 hidden md:block">
                                        <span className="font-bold text-gray-300">Tip:</span> Use arrow keys to navigate list
                                    </div>
                                    <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
                                        <button 
                                            onClick={() => handleStatusUpdate(ExecutionStatus.Passed)}
                                            className={`py-3 px-6 rounded-lg font-bold text-sm transition-transform active:scale-95 ${ExecutionStatusConfig[ExecutionStatus.Passed].buttonClass} ${currentItem.entry.status === ExecutionStatus.Passed ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-emerald-500' : 'opacity-90 hover:opacity-100'}`}
                                        >
                                            Pass
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(ExecutionStatus.Failed)}
                                            className={`py-3 px-6 rounded-lg font-bold text-sm transition-transform active:scale-95 ${ExecutionStatusConfig[ExecutionStatus.Failed].buttonClass} ${currentItem.entry.status === ExecutionStatus.Failed ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-rose-500' : 'opacity-90 hover:opacity-100'}`}
                                        >
                                            Fail
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(ExecutionStatus.Blocked)}
                                            className={`py-3 px-6 rounded-lg font-bold text-sm transition-transform active:scale-95 ${ExecutionStatusConfig[ExecutionStatus.Blocked].buttonClass} ${currentItem.entry.status === ExecutionStatus.Blocked ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-amber-500' : 'opacity-90 hover:opacity-100'}`}
                                        >
                                            Block
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(ExecutionStatus.NotRun)}
                                            className="py-3 px-4 rounded-lg font-bold text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                             <p>Select a test case to start execution.</p>
                         </div>
                    )}
                </div>
            </div>
            
            {showAddModal && (
                <AddTestsToRunModal 
                    availableTestCases={availableTestCases}
                    onAdd={handleAddTests}
                    onCancel={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
};

export default TestRunDetailView;
