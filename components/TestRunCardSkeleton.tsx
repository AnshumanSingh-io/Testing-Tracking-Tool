import React from 'react';

const TestRunCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-950 rounded-lg shadow-lg border border-gray-800 p-5 overflow-hidden animate-shimmer">
            <div className="h-4 bg-white/5 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-white/5 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/5 rounded w-1/2 mb-6"></div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="h-3 bg-white/5 rounded w-1/4"></div>
                    <div className="h-3 bg-white/5 rounded w-1/5"></div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2.5"></div>
                 <div className="h-3 bg-white/5 rounded w-1/6 mt-2 ml-auto"></div>
            </div>
             <div className="border-t border-gray-800/50 mt-4 pt-3">
                 <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default TestRunCardSkeleton;