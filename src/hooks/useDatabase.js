/**
 * useDatabase Hook
 * Database access hook
 */
import { useEffect, useState } from 'react';
import { useDatabase } from '../stores/databaseStore';

export function useDatabase() {
  const { db, loading, error, setDatabase, setLoading, setError } = useDatabase();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Initialize database
      setInitialized(true);
    }
  }, [initialized]);

  return { db, loading, error };
}

