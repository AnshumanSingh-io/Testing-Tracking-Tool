
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
    user: User;
    onLogout: () => void;
    onNavigate: (view: 'dashboard' | 'profile' | 'assigned_runs' | 'user_management' | 'analytics') => void;
    currentView: 'dashboard' | 'project' | 'profile' | 'assigned_runs' | 'user_management' | 'analytics';
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isCollapsed }) => {
    return (
        <button
            onClick={onClick}
            title={isCollapsed ? label : ''}
            className={`relative w-full flex items-center gap-3 py-3 rounded-lg text-left text-base font-medium transition-all duration-200 ease-in-out transform ${
                isActive 
                ? 'bg-indigo-600/90 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:translate-x-1'
            } ${isCollapsed ? 'justify-center px-2' : 'pl-6 pr-4'}`}
        >
            <span className={`absolute left-0 top-1/4 h-1/2 w-1.5 bg-indigo-400 rounded-r-full transition-transform duration-300 ease-out origin-center ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></span>
            <div className="flex-shrink-0">{icon}</div>
            {!isCollapsed && <span className="truncate">{label}</span>}
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onNavigate, currentView, isCollapsed, toggleCollapse }) => {
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadge = (role: UserRole) => {
        switch(role) {
            case UserRole.ADMIN: return <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30">ADM</span>;
            case UserRole.SUPER_USER: return <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">SUP</span>;
            case UserRole.USER: return <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">USR</span>;
            default: return null;
        }
    }

    return (
        <aside className={`fixed top-0 left-0 h-full bg-gray-950 border-r border-gray-800/50 flex flex-col p-4 shadow-2xl animate-slide-in-from-left hidden lg:flex transition-all duration-300 z-20 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center gap-3 p-2 mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
                 <div className="p-2 bg-indigo-600 rounded-lg flex-shrink-0 cursor-pointer" onClick={toggleCollapse}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-xl font-bold text-white tracking-tight leading-none whitespace-nowrap">
                            Test Tracker
                        </h1>
                    </div>
                )}
            </div>
            
            <button 
                onClick={toggleCollapse} 
                className="absolute -right-3 top-20 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 shadow-md transform hover:scale-110 transition z-50 hidden lg:block"
            >
                {isCollapsed ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                )}
            </button>

            <nav className="flex-grow space-y-2 mt-4">
                <NavLink
                    label="Dashboard"
                    isActive={currentView === 'dashboard' || currentView === 'project'}
                    onClick={() => onNavigate('dashboard')}
                    isCollapsed={isCollapsed}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>}
                />
                <NavLink
                    label="Analytics"
                    isActive={currentView === 'analytics'}
                    onClick={() => onNavigate('analytics')}
                    isCollapsed={isCollapsed}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>}
                />
                <NavLink
                    label="Assigned to Me"
                    isActive={currentView === 'assigned_runs'}
                    onClick={() => onNavigate('assigned_runs')}
                    isCollapsed={isCollapsed}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    }
                />
                {user.role === UserRole.ADMIN && (
                    <NavLink
                        label="User Management"
                        isActive={currentView === 'user_management'}
                        onClick={() => onNavigate('user_management')}
                        isCollapsed={isCollapsed}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>}
                    />
                )}
                <NavLink
                    label="My Profile"
                    isActive={currentView === 'profile'}
                    onClick={() => onNavigate('profile')}
                    isCollapsed={isCollapsed}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
                />
            </nav>

            <div className="mt-auto">
                 <div className={`p-2 bg-black/50 rounded-lg border border-gray-800 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                        {getInitials(user.username)}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-white text-sm truncate">{user.username}</p>
                            <div className="flex items-center gap-2">
                                {getRoleBadge(user.role)}
                            </div>
                        </div>
                    )}
                    <div className="relative group">
                        <button onClick={onLogout} className="text-gray-500 hover:text-rose-400 p-1.5 rounded-md transition-colors" title="Logout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
