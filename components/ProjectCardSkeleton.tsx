import React from 'react';

const ProjectCardSkeleton: React.FC = () => {
    return (
        <div className="bg-gray-950 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-between p-5 animate-pulse">
            <div className="mb-3">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6 mb-4"></div>
                <div className="h-6 bg-gray-800 rounded-full w-28"></div>
            </div>
            <div className="border-t border-gray-800 pt-3">
                 <div className="h-3 bg-gray-800 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default ProjectCardSkeleton;