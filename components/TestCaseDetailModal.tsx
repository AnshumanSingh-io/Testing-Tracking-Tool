
import React from 'react';
import { TestCase, Status, Priority, Attachment } from '../types';

interface TestCaseDetailModalProps {
  testCase: TestCase;
  attachments: Attachment[];
  onCancel: () => void;
}

const TestCaseDetailModal: React.FC<TestCaseDetailModalProps> = ({ testCase, attachments, onCancel }) => {
  
  const getStatusColor = (status: Status) => {
    switch (status) {
        case Status.Pass: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case Status.Fail: return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        case Status.Blocked: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: Priority) => {
      switch(priority) {
          case Priority.High: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
          case Priority.Medium: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
          case Priority.Low: return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
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

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title" 
        role="dialog" 
        aria-modal="true"
        onClick={onCancel}
    >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>

        {/* Modal Panel */}
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
            <div 
                className="relative transform overflow-hidden rounded-2xl bg-gray-950 text-left shadow-2xl border border-gray-800 transition-all w-full max-w-5xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-800 bg-gray-900/50">
                    <div className="pr-8">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-gray-500 bg-gray-900 border border-gray-800 px-2 py-1 rounded">
                                {testCase.menuUsed || 'GENERAL'}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded border font-bold uppercase tracking-wider ${getStatusColor(testCase.status)}`}>
                                {testCase.status}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded border font-bold uppercase tracking-wider ${getPriorityColor(testCase.priority)}`}>
                                {testCase.priority} Priority
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight">{testCase.title}</h2>
                    </div>
                    <button 
                        onClick={onCancel} 
                        className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Test Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Test Data Block */}
                            <div className="relative group">
                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Test Data</h3>
                                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap min-h-[80px]">
                                    {testCase.testData || <span className="text-gray-600 italic">No specific test data provided.</span>}
                                </div>
                                {testCase.testData && (
                                    <button 
                                        onClick={() => copyToClipboard(testCase.testData)}
                                        className="absolute top-8 right-2 p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy Data"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                )}
                            </div>

                            {/* Comparison View */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col h-full">
                                    <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Expected Behaviour
                                    </h3>
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap flex-1 leading-relaxed">
                                        {testCase.description}
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div> Observed Behaviour
                                    </h3>
                                    <div className={`rounded-lg p-4 text-sm whitespace-pre-wrap flex-1 leading-relaxed border ${testCase.observedBehaviour ? 'bg-gray-900/50 border-gray-800 text-gray-200' : 'bg-gray-900/20 border-gray-800 border-dashed text-gray-500 italic'}`}>
                                        {testCase.observedBehaviour || 'No observations recorded.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel: Attachments & Meta */}
                        <div className="space-y-6">
                             {/* Meta Info */}
                             <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Details</h3>
                                {testCase.screenshotRef && (
                                    <div>
                                        <span className="text-xs text-gray-500 block">Screenshot Ref</span>
                                        <span className="text-sm font-mono text-white bg-gray-800 px-2 py-0.5 rounded">{testCase.screenshotRef}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-xs text-gray-500 block">Version</span>
                                    <span className="text-sm text-white">v{testCase.version}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block">Last Updated</span>
                                    <span className="text-sm text-white">{new Date(testCase.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Attachments ({attachments.length})</h3>
                                {attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {attachments.map(att => (
                                            <button 
                                                key={att.id}
                                                onClick={() => downloadAttachment(att)}
                                                className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition group"
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
                                ) : (
                                    <div className="text-sm text-gray-600 italic border border-gray-800 border-dashed rounded-lg p-4 text-center">
                                        No files attached.
                                    </div>
                                )}
                            </div>

                           
                        </div>
                    </div>

                    {/* Suggestions */}
                    {testCase.suggestions && (
                        <div className="bg-amber-900/10 border border-amber-900/20 p-5 rounded-xl">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Suggestions / Notes</h3>
                            <p className="text-amber-200/80 text-sm leading-relaxed">{testCase.suggestions}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex justify-end">
                     <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-300"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TestCaseDetailModal;
