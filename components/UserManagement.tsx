
import React from 'react';
import { User, UserRole } from '../types';
import PageHeader from './PageHeader';

interface UserManagementProps {
    users: User[];
    currentUser: User;
    onUpdateRole: (userId: string, newRole: UserRole) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onUpdateRole }) => {
    
    if (currentUser.role !== UserRole.ADMIN) {
        return <div className="text-center p-8 text-rose-400">Unauthorized Access</div>;
    }

    return (
        <div className="animate-subtle-fade-in">
            <PageHeader title="User Management" subtitle="Manage system users and their roles" />
            
            <div className="bg-gray-950 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 text-xs uppercase text-gray-400">
                        <tr>
                            <th className="p-4 border-b border-gray-800">User</th>
                            <th className="p-4 border-b border-gray-800">Email</th>
                            <th className="p-4 border-b border-gray-800">Current Role</th>
                            <th className="p-4 border-b border-gray-800">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-900/50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
                                        {user.username.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-gray-200">{user.username} {user.id === currentUser.id && '(You)'}</span>
                                </td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                        user.role === UserRole.ADMIN ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                                        user.role === UserRole.SUPER_USER ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select 
                                        value={user.role}
                                        onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                                        disabled={user.id === currentUser.id}
                                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value={UserRole.ADMIN}>ADMIN</option>
                                        <option value={UserRole.SUPER_USER}>SUPER USER</option>
                                        <option value={UserRole.USER}>USER</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
