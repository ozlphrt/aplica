/**
 * Student Profile Store
 * Manages student profile state and questionnaire answers
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStudentProfileStore = create(
  persist(
    (set, get) => ({
      // Profile metadata
      profileId: null,
      createdAt: null,
      lastUpdated: null,

      // Answers object - stores all questionnaire answers
      answers: {},

      // Current question index
      currentQuestionIndex: 0,

      // Current tier
      currentTier: 1,

      // Actions
      initializeProfile: () => {
        const profileId = `profile_${Date.now()}`;
        set({
          profileId,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          answers: {},
          currentQuestionIndex: 0,
          currentTier: 1,
        });
      },

      updateAnswer: (questionId, value) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      setCurrentQuestion: (index) => {
        set({ currentQuestionIndex: index });
      },

      setCurrentTier: (tier) => {
        set({ currentTier: tier });
      },

      resetProfile: () => {
        set({
          profileId: null,
          createdAt: null,
          lastUpdated: null,
          answers: {},
          currentQuestionIndex: 0,
          currentTier: 1,
        });
      },
    }),
    {
      name: 'aplica-student-profile',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export default useStudentProfileStore;
