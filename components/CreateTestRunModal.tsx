import React, { useState } from 'react';
import { User } from '../types';

interface CreateTestRunModalProps {
  onSave: (data: { name: string; testerId: string }) => void;
  onCancel: () => void;
  allUsers: User[];
}

const CreateTestRunModal: React.FC<CreateTestRunModalProps> = ({ onSave, onCancel, allUsers }) => {
  const [name, setName] = useState('');
  const [testerId, setTesterId] = useState<string>(allUsers[0]?.id || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Test run name is required.');
      return;
    }
     if (!testerId) {
      setError('A tester must be assigned.');
      return;
    }
    setError('');
    onSave({ name, testerId });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6 text-white text-center">Create New Test Run</h2>
        {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-4 text-center text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="run-name" className="block text-sm font-medium text-gray-300 mb-1">Test Run Name</label>
            <input
              type="text"
              id="run-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., v1.2 Smoke Test"
              required
            />
          </div>
           <div>
            <label htmlFor="tester-id" className="block text-sm font-medium text-gray-300 mb-1">Assigned Tester</label>
            <select
              id="tester-id"
              value={testerId}
              onChange={(e) => setTesterId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            >
              <option value="" disabled>Select a user</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
             <button
              type="button"
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Create Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTestRunModal;