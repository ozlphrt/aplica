/**
 * useDatabase Hook
 * Database access hook
 */
import { useEffect, useState } from 'react';
import { initDatabase } from '../lib/database';
import { useDatabase } from '../stores/databaseStore';

export function useDatabase() {
  const { db, loading, error, setDatabase, setLoading, setError } = useDatabase();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && !db && !loading) {
      setInitialized(true);
      initDatabase()
        .then((database) => {
          setDatabase(database);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [initialized, db, loading, setDatabase, setError]);

  return { db, loading, error };
}

