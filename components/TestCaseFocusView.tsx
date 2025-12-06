
import React, { useState, useMemo, useEffect } from 'react';
import { TestCase, Status, Priority, Attachment } from '../types';

interface TestCaseFocusViewProps {
    testCases: TestCase[];
    attachments: Attachment[];
    isOwner: boolean;
    onEdit: (testCase: TestCase) => void;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, status: Status) => void;
}

const TestCaseFocusView: React.FC<TestCaseFocusViewProps> = ({
    testCases,
    attachments,
    isOwner,
    onEdit,
    onDelete,
    onUpdateStatus
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group test cases by Menu Used
    const groupedCases = useMemo<Record<string, TestCase[]>>(() => {
        const groups: Record<string, TestCase[]> = {};
        testCases.forEach(tc => {
            const menu = tc.menuUsed ? tc.menuUsed.trim() : 'General';
            if (!groups[menu]) groups[menu] = [];
            groups[menu].push(tc);
        });
        return groups;
    }, [testCases]);

    // Initialize first group as expanded and select first item
    useEffect(() => {
        if (testCases.length > 0 && !selectedId) {
            const menus = Object.keys(groupedCases);
            if (menus.length > 0) {
                setExpandedGroups(new Set([menus[0]]));
                setSelectedId(groupedCases[menus[0]][0].id);
            }
        }
    }, [testCases, groupedCases, selectedId]);

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group);
            else next.add(group);
            return next;
        });
    };

    const selectedCase = useMemo(() => 
        testCases.find(tc => tc.id === selectedId), 
    [testCases, selectedId]);

    const selectedAttachments = useMemo(() => 
        attachments.filter(a => a.testCaseId === selectedId),
    [attachments, selectedId]);

    const getStatusColor = (status: Status) => {
        switch (status) {
            case Status.Pass: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case Status.Fail: return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            case Status.Blocked: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            default: return 'bg-gray-700/50 text-gray-400 border-gray-600/30';
        }
    };

    const handleCopyData = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };
    
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

    if (testCases.length === 0) {
        return (
             <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800">
                <h3 className="text-2xl font-semibold text-gray-300">No Test Records</h3>
                <p className="text-gray-400 mt-2">Add a new test case to get started.</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-220px)] bg-gray-950 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            {/* LEFT SIDEBAR: LIST */}
            <div className="w-1/3 border-r border-gray-800 flex flex-col bg-gray-900/30">
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Test Explorer</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {Object.entries(groupedCases).map(([group, cases]) => {
                        const typedCases = cases as TestCase[];
                        return (
                        <div key={group} className="rounded-lg overflow-hidden">
                            <button 
                                onClick={() => toggleGroup(group)}
                                className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
                            >
                                <span className="font-semibold text-white text-sm">{group}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{typedCases.length}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform ${expandedGroups.has(group) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>
                            
                            {expandedGroups.has(group) && (
                                <div className="space-y-0.5 mt-1">
                                    {typedCases.map(tc => (
                                        <button
                                            key={tc.id}
                                            onClick={() => setSelectedId(tc.id)}
                                            className={`w-full text-left p-3 pl-4 border-l-2 transition-all duration-200 ${
                                                selectedId === tc.id 
                                                ? 'bg-indigo-600/10 border-indigo-500' 
                                                : 'border-transparent hover:bg-gray-800/30 hover:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-medium line-clamp-2 ${selectedId === tc.id ? 'text-white' : 'text-gray-400'}`}>
                                                    {tc.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <span className={`w-2 h-2 rounded-full ${
                                                    tc.status === Status.Pass ? 'bg-emerald-500' :
                                                    tc.status === Status.Fail ? 'bg-rose-500' :
                                                    tc.status === Status.Blocked ? 'bg-amber-500' :
                                                    'bg-gray-600'
                                                }`}></span>
                                                <span className="text-xs text-gray-500">{tc.status}</span>
                                                {tc.priority === Priority.High && <span className="text-xs text-rose-400">🔥 High</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                    })}
                </div>
            </div>

            {/* RIGHT PANE: DETAIL */}
            <div className="w-2/3 flex flex-col bg-gray-950">
                {selectedCase ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-gray-800 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
                                        {selectedCase.menuUsed || 'GENERAL'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(selectedCase.status)}`}>
                                        {selectedCase.status}
                                    </span>
                                    <span className="text-xs text-gray-500">v{selectedCase.version}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white leading-tight">{selectedCase.title}</h2>
                            </div>
                            
                            {isOwner && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onEdit(selectedCase)}
                                        className="p-2 text-gray-400 hover:text-indigo-400 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => onDelete(selectedCase.id)}
                                        className="p-2 text-gray-400 hover:text-rose-400 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions (Status) */}
                        <div className="px-6 py-4 bg-gray-900/20 border-b border-gray-800 flex gap-4">
                            <span className="text-sm font-medium text-gray-500 self-center">Mark as:</span>
                            <button onClick={() => onUpdateStatus(selectedCase.id, Status.Pass)} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${selectedCase.status === Status.Pass ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-gray-800 text-gray-400 hover:bg-emerald-600/20 hover:text-emerald-400'}`}>PASS</button>
                            <button onClick={() => onUpdateStatus(selectedCase.id, Status.Fail)} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${selectedCase.status === Status.Fail ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'bg-gray-800 text-gray-400 hover:bg-rose-600/20 hover:text-rose-400'}`}>FAIL</button>
                            <button onClick={() => onUpdateStatus(selectedCase.id, Status.Blocked)} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${selectedCase.status === Status.Blocked ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-gray-800 text-gray-400 hover:bg-amber-600/20 hover:text-amber-400'}`}>BLOCKED</button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Test Data Card */}
                            {selectedCase.testData && (
                                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 relative group">
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Test Data</h4>
                                    <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{selectedCase.testData}</div>
                                    <button 
                                        onClick={() => handleCopyData(selectedCase.testData)}
                                        className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* Comparison View */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                        Expected Behaviour
                                    </h4>
                                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-900/30 p-4 rounded-lg border border-gray-800 h-full">
                                        {selectedCase.description || <span className="text-gray-600 italic">No description provided.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${selectedCase.status === Status.Fail ? 'bg-rose-500' : 'bg-gray-500'}`}></span>
                                        Observed Behaviour
                                    </h4>
                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-lg border h-full ${selectedCase.observedBehaviour ? 'bg-gray-900/30 border-gray-800 text-gray-300' : 'bg-gray-900/10 border-dashed border-gray-800 text-gray-600 italic'}`}>
                                        {selectedCase.observedBehaviour || 'No observations recorded yet.'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Attachments */}
                             {selectedAttachments.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Attachments</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {selectedAttachments.map(att => (
                                            <button 
                                                key={att.id}
                                                onClick={() => downloadAttachment(att)}
                                                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition group"
                                            >
                                                <div className="bg-gray-900 p-2 rounded text-indigo-400 group-hover:text-white transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-200 truncate">{att.name}</p>
                                                    <p className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions */}
                            {selectedCase.suggestions && (
                                <div className="bg-amber-900/10 border border-amber-900/30 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold text-amber-500 uppercase mb-2">Suggestions</h4>
                                    <p className="text-amber-200/80 text-sm">{selectedCase.suggestions}</p>
                                </div>
                            )}
                            
                            {/* Meta */}
                             <div className="text-xs text-gray-600 pt-6 border-t border-gray-900 flex justify-between">
                                <span>Created: {new Date(selectedCase.createdAt).toLocaleDateString()}</span>
                                <span>Updated: {new Date(selectedCase.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p>Select a test case to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestCaseFocusView;
