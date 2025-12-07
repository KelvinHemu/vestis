export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture: string;
  oauth_provider: string;
  oauth_id: string;
  activated: boolean;
  credits: number;
  role?: string;
  created_at: string;
}

export interface UserResponse {
  user: User;
}
