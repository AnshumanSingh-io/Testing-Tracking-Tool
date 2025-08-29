import React from 'react';
import { TestCase, TestCaseVersion } from '../types';

interface VersionHistoryModalProps {
  testCase: TestCase;
  versions: TestCaseVersion[];
  onRollback: (versionId: string) => void;
  onCancel: () => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ testCase, versions, onRollback, onCancel }) => {
    
    // Combine current version with historical versions for a complete log
    const fullHistory = [
        {
            id: 'current',
            version: testCase.version,
            changedAt: testCase.updatedAt,
            data: {
                title: testCase.title,
                description: testCase.description,
                priority: testCase.priority,
                status: testCase.status,
            }
        },
        ...versions,
    ].sort((a, b) => b.version - a.version);

    const handleRollbackClick = (versionId: string) => {
        if(window.confirm('Are you sure you want to roll back to this version? This will create a new version with the old data.')) {
            onRollback(versionId);
        }
    }
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onCancel}
        >
          <div 
            className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-3xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Change History</h2>
                 <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            <p className="text-lg text-gray-300 mb-6 border-b border-gray-800 pb-4">
                Test Case: <span className="font-bold text-white">{testCase.title}</span>
            </p>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {fullHistory.map((item, index) => (
                   <div key={item.id} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                       <div className="flex justify-between items-center">
                           <div>
                                <p className="font-bold text-gray-200 text-lg">
                                    Version {item.version}
                                    {index === 0 && <span className="text-xs font-medium text-indigo-300 bg-indigo-500/20 rounded-full px-2 py-0.5 ml-2">Current</span>}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(item.changedAt).toLocaleString()}
                                </p>
                           </div>
                           {item.id !== 'current' && (
                             <button
                                onClick={() => handleRollbackClick(item.id)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                </svg>
                                Rollback
                             </button>
                           )}
                       </div>
                       <div className="mt-4 pt-4 border-t border-gray-800/50 text-sm">
                            <p><strong className="text-gray-400">Title:</strong> {item.data.title}</p>
                            <p><strong className="text-gray-400">Status:</strong> {item.data.status}</p>
                            <p><strong className="text-gray-400">Priority:</strong> {item.data.priority}</p>
                            <p className="mt-2"><strong className="text-gray-400">Description:</strong></p>
                            <p className="text-gray-300 whitespace-pre-wrap">{item.data.description || 'N/A'}</p>
                       </div>
                   </div>
               ))}
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

export default VersionHistoryModal;