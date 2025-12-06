
import React, { useState, useEffect } from 'react';
import { Project, User } from '../types';

interface ProjectFormProps {
  onSave: (projectData: { name: string; description: string; members: string[] }) => void;
  onCancel: () => void;
  projectToEdit?: Project | null;
  allUsers: User[];
  currentUser: User;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSave, onCancel, projectToEdit, allUsers, currentUser }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setMembers(projectToEdit.members || []);
    } else {
        setName('');
        setDescription('');
        setMembers([]);
    }
  }, [projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setError('');
    onSave({ name, description, members });
  };

  const handleToggleMember = (userId: string) => {
      setMembers(prev => {
          if (prev.includes(userId)) return prev.filter(id => id !== userId);
          return [...prev, userId];
      });
  }

  // Filter out self from list (owner is implicit)
  const assignableUsers = allUsers.filter(u => u.id !== currentUser.id);

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
          
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Team Members (Access)</label>
             <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                 {assignableUsers.length > 0 ? assignableUsers.map(user => (
                     <div key={user.id} className="flex items-center gap-3">
                         <input 
                            type="checkbox" 
                            id={`member-${user.id}`}
                            checked={members.includes(user.id)}
                            onChange={() => handleToggleMember(user.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                         />
                         <label htmlFor={`member-${user.id}`} className="text-gray-300 text-sm cursor-pointer select-none">
                             {user.username} <span className="text-gray-500 text-xs">({user.role})</span>
                         </label>
                     </div>
                 )) : (
                     <p className="text-gray-500 text-sm italic">No other users available to assign.</p>
                 )}
             </div>
             <p className="text-xs text-gray-500 mt-1">Selected users will be able to view and access this project.</p>
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
