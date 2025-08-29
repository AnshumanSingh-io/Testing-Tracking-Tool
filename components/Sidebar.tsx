import React from 'react';
import { User } from '../types';

interface SidebarProps {
    user: User;
    onLogout: () => void;
    onNavigate: (view: 'dashboard' | 'profile') => void;
    currentView: 'dashboard' | 'project' | 'profile';
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-base font-medium ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
        >
            {icon}
            {label}
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onNavigate, currentView }) => {
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <aside className="fixed top-0 left-0 h-full w-64 bg-gray-950 border-r border-gray-800/50 flex-col p-4 shadow-2xl animate-slide-in-from-left hidden lg:flex">
            <div className="flex items-center gap-3 p-2 mb-6">
                 <div className="p-2 bg-indigo-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                    Test Tracker
                </h1>
            </div>

            <nav className="flex-grow space-y-2">
                <NavLink
                    label="Dashboard"
                    isActive={currentView === 'dashboard' || currentView === 'project'}
                    onClick={() => onNavigate('dashboard')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>}
                />
                <NavLink
                    label="My Profile"
                    isActive={currentView === 'profile'}
                    onClick={() => onNavigate('profile')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
                />
            </nav>

            <div className="mt-auto">
                 <div className="p-3 bg-black/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                            {getInitials(user.username)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="relative group">
                            <button onClick={onLogout} className="text-gray-500 hover:text-rose-400 p-2 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-800">
                                Logout
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;