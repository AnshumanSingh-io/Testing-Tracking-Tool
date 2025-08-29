import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: (username: string, password: string) => Promise<void>;
    error: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!username || !password) return;
        setIsLoading(true);
        await onLogin(username, password);
        setIsLoading(false);
    };

    return (
        <div className="animate-subtle-fade-in">
            {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-6 text-center text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <div className="relative">
                     <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                     </span>
                     <input
                        type="text"
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Enter your username"
                        required
                        />
                  </div>
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                       </svg>
                    </span>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Enter your password"
                        required
                    />
                  </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-indigo-900/50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Logging In...' : 'Log In'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;