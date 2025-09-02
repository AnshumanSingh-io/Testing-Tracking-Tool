import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TestRun, TestRunEntry, ExecutionStatus } from '../types';

export const useTestRuns = (projectId: string | null) => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [testRunEntries, setTestRunEntries] = useState<TestRunEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestRuns = useCallback(async () => {
    if (!projectId) {
      setTestRuns([]);
      setTestRunEntries([]);
      setLoading(false);
      return;
    }

    try {
      const [runsResponse, entriesResponse] = await Promise.all([
        supabase
          .from('test_runs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('test_run_entries')
          .select(`
            *,
            test_runs!inner(project_id)
          `)
          .eq('test_runs.project_id', projectId)
      ]);

      if (runsResponse.error) throw runsResponse.error;
      if (entriesResponse.error) throw entriesResponse.error;

      setTestRuns(runsResponse.data || []);
      setTestRunEntries(entriesResponse.data?.map(e => ({
        id: e.id,
        testRunId: e.test_run_id,
        testCaseId: e.test_case_id,
        status: e.status as ExecutionStatus,
        comments: e.comments,
        executedAt: e.executed_at,
      })) || []);
    } catch (error) {
      console.error('Error fetching test runs:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTestRuns();
  }, [fetchTestRuns]);

  const createTestRun = useCallback(async (runData: { name: string; tester: string }, selectedTestCaseIds: string[]) => {
    if (!projectId) return;

    try {
      const { data: runData_result, error: runError } = await supabase
        .from('test_runs')
        .insert([{
          project_id: projectId,
          name: runData.name,
          tester: runData.tester,
        }])
        .select()
        .single();

      if (runError) throw runError;

      const entries = selectedTestCaseIds.map(tcId => ({
        test_run_id: runData_result.id,
        test_case_id: tcId,
        status: 'Not Run',
        comments: '',
      }));

      const { data: entriesData, error: entriesError } = await supabase
        .from('test_run_entries')
        .insert(entries)
        .select();

      if (entriesError) throw entriesError;

      setTestRuns(prev => [runData_result, ...prev]);
      setTestRunEntries(prev => [
        ...prev,
        ...entriesData.map(e => ({
          id: e.id,
          testRunId: e.test_run_id,
          testCaseId: e.test_case_id,
          status: e.status as ExecutionStatus,
          comments: e.comments,
          executedAt: e.executed_at,
        }))
      ]);

      return runData_result;
    } catch (error) {
      console.error('Error creating test run:', error);
      throw error;
    }
  }, [projectId]);

  const updateTestRunEntry = useCallback(async (entryId: string, newStatus: ExecutionStatus, comments: string) => {
    try {
      const { data, error } = await supabase
        .from('test_run_entries')
        .update({
          status: newStatus,
          comments,
          executed_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      setTestRunEntries(prev => prev.map(entry => 
        entry.id === entryId 
        ? {
            id: data.id,
            testRunId: data.test_run_id,
            testCaseId: data.test_case_id,
            status: data.status as ExecutionStatus,
            comments: data.comments,
            executedAt: data.executed_at,
          }
        : entry
      ));
    } catch (error) {
      console.error('Error updating test run entry:', error);
      throw error;
    }
  }, []);

  return {
    testRuns,
    testRunEntries,
    loading,
    createTestRun,
    updateTestRunEntry,
    refetch: fetchTestRuns,
  };
};