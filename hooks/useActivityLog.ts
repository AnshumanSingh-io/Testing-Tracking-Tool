import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types';

export const useActivityLog = (userId: string | null) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const logActivity = useCallback(async (message: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          message,
        }])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [data, ...prev.slice(0, 19)]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [userId]);

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities,
  };
};