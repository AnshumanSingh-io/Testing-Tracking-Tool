
import React, { useState } from 'react';
import { TestCase, Status, Priority, Attachment } from '../types';

interface TestCaseTableProps {
  testCases: TestCase[];
  attachments: Attachment[];
  isOwner: boolean;
  onEdit: (testCase: TestCase) => void;
  onDelete: (id: string) => void;
  onViewDetails: (testCase: TestCase) => void;
  onViewVersionHistory: (testCase: TestCase) => void;
  selectionMode: boolean;
  selectedTestCases: Set<string>;
  onToggleSelection: (id: string) => void;
}

const TestCaseTable: React.FC<TestCaseTableProps> = ({
  testCases,
  attachments,
  isOwner,
  onEdit,
  onDelete,
  onViewDetails,
  onViewVersionHistory,
  selectionMode,
  selectedTestCases,
  onToggleSelection,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
      setExpandedRowId(expandedRowId === id ? null : id);
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
        case Status.Pass: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case Status.Fail: return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        case Status.Blocked: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        default: return 'bg-gray-700/50 text-gray-400 border-gray-600/30';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
      switch(priority) {
          case Priority.High: return <span className="text-rose-400" title="High">🔥</span>;
          case Priority.Medium: return <span className="text-amber-400" title="Medium">🔸</span>;
          case Priority.Low: return <span className="text-sky-400" title="Low">🔹</span>;
      }
  }

  const downloadAttachment = (att: Attachment) => {
      const url = URL.createObjectURL(att.content);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 shadow-xl bg-gray-900/50">
      <table className="w-full text-left border-collapse table-auto">
        <thead className="bg-gray-950 text-xs uppercase text-gray-400">
          <tr>
            {selectionMode && <th className="p-4 w-10 border-b border-gray-800 text-center"></th>}
            <th className="p-4 border-b border-gray-800 w-16 text-center">Status</th>
            <th className="p-4 border-b border-gray-800 font-semibold tracking-wider">Test Scenario</th>
            <th className="p-4 border-b border-gray-800 font-semibold tracking-wider w-32 hidden md:table-cell">Menu</th>
            <th className="p-4 border-b border-gray-800 font-semibold tracking-wider w-24 hidden sm:table-cell text-center">Ref</th>
            <th className="p-4 border-b border-gray-800 font-semibold tracking-wider w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50 text-sm text-gray-300">
          {testCases.map((tc) => {
              const caseAttachments = attachments.filter(a => a.testCaseId === tc.id);
              const isExpanded = expandedRowId === tc.id;
              
              return (
                <React.Fragment key={tc.id}>
                    {/* MAIN ROW */}
                    <tr 
                        className={`hover:bg-gray-800/40 transition-colors cursor-pointer group ${selectedTestCases.has(tc.id) ? 'bg-indigo-900/10' : ''} ${isExpanded ? 'bg-gray-800/30' : ''}`}
                        onClick={() => toggleRow(tc.id)}
                    >
                        {selectionMode && (
                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedTestCases.has(tc.id)}
                                    onChange={() => onToggleSelection(tc.id)}
                                    className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </td>
                        )}
                        <td className="p-4 align-middle text-center">
                             <div className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(tc.status)}`}>
                                    {tc.status}
                                </span>
                                {getPriorityIcon(tc.priority)}
                             </div>
                        </td>
                        <td className="p-4 align-middle">
                            <div className="font-medium text-white mb-0.5 flex items-center gap-2">
                                {tc.title}
                            </div>
                             <div className="flex items-center gap-2 md:hidden">
                                <span className="text-xs bg-gray-800 text-gray-400 px-1.5 rounded">{tc.menuUsed || 'General'}</span>
                             </div>
                        </td>
                        <td className="p-4 align-middle hidden md:table-cell">
                            <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{tc.menuUsed || 'General'}</span>
                        </td>
                        <td className="p-4 align-middle text-center hidden sm:table-cell text-gray-500 font-mono text-xs">
                             {tc.screenshotRef ? tc.screenshotRef : '-'}
                             {caseAttachments.length > 0 && (
                                <div className="flex justify-center mt-1">
                                    <span className="flex items-center text-[10px] bg-gray-800 px-1.5 rounded text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" /></svg>
                                        {caseAttachments.length}
                                    </span>
                                </div>
                             )}
                        </td>
                        <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewVersionHistory(tc); }}
                                    className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition"
                                    title="View History"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onViewDetails(tc); }}
                                    className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition"
                                    title="Pop Out Details"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                                <button
                                    onClick={(e) => toggleRow(tc.id)}
                                    className={`p-1.5 rounded transition ${isExpanded ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isOwner && (
                                    <>
                                    <button
                                        onClick={() => onEdit(tc)}
                                        className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(tc.id)}
                                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                    
                    {/* EXPANDED DETAIL ROW */}
                    {isExpanded && (
                        <tr className="bg-gray-900/30">
                            <td colSpan={selectionMode ? 6 : 5} className="p-0 border-b border-gray-800">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-subtle-fade-in border-l-4 border-indigo-500">
                                    
                                    {/* Column 1: Test Data & Menu */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Menu Path</h4>
                                            <p className="text-sm text-gray-300 font-medium">{tc.menuUsed || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Test Data</h4>
                                            <div className="bg-black/30 p-3 rounded border border-gray-800 font-mono text-xs text-indigo-200 whitespace-pre-wrap">
                                                {tc.testData || 'No specific test data provided.'}
                                            </div>
                                        </div>
                                        {tc.screenshotRef && (
                                            <div>
                                                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Ref / Screenshot ID</h4>
                                                 <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{tc.screenshotRef}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 2: Expected & Observed */}
                                    <div className="space-y-4 lg:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                            <div className="bg-gray-800/30 p-3 rounded border border-gray-800/50">
                                                <h4 className="text-xs font-bold text-emerald-500 uppercase mb-2">Expected Behaviour</h4>
                                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{tc.description}</p>
                                            </div>
                                            <div className={`p-3 rounded border ${tc.observedBehaviour ? 'bg-gray-800/30 border-gray-800/50' : 'bg-gray-800/10 border-gray-800/30 border-dashed'}`}>
                                                <h4 className="text-xs font-bold text-amber-500 uppercase mb-2">Observed Behaviour</h4>
                                                <p className={`text-sm whitespace-pre-wrap ${tc.observedBehaviour ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                                                    {tc.observedBehaviour || 'Not recorded yet.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Full Width: Attachments & Suggestions */}
                                    {(caseAttachments.length > 0 || tc.suggestions) && (
                                        <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                                            {caseAttachments.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Attachments ({caseAttachments.length})</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {caseAttachments.map(att => (
                                                             <button 
                                                                key={att.id}
                                                                onClick={() => downloadAttachment(att)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-300 transition"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                </svg>
                                                                <span className="truncate max-w-[150px]">{att.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {tc.suggestions && (
                                                <div className="bg-amber-900/10 border border-amber-900/20 p-3 rounded">
                                                     <h4 className="text-xs font-bold text-amber-600 uppercase mb-1">Suggestions / Comments</h4>
                                                     <p className="text-sm text-amber-200/80">{tc.suggestions}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              );
          })}
          {testCases.length === 0 && (
             <tr>
                <td colSpan={selectionMode ? 6 : 5} className="p-12 text-center text-gray-500 italic">No test cases found.</td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestCaseTable;
