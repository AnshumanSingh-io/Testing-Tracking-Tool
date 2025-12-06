
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { UserRole } from './types';

const App: React.FC = () => {
    const { currentUser, allUsers, login, signup, logout, updateUser, isAuthLoading } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = async (username: string, password: string) => {
        try {
            setAuthError(null);
            await login(username, password);
        } catch (error: any) {
            setAuthError(error.message);
        }
    };

    const handleSignup = async (username: string, password: string, email: string, role: UserRole) => {
        try {
            setAuthError(null);
            await signup(username, password, email, role); // Pass role
        } catch (error: any) {
            setAuthError(error.message);
        }
    };
    
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <main className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
                 <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                                Test Tracker
                            </h1>
                        </div>
                        <p className="text-lg text-gray-400 mt-2">Manage your testing projects with ease.</p>
                    </div>

                    <div className="bg-gray-950/50 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300">
                        <div className="flex justify-center border-b border-gray-800 mb-6">
                            <button
                                onClick={() => { setAuthView('login'); setAuthError(null); }}
                                className={`px-6 py-3 text-lg font-semibold transition-colors ${authView === 'login' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => { setAuthView('signup'); setAuthError(null); }}
                                className={`px-6 py-3 text-lg font-semibold transition-colors ${authView === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {authView === 'login' ? (
                            <LoginPage onLogin={handleLogin} error={authError} />
                        ) : (
                            <SignupPage onSignup={handleSignup} error={authError} />
                        )}
                    </div>
                </div>
            </main>
        );
    }

    return <Dashboard user={currentUser} allUsers={allUsers} onLogout={logout} updateUser={updateUser} />;
};

export default App;
