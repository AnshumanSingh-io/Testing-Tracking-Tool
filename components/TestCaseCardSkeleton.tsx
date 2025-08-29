import React from 'react';

const TestCaseCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-950 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-between p-5 animate-pulse">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-gray-800 rounded w-2/3"></div>
                    <div className="flex gap-2">
                        <div className="h-6 w-6 bg-gray-800 rounded"></div>
                        <div className="h-6 w-6 bg-gray-800 rounded"></div>
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <div className="h-5 bg-gray-800 rounded-full w-24"></div>
                    <div className="h-5 bg-gray-800 rounded-full w-28"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-full"></div>
                    <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-4 pt-3 flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-800 rounded w-20"></div>
                    <div className="h-4 bg-gray-800 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-800 rounded-full w-16"></div>
            </div>
        </div>
    );
};

export default TestCaseCardSkeleton;