export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  oauth_provider?: string;
  oauth_id?: string;
  activated: boolean;
  credits: number;
  credits_expires_at?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  
  // Onboarding fields (frontend-only for now)
  // These fields help guide first-time users through initial setup
  isFirstLogin?: boolean;
  onboardingCompleted?: boolean;
  intent?: 'on_model' | 'flat_lay' | 'mannequin' | 'background_change';
}

export interface UserResponse {
  user: User;
}
