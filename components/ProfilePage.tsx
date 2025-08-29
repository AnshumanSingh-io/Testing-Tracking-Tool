import React, { useState } from 'react';
import { User } from '../types';
import PageHeader from './PageHeader';

interface ProfilePageProps {
  user: User;
  onSave: (user: User) => void;
  projectCount: number;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, projectCount }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, username, email });
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="animate-subtle-fade-in">
        <PageHeader title="My Profile" />

        {message && (
            <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-md mb-6 text-center animate-fade-in">{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-950 p-8 rounded-xl shadow-2xl border border-gray-800">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                     <div className="flex-shrink-0 w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                        {getInitials(user.username)}
                    </div>
                    <form onSubmit={handleSave} className="space-y-6 w-full">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={!isEditing}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-900/50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!isEditing}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-900/50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-2">
                            {isEditing ? (
                                <>
                                    <button type="button" onClick={() => { setIsEditing(false); setUsername(user.username); setEmail(user.email); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Changes</button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Edit Profile</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-1">
                 <div className="bg-gray-950 p-6 rounded-xl shadow-lg border border-gray-800 flex items-center gap-4">
                    <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-lg border border-indigo-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">{projectCount}</div>
                        <div className="text-sm text-gray-400">Total Projects</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;