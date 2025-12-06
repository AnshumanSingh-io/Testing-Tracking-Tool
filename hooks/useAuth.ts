
import { useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { UserRole } from '../types';
import { db } from '../db';

const SESSION_KEY = 'testing_tracker_session_user_id';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      try {
        const [users] = await Promise.all([
            db.users.toArray(),
        ]);
        setAllUsers(users);
        
        const userId = window.sessionStorage.getItem(SESSION_KEY);
        if (userId) {
          const user = users.find(u => u.id === userId);
          setCurrentUser(user || null);
        }
      } catch (e) {
        console.error('Failed to initialize auth state:', e);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<User> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = await db.users.where('username').equalsIgnoreCase(username).first();
      if (user && user.password === password) {
        window.sessionStorage.setItem(SESSION_KEY, user.id);
        setCurrentUser(user);
        return user;
      } else {
        throw new Error('Invalid username or password.');
      }
    },
    []
  );
  
  const signup = useCallback(
    async (username: string, password: string, email: string, role: UserRole): Promise<User> => {
       // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      
      const existingUser = await db.users.where('username').equalsIgnoreCase(username).first();
      if (existingUser) {
        throw new Error('Username is already taken.');
      }

      const newUser: User = { 
        id: crypto.randomUUID(), 
        username, 
        password, 
        email, 
        role // Store the selected role
      };
      
      await db.users.add(newUser);
      setAllUsers(prev => [...prev, newUser]);
      window.sessionStorage.setItem(SESSION_KEY, newUser.id);
      setCurrentUser(newUser);
      return newUser;
    },
    []
  );
  
  const updateUser = useCallback(async (updatedUser: User) => {
    await db.users.update(updatedUser.id, updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return { currentUser, allUsers, login, signup, logout, updateUser, isAuthLoading };
};
