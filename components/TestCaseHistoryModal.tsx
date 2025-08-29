import React from 'react';
import { TestCase, TestRun, TestRunEntry, ExecutionStatus } from '../types';

interface TestCaseHistoryModalProps {
  testCase: TestCase;
  testRuns: TestRun[];
  testRunEntries: TestRunEntry[];
  onCancel: () => void;
}

const statusConfig: Record<ExecutionStatus, { color: string, text: string }> = {
    [ExecutionStatus.NotRun]: { color: 'text-gray-400', text: 'Not Run' },
    [ExecutionStatus.Passed]: { color: 'text-indigo-400', text: 'Passed' },
    [ExecutionStatus.Failed]: { color: 'text-rose-400', text: 'Failed' },
    [ExecutionStatus.Blocked]: { color: 'text-amber-400', text: 'Blocked' },
};


const TestCaseHistoryModal: React.FC<TestCaseHistoryModalProps> = ({ testCase, testRuns, testRunEntries, onCancel }) => {
    
    const history = testRunEntries
        .filter(entry => entry.testCaseId === testCase.id)
        .map(entry => {
            const run = testRuns.find(r => r.id === entry.testRunId);
            return {
                ...entry,
                runName: run?.name || 'Unknown Run',
                tester: run?.tester || 'N/A'
            }
        })
        .sort((a,b) => new Date(b.executedAt || 0).getTime() - new Date(a.executedAt || 0).getTime());
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in"
            onClick={onCancel}
        >
          <div 
            className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Execution History</h2>
                 <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            <p className="text-lg text-gray-300 mb-6 border-b border-gray-800 pb-4">
                Test Case: <span className="font-bold text-white">{testCase.title}</span>
            </p>

            <div className="flex-grow overflow-y-auto pr-2">
                {history.length > 0 ? (
                    <ul className="space-y-4">
                       {history.map(item => (
                           <li key={item.id} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                               <div className="flex justify-between items-center">
                                   <div>
                                        <p className="font-bold text-gray-200">{item.runName}</p>
                                        <p className="text-sm text-gray-400">Tester: {item.tester}</p>
                                   </div>
                                   <div className="text-right">
                                        <p className={`font-semibold ${statusConfig[item.status].color}`}>{statusConfig[item.status].text}</p>
                                        <p className="text-xs text-gray-500">{item.executedAt ? new Date(item.executedAt).toLocaleString() : 'Not executed'}</p>
                                   </div>
                               </div>
                               {item.comments && (
                                   <p className="text-sm text-gray-300 mt-2 pt-2 border-t border-gray-800/50 italic">"{item.comments}"</p>
                               )}
                           </li>
                       ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 py-8">This test case has not been included in any test runs yet.</p>
                )}
            </div>
            
            <div className="flex justify-end pt-6 mt-4 border-t border-gray-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      );
};

export default TestCaseHistoryModal;