import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TestCase, TestCaseVersion } from '../types';

type TestCaseData = Omit<TestCase, 'id' | 'createdAt' | 'projectId' | 'updatedAt' | 'version'>;

export const useTestCases = (projectId: string | null) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCaseVersions, setTestCaseVersions] = useState<TestCaseVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestCases = useCallback(async () => {
    if (!projectId) {
      setTestCases([]);
      setTestCaseVersions([]);
      setLoading(false);
      return;
    }

    try {
      const [testCasesResponse, versionsResponse] = await Promise.all([
        supabase
          .from('test_cases')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('test_case_versions')
          .select(`
            *,
            test_cases!inner(project_id)
          `)
          .eq('test_cases.project_id', projectId)
          .order('changed_at', { ascending: false })
      ]);

      if (testCasesResponse.error) throw testCasesResponse.error;
      if (versionsResponse.error) throw versionsResponse.error;

      setTestCases(testCasesResponse.data || []);
      setTestCaseVersions(versionsResponse.data?.map(v => ({
        id: v.id,
        testCaseId: v.test_case_id,
        version: v.version,
        data: {
          title: v.title,
          description: v.description,
          priority: v.priority as any,
          status: v.status as any,
        },
        changedAt: v.changed_at,
      })) || []);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  const addTestCase = useCallback(async (testCaseData: TestCaseData) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert([{
          project_id: projectId,
          title: testCaseData.title,
          description: testCaseData.description,
          priority: testCaseData.priority,
          status: testCaseData.status,
        }])
        .select()
        .single();

      if (error) throw error;

      // Create initial version
      await supabase
        .from('test_case_versions')
        .insert([{
          test_case_id: data.id,
          version: 1,
          title: testCaseData.title,
          description: testCaseData.description,
          priority: testCaseData.priority,
          status: testCaseData.status,
        }]);

      setTestCases(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding test case:', error);
      throw error;
    }
  }, [projectId]);

  const addMultipleTestCases = useCallback(async (testCasesData: TestCaseData[]) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('test_cases')
        .insert(testCasesData.map(tc => ({
          project_id: projectId,
          title: tc.title,
          description: tc.description,
          priority: tc.priority,
          status: tc.status,
        })))
        .select();

      if (error) throw error;

      // Create initial versions for all test cases
      const versions = data.map(tc => ({
        test_case_id: tc.id,
        version: 1,
        title: tc.title,
        description: tc.description,
        priority: tc.priority,
        status: tc.status,
      }));

      await supabase
        .from('test_case_versions')
        .insert(versions);

      setTestCases(prev => [...data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding multiple test cases:', error);
      throw error;
    }
  }, [projectId]);

  const updateTestCase = useCallback(async (testCaseId: string, testCaseData: TestCaseData) => {
    try {
      const currentTestCase = testCases.find(tc => tc.id === testCaseId);
      if (!currentTestCase) return;

      // Save current version to history
      await supabase
        .from('test_case_versions')
        .insert([{
          test_case_id: currentTestCase.id,
          version: currentTestCase.version,
          title: currentTestCase.title,
          description: currentTestCase.description,
          priority: currentTestCase.priority,
          status: currentTestCase.status,
          changed_at: currentTestCase.updated_at,
        }]);

      // Update test case
      const { data, error } = await supabase
        .from('test_cases')
        .update({
          title: testCaseData.title,
          description: testCaseData.description,
          priority: testCaseData.priority,
          status: testCaseData.status,
          version: currentTestCase.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testCaseId)
        .select()
        .single();

      if (error) throw error;

      setTestCases(prev => prev.map(tc => tc.id === testCaseId ? data : tc));
      return data;
    } catch (error) {
      console.error('Error updating test case:', error);
      throw error;
    }
  }, [testCases]);

  const deleteTestCase = useCallback(async (testCaseId: string) => {
    try {
      const { error } = await supabase
        .from('test_cases')
        .delete()
        .eq('id', testCaseId);

      if (error) throw error;

      setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
      setTestCaseVersions(prev => prev.filter(v => v.testCaseId !== testCaseId));
    } catch (error) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  }, []);

  const rollbackTestCase = useCallback(async (testCaseId: string, versionId: string) => {
    try {
      const versionToRestore = testCaseVersions.find(v => v.id === versionId);
      const currentTestCase = testCases.find(tc => tc.id === testCaseId);

      if (!versionToRestore || !currentTestCase) return;

      // Save current version to history
      await supabase
        .from('test_case_versions')
        .insert([{
          test_case_id: currentTestCase.id,
          version: currentTestCase.version,
          title: currentTestCase.title,
          description: currentTestCase.description,
          priority: currentTestCase.priority,
          status: currentTestCase.status,
          changed_at: currentTestCase.updated_at,
        }]);

      // Update test case with restored data
      const { data, error } = await supabase
        .from('test_cases')
        .update({
          title: versionToRestore.data.title,
          description: versionToRestore.data.description,
          priority: versionToRestore.data.priority,
          status: versionToRestore.data.status,
          version: currentTestCase.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testCaseId)
        .select()
        .single();

      if (error) throw error;

      setTestCases(prev => prev.map(tc => tc.id === testCaseId ? data : tc));
      return data;
    } catch (error) {
      console.error('Error rolling back test case:', error);
      throw error;
    }
  }, [testCases, testCaseVersions]);

  return {
    testCases,
    testCaseVersions,
    loading,
    addTestCase,
    addMultipleTestCases,
    updateTestCase,
    deleteTestCase,
    rollbackTestCase,
    refetch: fetchTestCases,
  };
};