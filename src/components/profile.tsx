import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { User as UserIcon, Zap } from 'lucide-react';
import { useAuthStore } from '../contexts/authStore';
import userService from '../services/userService';
import type { User } from '../types/user';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await userService.getCurrentUser(token);
        setUser(response.user);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-600">
                <p className="font-medium">Error loading profile</p>
                <p className="text-sm mt-2">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">No user data available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Profile Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 font-medium text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
                  {user.email}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">Email</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors mr-2 sm:mr-3"
              >
                Log out
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              {/* Plan Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">
                  Free Plan
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  You have no active subscription
                </p>
              </div>

              {/* Credits Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                <Zap className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                <span className="text-sm font-semibold text-gray-900">200 Credits</span>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
