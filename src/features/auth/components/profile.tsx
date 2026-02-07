"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Card, CardContent } from '@/components/ui/card';
import { User as UserIcon, Zap, CheckCircle, Clock, XCircle, FileEdit, MapPin, Calendar, Ruler, Moon, Sun, Monitor, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/contexts/authStore';
import userService from '@/services/userService';
import modelRegistrationService from '@/services/modelRegistrationService';
import type { User } from '@/types/user';
import type { SelfRegisteredModel, RegistrationStatus } from '@/types/model';
import { calculateAge } from '@/types/model';
import { useFlatLayStore } from '@/contexts/featureStores';
import AspectRatio from '@/components/shared/aspectRatio';
import Resolution from '@/components/shared/resolution';

// Status configuration for badges
const statusConfig: Record<RegistrationStatus, {
  icon: React.ComponentType<any>;
  label: string;
  className: string;
}> = {
  draft: {
    icon: FileEdit,
    label: 'Draft',
    className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
  pending_review: {
    icon: Clock,
    label: 'Under Review',
    className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  },
};

export function Profile() {
  const { token, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { aspectRatio, resolution, setAspectRatio, setResolution } = useFlatLayStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [modelProfile, setModelProfile] = useState<SelfRegisteredModel | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQualityExpanded, setIsQualityExpanded] = useState(false);

  // Avoid hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
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

        const [userResponse, modelProfileResponse] = await Promise.all([
          userService.getCurrentUser(token),
          modelRegistrationService.getMyProfile().catch(() => null),
        ]);

        setUser(userResponse.user);
        setModelProfile(modelProfileResponse);
      } catch (err: any) {
        if (err?.status !== 401) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
          setError(errorMessage);
          console.error('Failed to fetch user data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const modelImages = modelProfile?.images?.sort((a, b) => a.position - b.position) || [];
  const heroImage = modelImages[selectedImageIndex]?.url;

  const displayAge = modelProfile?.date_of_birth
    ? calculateAge(modelProfile.date_of_birth)
    : modelProfile?.age_range
      ? `${modelProfile.age_range.min}-${modelProfile.age_range.max}`
      : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 dark:border-white border-t-transparent dark:border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="font-medium text-red-600 dark:text-red-400">Error loading profile</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
            <div className="flex justify-center gap-3 mt-4">
              <button onClick={() => router.back()} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg">Go Back</button>
              <button onClick={handleLogout} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg">Log out</button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"><CardContent className="p-6 text-center text-gray-600 dark:text-gray-400">No user data available</CardContent></Card>
      </div>
    );
  }

  const StatusBadge = modelProfile ? (() => {
    const config = statusConfig[modelProfile.registration_status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  })() : null;

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Model Profile - Side by Side Layout */}
        {modelProfile && modelImages.length > 0 && (
          <Card className="mb-4 sm:mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Left: Images */}
                <div className="lg:w-1/3 flex-shrink-0">
                  {/* Main Image */}
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
                    <img
                      src={heroImage}
                      alt={modelProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnails */}
                  {modelImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-1">
                      {modelImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden transition-all ${index === selectedImageIndex
                            ? 'ring-2 ring-gray-900 dark:ring-white ring-offset-1 dark:ring-offset-gray-900'
                            : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                          <img src={image.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: All Details */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{modelProfile.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{modelProfile.gender}</p>
                    </div>
                    {StatusBadge}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {displayAge && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{displayAge} years</span>
                      </div>
                    )}
                    {modelProfile.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{modelProfile.country}</span>
                      </div>
                    )}
                    {modelProfile.height_cm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Ruler className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{modelProfile.height_cm} cm</span>
                      </div>
                    )}
                  </div>

                  {/* Consents */}
                  {(modelProfile.consent_age_confirmation || modelProfile.consent_ai_usage || modelProfile.consent_brand_usage) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {modelProfile.consent_age_confirmation && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                          <CheckCircle className="w-3 h-3 text-green-500" /> Age Verified
                        </span>
                      )}
                      {modelProfile.consent_ai_usage && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                          <CheckCircle className="w-3 h-3 text-green-500" /> AI Usage
                        </span>
                      )}
                      {modelProfile.consent_brand_usage && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                          <CheckCircle className="w-3 h-3 text-green-500" /> Brand Usage
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Message */}
                  {modelProfile.registration_status === 'pending_review' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Your profile is being reviewed. We'll notify you once it's approved.
                    </p>
                  )}
                  {modelProfile.registration_status === 'draft' && (
                    <p className="text-sm text-amber-600 dark:text-amber-500 mb-4">
                      Your profile is saved as a draft. Submit it for review when ready.
                    </p>
                  )}
                  {modelProfile.registration_status === 'rejected' && modelProfile.rejection_reason && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg mb-4">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">Feedback:</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{modelProfile.rejection_reason}</p>
                    </div>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => router.push('/register-model')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Images State */}
        {modelProfile && modelImages.length === 0 && (
          <Card className="mb-4 sm:mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{modelProfile.name}</h3>
                    {StatusBadge}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload photos to complete your model profile</p>
                </div>
                <button
                  onClick={() => router.push('/register-model')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg"
                >
                  Add Photos
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account & Credits Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Card */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Account</p>
                </div>
                <button onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                  Log out
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Credits</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available balance</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <Zap className="w-3.5 h-3.5 fill-gray-900 dark:fill-white text-gray-900 dark:text-white" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{user.credits}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Settings</h3>
          
          {/* Theme Card */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {mounted && theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : mounted && theme === 'light' ? (
                      <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Appearance</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                </div>
                
                {/* Theme Selector */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-md transition-colors ${
                      mounted && theme === 'light' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Light mode"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-md transition-colors ${
                      mounted && theme === 'dark' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Dark mode"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-md transition-colors ${
                      mounted && theme === 'system' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="System preference"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Settings Card - Collapsible */}
          <Card className="mt-3 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardContent className="p-4">
              <button
                onClick={() => setIsQualityExpanded(!isQualityExpanded)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Generation Quality</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isQualityExpanded ? 'Aspect ratio and resolution' : `${aspectRatio} · ${resolution}`}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isQualityExpanded ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-200 ease-in-out ${isQualityExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AspectRatio
                      value={aspectRatio}
                      onValueChange={setAspectRatio}
                    />
                    <Resolution
                      value={resolution}
                      onValueChange={setResolution}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
