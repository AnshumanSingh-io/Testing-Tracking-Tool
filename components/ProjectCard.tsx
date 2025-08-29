import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    testCaseCount: number;
    onSelect: (id: string) => void;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, testCaseCount, onSelect, onEdit, onDelete }) => {
    const { id, name, description, createdAt } = project;

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(project);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(id);
    };

    return (
        <div 
            className="bg-gray-950 rounded-lg shadow-lg border border-gray-800 flex flex-col justify-between hover:border-indigo-500 transition-all duration-300 cursor-pointer"
            onClick={() => onSelect(id)}
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-xl font-bold text-white pr-4 break-words">{name}</h3>
                    <div className="flex flex-shrink-0 gap-2">
                         <div className="relative group">
                            <button
                                onClick={handleEditClick}
                                className="text-gray-500 hover:text-indigo-400 transition-colors duration-200 p-1"
                                aria-label={`Edit project ${name}`}
                            >
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800">
                                Edit Project
                            </span>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={handleDeleteClick}
                                className="text-gray-500 hover:text-rose-400 transition-colors duration-200 p-1"
                                aria-label={`Delete project ${name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800">
                                Delete Project
                            </span>
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-400 text-sm h-16 overflow-y-auto pr-2 mb-4">
                    {description || 'No description provided.'}
                </p>
                <div className="text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 inline-block">
                    {testCaseCount} {testCaseCount === 1 ? 'Test Case' : 'Test Cases'}
                </div>
            </div>
      
            <div className="bg-gray-950/50 border-t border-gray-800 px-5 py-3 rounded-b-lg">
                <p className="text-xs text-gray-500">
                    Created: {new Date(createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

export default ProjectCard;