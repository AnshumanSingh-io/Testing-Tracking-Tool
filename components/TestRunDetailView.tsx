import React, { useState } from 'react';
import { TestRun, TestRunEntry, TestCase, ExecutionStatus, Priority } from '../types';
import PageHeader from './PageHeader';

interface TestRunDetailViewProps {
    run: TestRun;
    runEntries: TestRunEntry[];
    allTestCases: TestCase[];
    onUpdateEntry: (entryId: string, status: ExecutionStatus, comments: string) => void;
    onBack: () => void;
}

const statusConfig: Record<ExecutionStatus, { color: string, icon: string }> = {
    [ExecutionStatus.NotRun]: { color: 'bg-gray-500/20 text-gray-300', icon: '⚪️' },
    [ExecutionStatus.Passed]: { color: 'bg-indigo-500/20 text-indigo-300', icon: '✅' },
    [ExecutionStatus.Failed]: { color: 'bg-rose-500/20 text-rose-300', icon: '❌' },
    [ExecutionStatus.Blocked]: { color: 'bg-amber-500/20 text-amber-300', icon: '🚫' },
};

const priorityIcon: Record<Priority, string> = {
    [Priority.High]: '🔺',
    [Priority.Medium]: '🔸',
    [Priority.Low]: '🔹',
};

const TestRunEntryRow: React.FC<{
    entry: TestRunEntry, 
    testCase?: TestCase, 
    onUpdate: (status: ExecutionStatus, comments: string) => void 
}> = ({ entry, testCase, onUpdate }) => {
    if (!testCase) return null; // Or render a placeholder
    const [comments, setComments] = useState(entry.comments);
    const [showComments, setShowComments] = useState(false);

    const handleStatusChange = (newStatus: ExecutionStatus) => {
        onUpdate(newStatus, comments);
    };
    
    const handleSaveComment = () => {
        onUpdate(entry.status, comments);
        setShowComments(false);
    }

    return (
        <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                         <span className="text-sm" title={`Priority: ${testCase.priority}`}>{priorityIcon[testCase.priority]}</span>
                        <h4 className="font-bold text-lg text-white">{testCase.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400 ml-6">{testCase.description}</p>
                </div>
                <div className="flex flex-col items-stretch sm:items-end gap-2">
                    <div className="flex items-center justify-center gap-2">
                         {Object.values(ExecutionStatus).filter(s => s !== ExecutionStatus.NotRun).map(status => (
                            <button key={status} onClick={() => handleStatusChange(status)} title={status} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${entry.status === status ? statusConfig[status].color.replace('bg-', 'text-').replace('/20', '') : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowComments(!showComments)} className="text-xs text-indigo-400 hover:underline text-right mt-1">
                        {entry.comments ? 'Edit Comments' : 'Add Comments'}
                    </button>
                </div>
            </div>
            {showComments && (
                 <div className="mt-4 ml-6 space-y-2">
                    <textarea 
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 h-20"
                        placeholder="Add execution comments..."></textarea>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowComments(false)} className="text-sm text-gray-300">Cancel</button>
                        <button onClick={handleSaveComment} className="text-sm font-semibold text-indigo-400">Save</button>
                    </div>
                </div>
            )}
             {entry.status !== 'Not Run' && (
                <div className="text-xs text-gray-500 mt-2 ml-6 border-t border-gray-800/50 pt-2">
                    {entry.comments && <p className="italic">"{entry.comments}"</p>}
                    <p>Last status set: {new Date(entry.executedAt!).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};


const TestRunDetailView: React.FC<TestRunDetailViewProps> = ({ run, runEntries, allTestCases, onUpdateEntry, onBack }) => {
    
    const testCaseMap = new Map(allTestCases.map(tc => [tc.id, tc]));

    return (
        <div className="animate-fade-in">
             <PageHeader title={run.name} subtitle={`Tester: ${run.tester} | Created: ${new Date(run.createdAt).toLocaleDateString()}`}>
                 <button onClick={onBack} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    Back to Test Runs
                </button>
            </PageHeader>
            
            <div className="space-y-4">
                {runEntries
                    .map(entry => ({ entry, testCase: testCaseMap.get(entry.testCaseId) }))
                    .sort((a, b) => {
                        // Keep original order if possible, or sort by priority
                        const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                        if (!a.testCase || !b.testCase) return 0;
                        return priorityOrder[b.testCase.priority] - priorityOrder[a.testCase.priority];
                    })
                    .map(({entry, testCase}) => (
                    <TestRunEntryRow 
                        key={entry.id} 
                        entry={entry} 
                        testCase={testCase} 
                        onUpdate={(status, comments) => onUpdateEntry(entry.id, status, comments)} 
                    />
                ))}
            </div>

        </div>
    );
};

export default TestRunDetailView;