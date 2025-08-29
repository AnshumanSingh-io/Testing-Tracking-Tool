import React from 'react';
import { Activity } from '../types';

interface ActivityLogViewProps {
    activities: Activity[];
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ activities }) => {
    return (
        <div className="bg-gray-950 rounded-xl shadow-lg border border-gray-800 h-full">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Activity Log</h2>
            </div>
            <div className="p-4 h-[500px] overflow-y-auto">
                {activities.length > 0 ? (
                    <ul className="space-y-4">
                        {activities.map(activity => (
                            <li key={activity.id} className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 h-3 w-3 rounded-full bg-teal-500 ring-2 ring-teal-500/20"></div>
                                <div>
                                    <p className="text-sm text-gray-200">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No recent activity.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogView;