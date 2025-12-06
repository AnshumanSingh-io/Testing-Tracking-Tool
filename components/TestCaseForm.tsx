
import React, { useState, useEffect, useRef } from 'react';
import { TestCase, Priority, Status, Attachment } from '../types';

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

interface TestCaseFormProps {
  onSave: (data: TestCaseData, newAttachments: File[], deletedAttachmentIds: string[]) => void;
  onCancel: () => void;
  testCaseToEdit?: TestCase | null;
  existingAttachments?: Attachment[];
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ onSave, onCancel, testCaseToEdit, existingAttachments = [] }) => {
  const [title, setTitle] = useState('');
  const [menuUsed, setMenuUsed] = useState('');
  const [testData, setTestData] = useState('');
  const [description, setDescription] = useState('');
  const [observedBehaviour, setObservedBehaviour] = useState('');
  const [screenshotRef, setScreenshotRef] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [status, setStatus] = useState<Status>(Status.Pending);
  const [error, setError] = useState<string>('');

  // Attachment state
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (testCaseToEdit) {
      setTitle(testCaseToEdit.title);
      setMenuUsed(testCaseToEdit.menuUsed || '');
      setTestData(testCaseToEdit.testData || '');
      setDescription(testCaseToEdit.description);
      setObservedBehaviour(testCaseToEdit.observedBehaviour || '');
      setScreenshotRef(testCaseToEdit.screenshotRef || '');
      setSuggestions(testCaseToEdit.suggestions || '');
      setPriority(testCaseToEdit.priority);
      setStatus(testCaseToEdit.status);
    } else {
      setTitle('');
      setMenuUsed('');
      setTestData('');
      setDescription('');
      setObservedBehaviour('');
      setScreenshotRef('');
      setSuggestions('');
      setPriority(Priority.Medium);
      setStatus(Status.Pending);
      setNewFiles([]);
      setIdsToDelete([]);
    }
  }, [testCaseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Test Scenario (Title) is required.');
      return;
    }
    setError('');
    onSave({ 
        title, 
        menuUsed,
        testData,
        description, 
        observedBehaviour,
        screenshotRef,
        suggestions,
        priority, 
        status 
    }, newFiles, idsToDelete);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const filesArray = Array.from(e.target.files);
          setNewFiles(prev => [...prev, ...filesArray]);
      }
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const removeNewFile = (index: number) => {
      setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (id: string) => {
      setIdsToDelete(prev => [...prev, id]);
  };
  
  const visibleExistingAttachments = existingAttachments.filter(att => !idsToDelete.includes(att.id));

  return (
    <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title" 
        role="dialog" 
        aria-modal="true"
        onClick={onCancel}
    >
        {/* Background backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>

        {/* Scrollable container */}
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div 
                className="relative transform overflow-hidden rounded-xl bg-gray-950 text-left shadow-2xl border border-gray-800 transition-all sm:my-8 w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gray-950 p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                        <h2 className="text-2xl font-semibold text-white">
                            {testCaseToEdit ? "Edit Test Record" : "New Test Record"}
                        </h2>
                        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-4">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Row 1: Scenario and Menu */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Test Scenario</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="e.g., Verify that record should display CKYC pending list..."
                        />
                        </div>
                        <div>
                        <label htmlFor="menuUsed" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Menu Used</label>
                        <input
                            type="text"
                            id="menuUsed"
                            value={menuUsed}
                            onChange={(e) => setMenuUsed(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="e.g., DAYRPT"
                        />
                        </div>
                    </div>

                    {/* Row 2: Test Data */}
                    <div>
                        <label htmlFor="testData" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Test Data</label>
                        <textarea
                        id="testData"
                        value={testData}
                        onChange={(e) => setTestData(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 h-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono text-sm"
                        placeholder="Cust_ID - U63699540 (Retail)..."
                        />
                    </div>

                    {/* Row 3: Expected vs Observed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="description" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expected Behaviour</label>
                            <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Record should display..."
                            />
                        </div>
                        <div>
                            <label htmlFor="observedBehaviour" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Observed Behaviour</label>
                            <textarea
                            id="observedBehaviour"
                            value={observedBehaviour}
                            onChange={(e) => setObservedBehaviour(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Working as expected..."
                            />
                        </div>
                    </div>

                    {/* Row 4: Meta Data */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                        <label htmlFor="status" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Status)}
                            className={`w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-bold ${status === 'PASS' ? 'text-green-400' : status === 'FAIL' ? 'text-rose-400' : 'text-gray-300'}`}
                        >
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        </div>
                        <div>
                        <label htmlFor="priority" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        >
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="screenshotRef" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Screenshot Reference</label>
                            <input
                                type="text"
                                id="screenshotRef"
                                value={screenshotRef}
                                onChange={(e) => setScreenshotRef(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="e.g., T1.1 to T1.7"
                            />
                        </div>
                    </div>
                    
                    {/* Row 5: Attachments */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attachments (Images, PDF, Excel)</label>
                        <div className="border border-dashed border-gray-700 rounded-lg p-4 bg-gray-900/50">
                            <div className="flex items-center gap-4 mb-4">
                                <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Upload Files
                                    <input 
                                        type="file" 
                                        multiple 
                                        ref={fileInputRef}
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                    />
                                </label>
                                <span className="text-sm text-gray-500">Supported: JPG, PNG, PDF, XLSX</span>
                            </div>

                            <div className="space-y-2">
                                {visibleExistingAttachments.map((att) => (
                                    <div key={att.id} className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-sm text-white truncate max-w-xs">{att.name}</span>
                                            <span className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button type="button" onClick={() => removeExistingAttachment(att.id)} className="text-gray-400 hover:text-rose-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {newFiles.map((file, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-indigo-900/30 p-2 rounded border border-indigo-500/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-sm text-white truncate max-w-xs">{file.name}</span>
                                            <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                            <span className="text-xs bg-indigo-600 px-1.5 rounded text-white">New</span>
                                        </div>
                                        <button type="button" onClick={() => removeNewFile(idx)} className="text-gray-400 hover:text-rose-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {visibleExistingAttachments.length === 0 && newFiles.length === 0 && (
                                    <div className="text-center text-gray-500 py-4 italic text-sm">No files attached</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row 6: Suggestions */}
                    <div>
                        <label htmlFor="suggestions" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Suggestions / Comments</label>
                        <textarea
                        id="suggestions"
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-3 h-20 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Any additional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
                        <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 px-6 rounded-lg transition-colors duration-300"
                        >
                        Cancel
                        </button>
                        <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-300 shadow-lg flex items-center gap-2"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Record
                        </button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default TestCaseForm;
