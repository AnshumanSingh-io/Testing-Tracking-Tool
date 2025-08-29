import React from 'react';

interface SummaryCardsProps {
    stats: {
        totalProjects: number;
        totalTestCases: number;
        completionPercentage: number;
        activeTestRuns: number;
    };
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; className?: string }> = ({ title, value, icon, className = 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' }) => (
    <div className="bg-gray-950 p-6 rounded-xl shadow-lg border border-gray-800 flex items-center gap-4">
        <div className={`p-3 rounded-lg border ${className}`}>
            {icon}
        </div>
        <div>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{title}</div>
        </div>
    </div>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Total Projects" 
                value={stats.totalProjects} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>}
            />
            <StatCard 
                title="Total Test Cases" 
                value={stats.totalTestCases} 
                className="bg-sky-600/20 text-sky-400 border-sky-500/30"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>}
            />
             <StatCard 
                title="Active Test Runs" 
                value={stats.activeTestRuns} 
                className="bg-violet-600/20 text-violet-400 border-violet-500/30"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
            />
            <StatCard 
                title="Tests Completed" 
                value={`${stats.completionPercentage}%`}
                className="bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
            />
        </div>
    );
};

export default SummaryCards;