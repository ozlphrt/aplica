/**
 * Database Store
 * Zustand store for database connection status
 */
import { create } from 'zustand';

export const useDatabase = create((set) => ({
  // State
  db: null,
  loading: true,
  error: null,
  version: null,
  
  // Actions
  setDatabase: (db) => set({ db, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setVersion: (version) => set({ version }),
}));

