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
}

export interface UserResponse {
  user: User;
}
