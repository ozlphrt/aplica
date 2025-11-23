/**
 * Adaptive Student Profile Questionnaire Component
 * Three-tier question system with conditional branching
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentProfileStore from '../../stores/studentProfileStore';
import useSavedCollegesStore from '../../stores/savedCollegesStore';
import { 
  getQuestionsForTier, 
  getAllVisibleQuestions,
  calculateProfileCompleteness 
} from '../../lib/questionnaire-logic';
import { clearCache } from '../../lib/scorecard-api';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';
import QuestionCard from './QuestionCard';

export default function ProfileQuestionnaire() {
  const navigate = useNavigate();
  const {
    answers,
    currentQuestionIndex,
    currentTier,
    initializeProfile,
    updateAnswer,
    setCurrentQuestion,
    setCurrentTier,
    resetProfile,
  } = useStudentProfileStore();

  const [questions, setQuestions] = useState([]);
  const [completeness, setCompleteness] = useState({ overall: 0, tier1: 0, tier2: 0, tier3: 0, canGenerateMatches: false });
  const [showRestartModal, setShowRestartModal] = useState(false);

  // Initialize profile on mount - but only if there's no profileId AND no answers
  // This prevents re-initializing when answers have been reset
  useEffect(() => {
    const state = useStudentProfileStore.getState();
    if (!state.profileId && (!state.answers || Object.keys(state.answers).length === 0)) {
      initializeProfile();
    }
  }, [initializeProfile]);

  // Update questions when answers change
  useEffect(() => {
    const visibleQuestions = getAllVisibleQuestions(answers);
    const currentQuestionId = questions[currentQuestionIndex]?.id;
    
    // Preserve current question position when questions array updates
    let newIndex = currentQuestionIndex;
    if (currentQuestionId && visibleQuestions.length > 0) {
      const foundIndex = visibleQuestions.findIndex(q => q.id === currentQuestionId);
      if (foundIndex >= 0) {
        newIndex = foundIndex;
      } else if (currentQuestionIndex >= visibleQuestions.length) {
        // Current index is out of bounds, go to last question
        newIndex = Math.max(0, visibleQuestions.length - 1);
      }
    }
    
    setQuestions(visibleQuestions);
    
    // Update completeness
    const comp = calculateProfileCompleteness(answers);
    setCompleteness(comp);

    // Auto-advance to next tier ONLY if:
    // 1. Current tier is complete
    // 2. We're on the last question of current tier
    // 3. Next tier has questions
    const currentTierQuestions = getQuestionsForTier(currentTier, answers);
    const currentTierAnswered = currentTierQuestions.filter(q => {
      const value = answers[q.id];
      return value !== null && value !== undefined && value !== '';
    });

    const isTierComplete = currentTierQuestions.length > 0 && 
                          currentTierAnswered.length === currentTierQuestions.length;
    
    const isOnLastQuestionOfTier = currentQuestionId && 
                                    currentTierQuestions.length > 0 &&
                                    currentTierQuestions[currentTierQuestions.length - 1].id === currentQuestionId;

    if (isTierComplete && isOnLastQuestionOfTier && currentTier < 3) {
      const nextTierQuestions = getQuestionsForTier(currentTier + 1, answers);
      if (nextTierQuestions.length > 0) {
        // Only advance if next tier has questions
        const nextTierFirstQuestionId = nextTierQuestions[0].id;
        const nextTierIndex = visibleQuestions.findIndex(q => q.id === nextTierFirstQuestionId);
        if (nextTierIndex >= 0) {
          setCurrentTier(currentTier + 1);
          setCurrentQuestion(nextTierIndex);
          return; // Don't update index below
        }
      }
      // If next tier is empty, don't advance - stay on current question
    }
    
    // Update question index if it changed (but not if we just advanced tiers)
    if (newIndex !== currentQuestionIndex && visibleQuestions.length > 0) {
      setCurrentQuestion(newIndex);
    }
  }, [answers, currentTier, setCurrentTier, setCurrentQuestion]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentTierQuestions = getQuestionsForTier(currentTier, answers);
  const currentTierProgress = currentTierQuestions.length > 0
    ? (currentTierQuestions.filter(q => {
        const value = answers[q.id];
        return value !== null && value !== undefined && value !== '';
      }).length / currentTierQuestions.length) * 100
    : 0;

  const handleAnswer = (questionId, value) => {
    updateAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestion && !currentQuestion.validation?.required) {
      updateAnswer(currentQuestion.id, null);
      handleNext();
    }
  };

  const handleFinish = () => {
    if (completeness.canGenerateMatches) {
      navigate('/results');
    }
  };

  const handleRestart = () => {
    setShowRestartModal(true);
  };

  const confirmRestart = () => {
    // Clear API cache to prevent stale matches
    clearCache();
    // Clear sessionStorage (comparison schools, etc.)
    sessionStorage.removeItem('comparisonSchools');
    // Clear saved colleges (My List)
    useSavedCollegesStore.getState().clearAll();
    // Reset profile (clears answers)
    resetProfile();
    // Initialize fresh profile
    initializeProfile();
    // Reset local state
    setCurrentQuestion(0);
    setCurrentTier(1);
    // Reset completeness to zero
    setCompleteness({ overall: 0, tier1: 0, tier2: 0, tier3: 0, canGenerateMatches: false });
    setShowRestartModal(false);
    // Navigate to home immediately - the empty answers will prevent match generation
    navigate('/');
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-0 sm:px-0.5 md:px-1 lg:px-2 py-2 sm:py-3 md:py-4 lg:py-6">
        <Card glassmorphic={true}>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Profile Complete!</h2>
            <p className="text-white/70 mb-6">Your profile is {completeness.overall}% complete</p>
            {completeness.canGenerateMatches ? (
              <Button variant="primary" size="lg" onClick={handleFinish}>
                See My Matches
              </Button>
            ) : (
              <p className="text-white/60">Complete Tier 1 questions to generate matches</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6 sticky top-4 z-10">
        <Card glassmorphic={true} className="p-2 sm:p-3 md:p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/80">Overall Progress</span>
                <span className="text-sm font-semibold text-white">{completeness.overall}%</span>
              </div>
              <Progress value={completeness.overall} showLabel={false} showDot={true} />
              <div className="flex gap-4 text-xs text-white/60 mt-2">
                <span>Tier 1: {completeness.tier1}%</span>
                <span>Tier 2: {completeness.tier2}%</span>
                <span>Tier 3: {completeness.tier3}%</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleRestart}
              className="ml-4 text-xs text-white/60 hover:text-white/90"
            >
              Start Over
            </Button>
          </div>
        </Card>
      </div>

      {/* Question Card */}
      <Card glassmorphic={true}>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-4 sm:pt-6 md:pt-8">
          <QuestionCard
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            canGenerateMatches={completeness.canGenerateMatches}
            onFinish={handleFinish}
          />
        </CardContent>
      </Card>

      {/* Question Counter */}
      <div className="text-center mt-4 text-sm text-white/60">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      {/* Restart Confirmation Modal */}
      <Modal
        isOpen={showRestartModal}
        onClose={() => setShowRestartModal(false)}
        title="Start Over?"
        message="Are you sure you want to start over? This will clear all your answers and reset your progress."
        confirmText="Start Over"
        cancelText="Cancel"
        onConfirm={confirmRestart}
        variant="danger"
      />
    </div>
  );
}
