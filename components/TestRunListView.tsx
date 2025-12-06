
import React, { useState } from 'react';
import { TestRun, TestRunEntry, User, ExecutionStatus } from '../types';

interface TestRunListViewProps {
    testRuns: TestRun[];
    testRunEntries: TestRunEntry[];
    allUsers: User[];
    onSelectRun: (runId: string) => void;
}

const TestRunListView: React.FC<TestRunListViewProps> = ({ testRuns, testRunEntries, allUsers, onSelectRun }) => {
    const userMap = new Map(allUsers.map(u => [u.id, u.username]));
    const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Completed'>('All');

    const getRunStats = (runId: string) => {
        const entries = testRunEntries.filter(e => e.testRunId === runId);
        const total = entries.length;
        const executed = entries.filter(e => e.status !== ExecutionStatus.NotRun).length;
        const passed = entries.filter(e => e.status === ExecutionStatus.Passed).length;
        const failed = entries.filter(e => e.status === ExecutionStatus.Failed).length;
        return { total, executed, passed, failed };
    }

    const filteredRuns = testRuns.filter(run => {
        if (statusFilter === 'All') return true;
        return run.status === statusFilter;
    });

    if (testRuns.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800">
                <h3 className="text-2xl font-semibold text-gray-300">No Test Runs Yet</h3>
                <p className="text-gray-400 mt-2">Go to the "Master Sheet" tab, select test cases, and create a new run.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-gray-950/50 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Status Filter:</span>
                    <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                        {['All', 'In Progress', 'Completed'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                    statusFilter === filter 
                                    ? 'bg-indigo-600 text-white shadow' 
                                    : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-sm text-gray-400">
                    Showing {filteredRuns.length} runs
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="p-4 border-b border-gray-800 w-1/3">Run Name</th>
                            <th className="p-4 border-b border-gray-800 text-center w-24">Status</th>
                            <th className="p-4 border-b border-gray-800">Progress</th>
                            <th className="p-4 border-b border-gray-800">Assigned To</th>
                            <th className="p-4 border-b border-gray-800 text-right">Created</th>
                            <th className="p-4 border-b border-gray-800 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {filteredRuns.map((run) => {
                            const stats = getRunStats(run.id);
                            const progress = stats.total > 0 ? Math.round((stats.executed / stats.total) * 100) : 0;
                            const passRate = stats.executed > 0 ? Math.round((stats.passed / stats.executed) * 100) : 0;

                            return (
                                <tr 
                                    key={run.id} 
                                    onClick={() => onSelectRun(run.id)}
                                    className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4">
                                        <div className="font-bold text-white text-base mb-1">{run.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{run.id.slice(0, 8)}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${
                                            run.status === 'Completed' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        }`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="w-full max-w-xs">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-gray-300 font-medium">{progress}% Complete</span>
                                                <span className="text-gray-500">{stats.executed}/{stats.total} Executed</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2 flex overflow-hidden">
                                                <div className="bg-emerald-500 h-full" style={{ width: `${(stats.passed / stats.total) * 100}%` }}></div>
                                                <div className="bg-rose-500 h-full" style={{ width: `${(stats.failed / stats.total) * 100}%` }}></div>
                                                <div className="bg-amber-500 h-full" style={{ width: `${((stats.executed - stats.passed - stats.failed) / stats.total) * 100}%` }}></div>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1 flex gap-3">
                                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {stats.passed} Pass</span>
                                                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {stats.failed} Fail</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                                {(userMap.get(run.testerId) || '?')[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-300">{userMap.get(run.testerId) || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-sm text-gray-400">
                                        {new Date(run.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-indigo-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TestRunListView;
