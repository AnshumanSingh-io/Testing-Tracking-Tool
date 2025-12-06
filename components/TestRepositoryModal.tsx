
import React, { useState, useMemo, useEffect } from 'react';
import { TestCase, Project, Status, Priority } from '../types';
import { db } from '../db';

interface TestRepositoryModalProps {
  currentProjectId: string;
  onImport: (testCases: TestCase[]) => void;
  onCancel: () => void;
}

// Helper type for display
type RepositoryItem = TestCase & { sourceProjectName: string };

const TestRepositoryModal: React.FC<TestRepositoryModalProps> = ({ currentProjectId, onImport, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenu, setFilterMenu] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [repositoryItems, setRepositoryItems] = useState<RepositoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all test cases and join with project names
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allCases, allProjects] = await Promise.all([
          db.testCases.toArray(),
          db.projects.toArray()
        ]);
        
        const projectMap = new Map(allProjects.map(p => [p.id, p.name]));
        
        const items = allCases
            .map(tc => ({
                ...tc,
                sourceProjectName: projectMap.get(tc.projectId) || 'Unknown Project'
            }));
            
        setRepositoryItems(items);
      } catch (error) {
        console.error("Failed to load repository", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentProjectId]);

  const filteredItems = useMemo(() => {
    return repositoryItems.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceProjectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMenu = filterMenu ? item.menuUsed?.toLowerCase().includes(filterMenu.toLowerCase()) : true;

      return matchesSearch && matchesMenu;
    });
  }, [repositoryItems, searchTerm, filterMenu]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRowClick = (id: string) => {
      handleToggleSelect(id);
  };

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Stop the row click from firing
      handleToggleSelect(id);
  };

  const handleImportClick = () => {
    const selectedCases = repositoryItems.filter(item => selectedIds.has(item.id));
    onImport(selectedCases);
  };

  const uniqueMenus = useMemo(() => {
      return Array.from(new Set(repositoryItems.map(i => i.menuUsed).filter(Boolean)));
  }, [repositoryItems]);

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-5xl h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
            <div>
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <span className="text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                    </span>
                    Central Test Library
                </h2>
                <p className="text-gray-400 text-sm mt-1">Search and import test cases from any project (including this one).</p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </span>
                <input 
                    type="text" 
                    placeholder="Search by scenario, project name, or description..." 
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 transition"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 min-w-[150px]"
                value={filterMenu}
                onChange={e => setFilterMenu(e.target.value)}
            >
                <option value="">All Menus</option>
                {uniqueMenus.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>

        {/* Table */}
        <div className="flex-grow overflow-auto border border-gray-800 rounded-lg bg-gray-900/30">
            {isLoading ? (
                <div className="flex justify-center items-center h-full text-gray-400">Loading library...</div>
            ) : filteredItems.length > 0 ? (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-xs uppercase text-gray-400 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 w-10 text-center">
                                <span className="sr-only">Select</span>
                            </th>
                            <th className="p-4">Test Scenario</th>
                            <th className="p-4">Source Project</th>
                            <th className="p-4">Menu</th>
                            <th className="p-4">Priority</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                        {filteredItems.map(item => (
                            <tr 
                                key={item.id} 
                                className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${selectedIds.has(item.id) ? 'bg-indigo-900/20' : ''}`}
                                onClick={() => handleRowClick(item.id)}
                            >
                                <td className="p-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => {}} // Dummy onChange to suppress React warning, logic handled by onClick
                                        onClick={(e) => handleCheckboxClick(e, item.id)}
                                        className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="font-semibold text-white mb-1">{item.title}</div>
                                    <div className="text-gray-500 text-xs line-clamp-1">{item.description}</div>
                                </td>
                                <td className="p-4 text-gray-400">{item.sourceProjectName}</td>
                                <td className="p-4 font-mono text-xs">{item.menuUsed || '-'}</td>
                                <td className="p-4">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        item.priority === Priority.High ? 'bg-rose-500/20 text-rose-300' :
                                        item.priority === Priority.Medium ? 'bg-amber-500/20 text-amber-300' :
                                        'bg-sky-500/20 text-sky-300'
                                    }`}>
                                        {item.priority}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p>No test cases found matching your criteria.</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-800">
            <span className="text-sm text-gray-400">
                {selectedIds.size} case{selectedIds.size !== 1 && 's'} selected
            </span>
            <div className="flex gap-4">
                 <button
                    onClick={onCancel}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleImportClick}
                    disabled={selectedIds.size === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    Import Selected
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TestRepositoryModal;
