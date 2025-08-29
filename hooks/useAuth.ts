import { useState, useCallback } from 'react';
import type { User } from '../types';
import useLocalStorage from './useLocalStorage';

const USERS_KEY = 'testing_tracker_users';
const SESSION_KEY = 'testing_tracker_session_user_id';

export const useAuth = () => {
  const [users, setUsers] = useLocalStorage<User[]>(USERS_KEY, []);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const userId = window.sessionStorage.getItem(SESSION_KEY);
      if (userId) {
        const storedUsers = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]') as User[];
        return storedUsers.find(u => u.id === userId) || null;
      }
      return null;
    } catch (e) {
      console.error('Failed to initialize auth state:', e);
      return null;
    }
  });

  const login = useCallback(
    (username: string, password: string): Promise<User> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
          if (user) {
            window.sessionStorage.setItem(SESSION_KEY, user.id);
            setCurrentUser(user);
            resolve(user);
          } else {
            reject(new Error('Invalid username or password.'));
          }
        }, 500); // Simulate network delay
      });
    },
    [users]
  );
  
  const signup = useCallback(
    (username: string, password: string, email: string): Promise<User> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return reject(new Error('Username is already taken.'));
          }
          if (password.length < 6) {
            return reject(new Error('Password must be at least 6 characters long.'));
          }
          const newUser: User = { id: crypto.randomUUID(), username, password, email };
          setUsers(prevUsers => [...prevUsers, newUser]);
          window.sessionStorage.setItem(SESSION_KEY, newUser.id);
          setCurrentUser(newUser);
          resolve(newUser);
        }, 500); // Simulate network delay
      });
    },
    [users, setUsers]
  );
  
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  }, [setUsers]);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return { currentUser, login, signup, logout, updateUser };
};