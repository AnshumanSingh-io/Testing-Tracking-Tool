import React from 'react';
import { TestRun, TestRunEntry } from '../types';
import TestRunCard from './TestRunCard';

interface TestRunListViewProps {
    testRuns: TestRun[];
    testRunEntries: TestRunEntry[];
    onSelectRun: (runId: string) => void;
}

const TestRunListView: React.FC<TestRunListViewProps> = ({ testRuns, testRunEntries, onSelectRun }) => {

    const getRunStats = (runId: string) => {
        const entries = testRunEntries.filter(e => e.testRunId === runId);
        const total = entries.length;
        const executed = entries.filter(e => e.status !== 'Not Run').length;
        return { total, executed };
    }

    if (testRuns.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800">
                <h3 className="text-2xl font-semibold text-gray-300">No Test Runs Yet</h3>
                <p className="text-gray-400 mt-2">Go to the "Test Cases" tab to select cases and create a new run.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {testRuns.map(run => (
                <TestRunCard 
                    key={run.id} 
                    run={run} 
                    stats={getRunStats(run.id)}
                    onSelect={() => onSelectRun(run.id)}
                />
            ))}
        </div>
    );
};

export default TestRunListView;