import React from 'react';
import { TestCase, Priority, Status } from '../types';

interface TestCaseCardProps {
  testCase: TestCase;
  onDelete: (id: string) => void;
  onEdit: (testCase: TestCase) => void;
  onViewExecutionHistory: (testCase: TestCase) => void;
  onViewVersionHistory: (testCase: TestCase) => void;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

const priorityColorMap: Record<Priority, string> = {
  [Priority.High]: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  [Priority.Medium]: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  [Priority.Low]: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
};

const statusColorMap: Record<Status, string> = {
  [Status.NotStarted]: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  [Status.InProgress]: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  [Status.Completed]: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  [Status.Failed]: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
};

const priorityDetails: Record<Priority, { icon: string; text: string }> = {
    [Priority.High]: { icon: '🔺', text: 'High Priority' },
    [Priority.Medium]: { icon: '🔸', text: 'Medium Priority' },
    [Priority.Low]: { icon: '🔹', text: 'Low Priority' },
};

const statusDetails: Record<Status, { icon: string; text: string }> = {
    [Status.NotStarted]: { icon: '⚪️', text: 'Not Started' },
    [Status.InProgress]: { icon: '▶️', text: 'In Progress' },
    [Status.Completed]: { icon: '✅', text: 'Completed' },
    [Status.Failed]: { icon: '❌', text: 'Failed' },
};


const TestCaseCard: React.FC<TestCaseCardProps> = ({ 
    testCase, 
    onDelete, 
    onEdit, 
    onViewExecutionHistory,
    onViewVersionHistory, 
    selectionMode, 
    isSelected, 
    onToggleSelection 
}) => {
  const { id, title, description, priority, status, updatedAt, version } = testCase;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (window.confirm('Are you sure you want to delete this test case?')) {
        onDelete(id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    onEdit(testCase);
  };
  
  const handleViewExecutionHistory = (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewExecutionHistory(testCase);
  };

  const handleViewVersionHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewVersionHistory(testCase);
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelection(id);
    } else {
      // Default click action can be to view execution history or something else
    }
  };

  return (
    <div 
        className={`bg-gray-950 rounded-lg shadow-lg border flex flex-col justify-between transition-all duration-300 ${selectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-800 hover:border-indigo-500'}`}
        onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-start gap-3">
                {selectionMode && (
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelection(id);
                        }}
                        className="mt-1 h-5 w-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                )}
                <h3 className="text-xl font-bold text-white pr-4 break-words">{title}</h3>
            </div>
          <div className="flex flex-shrink-0 gap-2">
            <div className="relative group">
               <button
                onClick={handleEdit}
                className="text-gray-500 hover:text-indigo-400 transition-colors duration-200 p-1"
                aria-label="Edit test case"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800">
                  Edit Test Case
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={handleDelete}
                className="text-gray-500 hover:text-rose-400 transition-colors duration-200 p-1"
                aria-label="Delete test case"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800">
                  Delete Test Case
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${priorityColorMap[priority]}`}>
            <span role="img" aria-label={priority}>{priorityDetails[priority].icon}</span>
            {priorityDetails[priority].text}
          </span>
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColorMap[status]}`}>
            <span role="img" aria-label={status}>{statusDetails[status].icon}</span>
            {statusDetails[status].text}
          </span>
        </div>

        <p className="text-gray-400 text-sm h-20 overflow-y-auto pr-2">
          {description || 'No description provided.'}
        </p>
      </div>
      
      <div className="bg-gray-950/50 border-t border-gray-800 px-5 py-3 rounded-b-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button onClick={handleViewExecutionHistory} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View Executions</button>
            <button onClick={handleViewVersionHistory} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View Changes</button>
        </div>
        <div className="text-right">
            <span className="text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded-full" title={`Version ${version}`}>v{version}</span>
            <p className="text-xs text-gray-500 mt-1" title={new Date(updatedAt).toLocaleString()}>
                Updated: {new Date(updatedAt).toLocaleDateString()}
            </p>
        </div>
      </div>
    </div>
  );
};

export default TestCaseCard;