import React from 'react';
import { Project, TestCase, Activity } from '../types';
import ProjectCard from './ProjectCard';
import SummaryCards from './SummaryCards';
import ActivityLogView from './ActivityLogView';
import PageHeader from './PageHeader';
import ProjectCardSkeleton from './ProjectCardSkeleton';

interface ProjectListViewProps {
    projects: Project[];
    testCases: TestCase[];
    onSelectProject: (id: string) => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: string) => void;
    onShowAddProjectForm: () => void;
    summaryStats: {
        totalProjects: number;
        totalTestCases: number;
        completionPercentage: number;
        activeTestRuns: number;
    };
    activityLog: Activity[];
    isLoading: boolean;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ 
    projects, 
    testCases, 
    onSelectProject, 
    onEditProject, 
    onDeleteProject, 
    onShowAddProjectForm,
    summaryStats,
    activityLog,
    isLoading
}) => {

    const getTestCaseCount = (projectId: string) => {
        return testCases.filter(tc => tc.projectId === projectId).length;
    }

    return (
        <div className="animate-subtle-fade-in">
            <PageHeader title="Dashboard" />
            
            <SummaryCards stats={summaryStats} />
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Projects</h2>
                        <button
                            onClick={onShowAddProjectForm}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            New Project
                        </button>
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => <ProjectCardSkeleton key={i} />)}
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in-up">
                            {projects.map(p => (
                                <ProjectCard 
                                    key={p.id}
                                    project={p}
                                    testCaseCount={getTestCaseCount(p.id)}
                                    onSelect={onSelectProject}
                                    onEdit={onEditProject}
                                    onDelete={onDeleteProject}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-6 bg-gray-950 rounded-lg border border-dashed border-gray-800">
                            <h3 className="text-2xl font-semibold text-gray-300">No Projects Yet</h3>
                            <p className="text-gray-400 mt-2">Click "New Project" to create your first project.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <ActivityLogView activities={activityLog} />
                </div>
            </div>
        </div>
    );
};

export default ProjectListView;