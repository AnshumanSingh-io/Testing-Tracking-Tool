import React from 'react';
import { Status, Priority } from '../types';

interface TestCasesToolbarProps {
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
    onSelectForRunClick: () => void;
    isSelectionMode: boolean;
}

const FilterButtonGroup: React.FC<{ options: string[], current: string, onChange: (value: string) => void }> = ({ options, current, onChange }) => (
    <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
        {options.map(option => (
            <button
                key={option}
                onClick={() => onChange(option)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    current === option
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
            >
            {option}
            </button>
        ))}
    </div>
);


const TestCasesToolbar: React.FC<TestCasesToolbarProps> = ({
    statusFilter, onStatusFilterChange,
    priorityFilter, onPriorityFilterChange,
    sortBy, onSortByChange,
    searchTerm, onSearchTermChange,
    onAddNewClick,
    onGenerateClick,
    onSelectForRunClick,
    isSelectionMode
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
    <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-grow">
                <label htmlFor="search-test-cases" className="text-sm font-medium text-gray-400 mb-2 block">Search</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        id="search-test-cases"
                        value={searchTerm}
                        onChange={(e) => onSearchTermChange(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Search by title or description..."
                    />
                </div>
            </div>
            <div className="flex-shrink-0">
                 <label htmlFor="sort-by" className="text-sm font-medium text-gray-400 mb-2 block">Sort by</label>
                <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value)}
                    className="w-full sm:w-auto bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        </div>
         <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Status</label>
                <FilterButtonGroup options={statusOptions} current={statusFilter} onChange={onStatusFilterChange} />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Priority</label>
                <FilterButtonGroup options={priorityOptions} current={priorityFilter} onChange={onPriorityFilterChange} />
            </div>
        </div>
        <div className="border-t border-gray-800 pt-4 flex flex-wrap gap-4">
             <button
                onClick={onAddNewClick}
                disabled={isSelectionMode}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Test Case
            </button>
             <button
                onClick={onGenerateClick}
                disabled={isSelectionMode}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.628 2.034a1 1 0 011.744 0l1.494 2.936m-5.321-1.493a1 1 0 011.493 1.493L6 8.5l-2.936 1.494a1 1 0 01-1.493-1.493L4.5 6l-1.493-2.936a1 1 0 011.493-1.493L6 3.5l1.064-2.007zM16 8.5a1 1 0 00-1.493-1.493L13.5 6l-1.436-1.064a1 1 0 00-1.493 1.493L12 8.5l-1.494 2.936a1 1 0 001.493 1.493L13.5 12l1.064 2.007a1 1 0 001.493-1.493L14.5 10.5l2.936-1.494a1 1 0 00.564-1.506z" clipRule="evenodd" />
                </svg>
                Generate with AI
            </button>
            <button
                onClick={onSelectForRunClick}
                disabled={isSelectionMode}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                </svg>
                Select for Test Run
            </button>
        </div>
    </div>
  );
};

export default TestCasesToolbar;