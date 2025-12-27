"use client";

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BecomeModelForm } from './BecomeModelForm';
import { ModelProfileStatus } from './ModelProfileStatus';
import modelRegistrationService from '@/services/modelRegistrationService';
import { useState } from 'react';

export function RegisterModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Fetch model profile with React Query
  const { data: modelProfile, isLoading } = useQuery({
    queryKey: ['modelProfile'],
    queryFn: () => modelRegistrationService.getMyProfile(),
  });

  // Submit for review mutation
  const submitForReviewMutation = useMutation({
    mutationFn: () => modelRegistrationService.submitForReview(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelProfile'] });
    },
    onError: (error: Error) => {
      alert(`Failed to submit: ${error.message}`);
    },
  });

  const handleRegistrationSuccess = () => {
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['modelProfile'] });
  };

  const handleRegisterAgain = () => {
    setShowForm(true);
  };

  const handleSubmitForReview = () => {
    submitForReviewMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Simplified Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/models')}
            className="border-2 hover:bg-white/50 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Models
          </Button>

          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Become a Model
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
              Join our professional community of models and showcase your talent to top brands and designers worldwide
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
          </div>
        ) : modelProfile && !showForm ? (
          <div className="max-w-3xl mx-auto">
            <ModelProfileStatus
              model={modelProfile}
              onEdit={() => setShowForm(true)}
              onRegisterAgain={handleRegisterAgain}
              onSubmitForReview={handleSubmitForReview}
              isSubmitting={submitForReviewMutation.isPending}
            />
          </div>
        ) : (
          <BecomeModelForm
            onSuccess={handleRegistrationSuccess}
            onCancel={modelProfile ? () => setShowForm(false) : undefined}
          />
        )}
      </div>
    </div>
  );
}
