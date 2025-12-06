
import React, { useCallback } from 'react';
import { Activity } from '../types';
import SummaryCards from './SummaryCards';
import PageHeader from './PageHeader';
import { db } from '../db';

interface AnalyticsViewProps {
    summaryStats: {
        totalProjects: number;
        totalTestCases: number;
        completionPercentage: number;
        activeTestRuns: number;
    };
    activityLog: Activity[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ summaryStats, activityLog }) => {

    const handleDownloadLogs = useCallback(async () => {
        try {
            // Fetch all logs from DB for a complete download
            const allLogs = await db.activityLog.orderBy('timestamp').reverse().toArray();
            
            let textContent = "SYSTEM ACTIVITY LOG\n";
            textContent += `Generated on: ${new Date().toLocaleString()}\n`;
            textContent += "========================================\n\n";

            allLogs.forEach(log => {
                textContent += `[${new Date(log.timestamp).toLocaleString()}] ${log.message}\n`;
            });

            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_log_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download logs", e);
            alert("Failed to download activity logs.");
        }
    }, []);

    return (
        <div className="animate-subtle-fade-in space-y-8">
            <PageHeader title="Analytics & Reports" subtitle="System metrics and audit trails" />
            
            {/* Summary Section */}
            <div>
                <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Performance Overview
                </h3>
                <SummaryCards stats={summaryStats} />
            </div>

            {/* Logs Section */}
            <div className="bg-gray-950 rounded-xl shadow-lg border border-gray-800 flex flex-col h-[600px]">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recent Activity
                    </h3>
                    <button 
                        onClick={handleDownloadLogs}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                        </svg>
                        Download Full Log (.txt)
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {activityLog.length > 0 ? (
                         <div className="space-y-4">
                            {activityLog.map(activity => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-900/50 transition-colors border border-transparent hover:border-gray-800">
                                    <div className="mt-1.5 flex-shrink-0 h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-1 font-mono">{new Date(activity.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>No recent activity recorded.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
