/**
 * useStudentProfile Hook
 * Student profile access hook
 */
import { useStudentProfile } from '../stores/studentProfileStore';

export function useStudentProfile() {
  const store = useStudentProfile();
  return store;
}

