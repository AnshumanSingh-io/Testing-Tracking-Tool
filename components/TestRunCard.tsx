import React from 'react';
import { TestRun } from '../types';

interface TestRunCardProps {
    run: TestRun;
    stats: {
        total: number;
        executed: number;
    };
    onSelect: () => void;
}

const TestRunCard: React.FC<TestRunCardProps> = ({ run, stats, onSelect }) => {
    const progress = stats.total > 0 ? Math.round((stats.executed / stats.total) * 100) : 0;

    return (
        <div 
            className="bg-gray-950 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-between hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            onClick={onSelect}
        >
            <div className="p-5">
                <h3 className="text-xl font-bold text-white truncate mb-2">{run.name}</h3>
                <div className="text-sm text-gray-400 mb-4">
                    Assigned to: <span className="font-semibold text-gray-200">{run.tester}</span>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-indigo-300">Progress</span>
                        <span className="text-xs font-semibold text-gray-300">{stats.executed} / {stats.total}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                     <div className="text-right text-xs text-gray-400 mt-1">{progress}% Complete</div>
                </div>
            </div>
      
            <div className="bg-gray-950/50 border-t border-gray-800 px-5 py-3 rounded-b-lg">
                <p className="text-xs text-gray-500">
                    Created: {new Date(run.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default TestRunCard;