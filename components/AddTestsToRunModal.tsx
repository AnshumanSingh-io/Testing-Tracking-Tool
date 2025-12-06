
import React, { useState, useMemo } from 'react';
import { TestCase, Priority } from '../types';

interface AddTestsToRunModalProps {
  availableTestCases: TestCase[];
  onAdd: (testCaseIds: string[]) => void;
  onCancel: () => void;
}

const AddTestsToRunModal: React.FC<AddTestsToRunModalProps> = ({ availableTestCases, onAdd, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredCases = useMemo(() => {
    return availableTestCases.filter(tc => 
      tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tc.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableTestCases, searchTerm]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
      if (selectedIds.size === filteredCases.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(filteredCases.map(tc => tc.id)));
      }
  }

  const handleAdd = () => {
    onAdd(Array.from(selectedIds));
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">Add Tests to Run</h2>
                <p className="text-gray-400 text-sm mt-1">Select existing test cases from this project to add to the current run.</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </span>
            <input 
                type="text" 
                placeholder="Search available test cases..." 
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 transition"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="flex-grow overflow-y-auto border border-gray-800 rounded-lg bg-gray-900/30">
            {filteredCases.length > 0 ? (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-xs uppercase text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 w-10 text-center">
                                <input 
                                    type="checkbox" 
                                    checked={filteredCases.length > 0 && selectedIds.size === filteredCases.length}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </th>
                            <th className="p-4">Test Case</th>
                            <th className="p-4 w-24">Priority</th>
                            <th className="p-4 w-32">Menu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                        {filteredCases.map(tc => (
                            <tr 
                                key={tc.id} 
                                className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${selectedIds.has(tc.id) ? 'bg-indigo-900/20' : ''}`}
                                onClick={() => handleToggleSelect(tc.id)}
                            >
                                <td className="p-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(tc.id)}
                                        onChange={() => {}} 
                                        className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-white mb-0.5">{tc.title}</div>
                                </td>
                                <td className="p-4">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                                        tc.priority === Priority.High ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                                        tc.priority === Priority.Medium ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                                        'border-sky-500/30 text-sky-400 bg-sky-500/10'
                                    }`}>
                                        {tc.priority}
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono text-gray-400">
                                    {tc.menuUsed || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                    {availableTestCases.length === 0 
                        ? "All test cases from this project are already in this run."
                        : "No test cases found matching your search."
                    }
                </div>
            )}
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-800">
            <span className="text-sm text-gray-400">{selectedIds.size} selected</span>
            <div className="flex gap-4">
                 <button
                    onClick={onCancel}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAdd}
                    disabled={selectedIds.size === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Selected
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddTestsToRunModal;
