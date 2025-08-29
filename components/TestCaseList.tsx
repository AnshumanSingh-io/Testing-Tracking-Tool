import React from 'react';
import { TestCase } from '../types';
import TestCaseCard from './TestCaseCard';

interface TestCaseListProps {
  testCases: TestCase[];
  onDeleteTestCase: (id: string) => void;
  onEditTestCase: (testCase: TestCase) => void;
  onViewExecutionHistory: (testCase: TestCase) => void;
  onViewVersionHistory: (testCase: TestCase) => void;
  selectionMode: boolean;
  selectedTestCases: Set<string>;
  onToggleSelection: (id: string) => void;
  searchTerm: string;
}

const TestCaseList: React.FC<TestCaseListProps> = ({ 
  testCases, 
  onDeleteTestCase, 
  onEditTestCase,
  onViewExecutionHistory,
  onViewVersionHistory,
  selectionMode,
  selectedTestCases,
  onToggleSelection,
  searchTerm
}) => {
  if (testCases.length === 0 && searchTerm === '') {
    return null; // The parent component handles the empty state message
  }
  
  const filteredTestCases = testCases.filter(tc => 
    tc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredTestCases.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800 mt-6 col-span-full">
        <h3 className="text-2xl font-semibold text-gray-300">No Matching Test Cases</h3>
        <p className="text-gray-400 mt-2">No test cases found for "{searchTerm}". Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTestCases.map(tc => (
        <TestCaseCard
          key={tc.id}
          testCase={tc}
          onDelete={onDeleteTestCase}
          onEdit={onEditTestCase}
          onViewExecutionHistory={onViewExecutionHistory}
          onViewVersionHistory={onViewVersionHistory}
          selectionMode={selectionMode}
          isSelected={selectedTestCases.has(tc.id)}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
};

export default TestCaseList;