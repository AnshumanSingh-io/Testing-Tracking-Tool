import React, { useState, useEffect } from 'react';
import { Project } from '../types';

interface ProjectFormProps {
  onSave: (projectData: { name: string; description: string }) => void;
  onCancel: () => void;
  projectToEdit?: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, projectToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
    } else {
        setName('');
        setDescription('');
    }
  }, [projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setError('');
    onSave({ name, description });
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-20 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6 text-white text-center">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
        {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-4 text-center text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
            <input
              type="text"
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="e.g., Q3 Feature Release"
              required
            />
          </div>
          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="A brief description of the project..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
             <button
              type="button"
              onClick={onCancel}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 shadow-lg"
            >
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;