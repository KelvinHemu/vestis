import { useAuthStore } from '@/contexts/authStore';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for managing onboarding flow
 * Provides utilities for checking onboarding status, navigating through steps,
 * and completing the onboarding process
 */
export const useOnboarding = () => {
  const router = useRouter();
  const { 
    user, 
    updateOnboardingStatus, 
    setUserIntent, 
    getOnboardingStatus,
    onboardingProgress,
    setOnboardingProgress 
  } = useAuthStore();

  /**
   * Check if user needs onboarding
   * Returns true if user is authenticated but hasn't completed onboarding
   */
  const needsOnboarding = (): boolean => {
    if (!user) return false;
    return !user.onboardingCompleted;
  };

  /**
   * Get user's selected intent
   */
  const getUserIntent = () => {
    return user?.intent || null;
  };

  /**
   * Save user's intent and navigate to creation flow
   */
  const selectIntent = (intent: 'on_model' | 'flat_lay' | 'mannequin' | 'background_change') => {
    setUserIntent(intent);
    
    // Map intent to route
    // Note: (onboarding) is a route group and doesn't appear in URLs
    const intentRouteMap = {
      on_model: '/create/on-model',
      flat_lay: '/create/flat-lay',
      mannequin: '/create/mannequin',
      background_change: '/create/background',
    };
    
    // Update progress tracker
    setOnboardingProgress('creation');
    
    // Navigate to appropriate creation flow
    router.push(intentRouteMap[intent]);
  };

  /**
   * Mark onboarding as complete and redirect to dashboard
   */
  const completeOnboarding = () => {
    updateOnboardingStatus(true);
    setOnboardingProgress(null);
    router.push('/dashboard');
  };

  /**
   * Navigate to result screen after successful generation
   */
  const goToResult = (imageUrl: string, aspectRatio?: string) => {
    // Store generated image URL and aspect ratio in sessionStorage for result page
    sessionStorage.setItem('onboarding-result-image', imageUrl);
    if (aspectRatio) {
      sessionStorage.setItem('onboarding-result-aspectRatio', aspectRatio);
    }
    setOnboardingProgress('result');
    router.push('/create/result');
  };

  /**
   * Resume onboarding from where user left off
   * Called when user returns after abandoning mid-flow
   */
  const resumeOnboarding = () => {
    const intent = getUserIntent();
    
    if (!onboardingProgress || !intent) {
      // No progress or intent, start from beginning
      router.push('/intent');
      return;
    }

    // Resume based on progress
    if (onboardingProgress === 'creation') {
      const intentRouteMap = {
        on_model: '/create/on-model',
        flat_lay: '/create/flat-lay',
        mannequin: '/create/mannequin',
        background_change: '/create/background',
      };
      router.push(intentRouteMap[intent]);
    } else if (onboardingProgress === 'result') {
      router.push('/create/result');
    } else {
      router.push('/intent');
    }
  };

  return {
    needsOnboarding,
    getUserIntent,
    selectIntent,
    completeOnboarding,
    goToResult,
    resumeOnboarding,
    onboardingProgress,
    isOnboardingComplete: getOnboardingStatus(),
  };
};

