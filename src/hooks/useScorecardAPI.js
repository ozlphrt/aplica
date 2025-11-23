/**
 * useScorecardAPI Hook
 * React hook for live College Scorecard API access
 */
import { useState, useCallback } from 'react';
import { fetchSchools, fetchSchoolsPaginated, searchSchoolsByName } from '../lib/scorecard-api';

export function useScorecardAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);

  /**
   * Fetch schools with filters
   */
  const search = useCallback(async (filters = {}, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSchools(filters, options);
      setSchools(result.schools);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      setSchools([]);
      setTotal(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch multiple pages of results
   */
  const searchPaginated = useCallback(async (filters = {}, maxResults = 500, onProgress = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSchoolsPaginated(filters, maxResults, onProgress);
      setSchools(result.schools);
      setTotal(result.total);
      return result;
    } catch (err) {
      setError(err.message);
      setSchools([]);
      setTotal(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search by school name
   */
  const searchByName = useCallback(async (searchTerm, filters = {}, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchSchoolsByName(searchTerm, filters, limit);
      setSchools(results);
      setTotal(results.length);
      return results;
    } catch (err) {
      setError(err.message);
      setSchools([]);
      setTotal(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schools,
    total,
    loading,
    error,
    search,
    searchPaginated,
    searchByName,
  };
}

