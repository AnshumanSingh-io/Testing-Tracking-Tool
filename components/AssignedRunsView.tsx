import React, { useMemo } from 'react';
import { Project, TestRun, TestRunEntry, User } from '../types';
import PageHeader from './PageHeader';
import TestRunCard from './TestRunCard';
import TestRunCardSkeleton from './TestRunCardSkeleton';

interface AssignedRunsViewProps {
    assignedTestRuns: TestRun[];
    allUsers: User[];
    allProjects: Project[];
    testRunEntries: TestRunEntry[];
    onSelectAssignedRun: (projectId: string, runId: string) => void;
    isLoading: boolean;
}

const AssignedRunsView: React.FC<AssignedRunsViewProps> = ({ 
    assignedTestRuns, 
    allUsers, 
    allProjects, 
    testRunEntries, 
    onSelectAssignedRun, 
    isLoading 
}) => {
    const userMap = useMemo(() => new Map(allUsers.map(user => [user.id, user.username])), [allUsers]);
    const projectMap = useMemo(() => new Map(allProjects.map(p => [p.id, p.name])), [allProjects]);

    const getRunStats = (runId: string) => {
        const entries = testRunEntries.filter(e => e.testRunId === runId);
        const total = entries.length;
        const executed = entries.filter(e => e.status !== 'Not Run').length;
        return { total, executed };
    };

    return (
        <div className="animate-subtle-fade-in">
            <PageHeader title="Assigned to Me" subtitle="All test runs that require your action" />

            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <TestRunCardSkeleton key={i} />)}
                </div>
            ) : assignedTestRuns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignedTestRuns.map((run, index) => (
                        <div
                            key={run.id}
                            className="animate-pop-in"
                            style={{ animationDelay: `${index * 75}ms` }}
                        >
                            <TestRunCard
                                run={run}
                                stats={getRunStats(run.id)}
                                onSelect={() => onSelectAssignedRun(run.projectId, run.id)}
                                testerName={userMap.get(run.testerId) || 'Unknown'}
                                projectName={projectMap.get(run.projectId) || 'Unknown Project'}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-300">Nothing Assigned</h3>
                    <p className="text-gray-400 mt-2">You currently have no test runs assigned to you.</p>
                </div>
            )}
        </div>
    );
};

export default AssignedRunsView;