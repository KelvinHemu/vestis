import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BecomeModelForm } from './BecomeModelForm';
import { ModelProfileStatus } from './ModelProfileStatus';
import modelRegistrationService from '../services/modelRegistrationService';
import { useState } from 'react';

export function RegisterModel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch model profile with React Query
  const { data: modelProfile, isLoading } = useQuery({
    queryKey: ['modelProfile'],
    queryFn: () => modelRegistrationService.getMyProfile(),
  });

  const handleRegistrationSuccess = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['modelProfile'] });
  };

  const handleRegisterAgain = () => {
    setShowForm(true);
  };

  return (
    <div className="h-screen overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/models')}
              className="border-2 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Models
            </Button>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Become a Model
            </h1>
            <div className="w-[140px]"></div> {/* Spacer for centering */}
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join our professional community of models and showcase your talent to top brands and designers worldwide
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
            </div>
          ) : modelProfile ? (
            <Card className="shadow-xl border-gray-200">
              <CardContent className="p-8">
                <ModelProfileStatus
                  model={modelProfile}
                  onEdit={() => setShowForm(true)}
                  onRegisterAgain={handleRegisterAgain}
                />
              </CardContent>
            </Card>
          ) : showForm || !modelProfile ? (
            <div>
              {showForm && modelProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="mb-4"
                >
                  Cancel
                </Button>
              )}
              <BecomeModelForm onSuccess={handleRegistrationSuccess} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
