import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          password: '' // Not stored for Supabase auth
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          password: ''
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      const user: User = {
        id: data.user.id,
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        password: ''
      };

      setCurrentUser(user);
      return user;
    },
    []
  );
  
  const signup = useCallback(
    async (username: string, password: string, email: string): Promise<User> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Signup failed');
      }

      const user: User = {
        id: data.user.id,
        username,
        email,
        password: ''
      };

      setCurrentUser(user);
      return user;
    },
    []
  );
  
  const updateUser = useCallback(async (updatedUser: User) => {
    const { error } = await supabase.auth.updateUser({
      email: updatedUser.email,
      data: {
        username: updatedUser.username,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    setCurrentUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  return { currentUser, login, signup, logout, updateUser, loading };
};