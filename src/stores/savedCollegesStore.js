/**
 * Saved Colleges Store
 * Manages user's saved college list
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useSavedCollegesStore = create(
  persist(
    (set, get) => ({
      // Saved colleges - stored as array of school IDs (unitid)
      savedCollegeIds: [],

      // Actions
      isSaved: (schoolId) => {
        const { savedCollegeIds } = get();
        return savedCollegeIds.includes(schoolId);
      },

      toggleSave: (schoolId) => {
        set((state) => {
          const currentIds = state.savedCollegeIds || [];
          if (currentIds.includes(schoolId)) {
            return { savedCollegeIds: currentIds.filter(id => id !== schoolId) };
          } else {
            return { savedCollegeIds: [...currentIds, schoolId] };
          }
        });
      },

      addCollege: (schoolId) => {
        set((state) => {
          const currentIds = state.savedCollegeIds || [];
          if (!currentIds.includes(schoolId)) {
            return { savedCollegeIds: [...currentIds, schoolId] };
          }
          return state;
        });
      },

      removeCollege: (schoolId) => {
        set((state) => {
          const currentIds = state.savedCollegeIds || [];
          return { savedCollegeIds: currentIds.filter(id => id !== schoolId) };
        });
      },

      clearAll: () => {
        set({ savedCollegeIds: [] });
      },
    }),
    {
      name: 'aplica-saved-colleges',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export default useSavedCollegesStore;

