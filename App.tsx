import React, { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const { currentUser, login, signup, logout, updateUser } = useAuth();
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = useCallback(async (username: string, password: string) => {
        try {
            setAuthError(null);
            await login(username, password);
        } catch (error: any) {
            setAuthError(error.message);
        }
    }, [login]);

    const handleSignup = useCallback(async (username: string, password: string, email: string) => {
        try {
            setAuthError(null);
            await signup(username, password, email);
        } catch (error: any)
{
            setAuthError(error.message);
        }
    }, [signup]);

    if (!currentUser) {
        return (
             <div className="min-h-screen bg-black text-slate-100 font-sans flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center gap-4 mb-8 animate-slide-in-up">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Testing Tracker Tool
                        </h1>
                    </div>

                    <div className="bg-gray-950 rounded-xl shadow-2xl border border-gray-800 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800">
                            <button
                                onClick={() => { setView('login'); setAuthError(null); }}
                                className={`flex-1 p-4 font-semibold text-center transition-colors duration-300 rounded-tl-lg ${view === 'login' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-950' : 'text-gray-400 hover:bg-gray-800/50'}`}
                                aria-current={view === 'login'}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => { setView('signup'); setAuthError(null); }}
                                className={`flex-1 p-4 font-semibold text-center transition-colors duration-300 rounded-tr-lg ${view === 'signup' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-gray-950' : 'text-gray-400 hover:bg-gray-800/50'}`}
                                aria-current={view === 'signup'}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Form Content Area */}
                        <div className="p-8">
                            {view === 'login' ? (
                                <LoginPage onLogin={handleLogin} error={authError} />
                            ) : (
                                <SignupPage onSignup={handleSignup} error={authError} />
                            )}
                        </div>
                    </div>
                 </div>
            </div>
        );
    }
    
    return <Dashboard user={currentUser} onLogout={logout} updateUser={updateUser} />;
};

export default App;