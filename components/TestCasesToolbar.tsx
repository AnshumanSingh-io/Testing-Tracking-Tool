
import React from 'react';
import { Status, Priority } from '../types';

interface TestCasesToolbarProps {
    isOwner: boolean;
    statusFilter: string;
    onStatusFilterChange: (filter: string) => void;
    priorityFilter: string;
    onPriorityFilterChange: (filter: string) => void;
    sortBy: string;
    onSortByChange: (sort: string) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    onAddNewClick: () => void;
    onGenerateClick: () => void;
    onImportClick: () => void; 
    onUploadClick: () => void;
    onEnterSelectionMode: () => void;
    isSelectionMode: boolean;
    selectedCount: number;
    onCancelSelection: () => void;
    onCreateRunClick: () => void;
    onDeleteSelected: () => void;
    onBulkStatusChange: (status: Status) => void;
    viewMode: 'table' | 'focus' | 'grid';
    onViewModeChange: (mode: 'table' | 'focus' | 'grid') => void;
}

const FilterButtonGroup: React.FC<{ options: string[], current: string, onChange: (value: string) => void }> = ({ options, current, onChange }) => (
    <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800 overflow-x-auto">
        {options.map(option => (
            <button
                key={option}
                onClick={() => onChange(option)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    current === option
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
            {option}
            </button>
        ))}
    </div>
);


const TestCasesToolbar: React.FC<TestCasesToolbarProps> = ({
    isOwner,
    statusFilter, onStatusFilterChange,
    priorityFilter, onPriorityFilterChange,
    sortBy, onSortByChange,
    searchTerm, onSearchTermChange,
    onAddNewClick,
    onGenerateClick,
    onImportClick,
    onUploadClick,
    onEnterSelectionMode,
    isSelectionMode,
    selectedCount,
    onCancelSelection,
    onCreateRunClick,
    onDeleteSelected,
    onBulkStatusChange,
    viewMode,
    onViewModeChange
}) => {
    const statusOptions = ['All', ...Object.values(Status)];
    const priorityOptions = ['All', ...Object.values(Priority)];
    const sortOptions = [
        { value: 'createdAt-desc', label: 'Newest First' },
        { value: 'createdAt-asc', label: 'Oldest First' },
        { value: 'priority-desc', label: 'Priority (High-Low)' },
        { value: 'priority-asc', label: 'Priority (Low-High)' },
    ];

  return (
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-3 mb-6 space-y-3">
        
        {/* Row 1: Search, Sort, View Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-grow flex gap-3">
                <div className="relative group flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="search-test-cases"
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg py-2 pl-9 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Search..."
                    />
                </div>
                 <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition hidden sm:block"
                >
                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 justify-between lg:justify-end">
                 {/* VIEW SWITCHER */}
                 <div className="bg-gray-900 p-0.5 rounded-lg border border-gray-700 flex">
                    <button
                        onClick={() => onViewModeChange('table')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        title="Sheet View"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        title="Card View"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange('focus')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'focus' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        title="Focus View"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Row 2: Filters & Actions */}
         <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-t border-gray-800 pt-3">
            <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Status</span>
                    <FilterButtonGroup options={statusOptions} current={statusFilter} onChange={onStatusFilterChange} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Priority</span>
                    <FilterButtonGroup options={priorityOptions} current={priorityFilter} onChange={onPriorityFilterChange} />
                </div>
            </div>

            {/* Row 3: Actions */}
            {isOwner && (
                <div className="flex-shrink-0">
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-500/30 p-1.5 rounded-lg animate-fade-in">
                            <div className="bg-indigo-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{selectedCount}</div>
                            
                            <div className="h-4 w-px bg-gray-700 mx-1"></div>
                             <select
                                onChange={(e) => {
                                    if(e.target.value) onBulkStatusChange(e.target.value as Status);
                                    e.target.value = ""; // Reset value so onChange triggers again for same value if needed
                                }}
                                className="bg-gray-800 text-white text-xs rounded border border-gray-600 p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>Set Status</option>
                                {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <div className="h-4 w-px bg-gray-700 mx-1"></div>
                            <button onClick={onCancelSelection} className="text-gray-400 hover:text-white text-xs font-bold px-2">Cancel</button>
                            <div className="h-4 w-px bg-gray-700 mx-1"></div>
                            <button onClick={onDeleteSelected} disabled={selectedCount === 0} className="text-rose-400 hover:text-rose-300 text-xs font-bold px-2 disabled:opacity-50">Delete</button>
                            <button onClick={onCreateRunClick} disabled={selectedCount === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-xs disabled:opacity-50">Create Run</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                             <button
                                onClick={onAddNewClick}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                New
                            </button>
                            <button
                                onClick={onUploadClick}
                                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-lg border border-gray-700"
                                title="Bulk Upload from Excel/CSV"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Upload
                            </button>
                            <button
                                onClick={onImportClick}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-lg"
                                title="Import from Library"
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                                 Library
                            </button>
                             <button
                                onClick={onGenerateClick}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.628 2.034a1 1 0 011.744 0l1.494 2.936m-5.321-1.493a1 1 0 011.493 1.493L6 8.5l-2.936 1.494a1 1 0 01-1.493-1.493L4.5 6l-1.493-2.936a1 1 0 011.493-1.493L6 3.5l1.064-2.007zM16 8.5a1 1 0 00-1.493-1.493L13.5 6l-1.436-1.064a1 1 0 00-1.493 1.493L12 8.5l-1.494 2.936a1 1 0 001.493 1.493L13.5 12l1.064 2.007a1 1 0 001.493-1.493L14.5 10.5l2.936-1.494a1 1 0 00.564-1.506z" clipRule="evenodd" /></svg>
                                AI
                            </button>
                            {(viewMode === 'table' || viewMode === 'grid') && (
                                <button
                                    onClick={onEnterSelectionMode}
                                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 text-xs border border-gray-700"
                                >
                                    Select
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default TestCasesToolbar;
