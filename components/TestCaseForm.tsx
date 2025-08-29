import React, { useState, useEffect } from 'react';
import { TestCase, Priority, Status } from '../types';

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

interface TestCaseFormProps {
  onSave: (data: TestCaseData) => void;
  onCancel: () => void;
  testCaseToEdit?: TestCase | null;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ onSave, onCancel, testCaseToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [status, setStatus] = useState<Status>(Status.NotStarted);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (testCaseToEdit) {
      setTitle(testCaseToEdit.title);
      setDescription(testCaseToEdit.description);
      setPriority(testCaseToEdit.priority);
      setStatus(testCaseToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      setPriority(Priority.Medium);
      setStatus(Status.NotStarted);
    }
  }, [testCaseToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    onSave({ title, description, priority, status });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6 text-white">{testCaseToEdit ? "Edit Test Case" : "Create a New Test Case"}</h2>
        {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., User Login Functionality"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Steps to reproduce, expected results..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
             <button
              type="button"
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestCaseForm;