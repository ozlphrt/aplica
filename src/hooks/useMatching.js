/**
 * useMatching Hook
 * Matching results access hook
 */
import { useMatching } from '../stores/matchingStore';

export function useMatching() {
  const store = useMatching();
  return store;
}

