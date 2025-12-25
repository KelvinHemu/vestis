import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Calendar, Shield, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import modelRegistrationService from '@/services/modelRegistrationService';
import { RegistrationStatusBadge } from '@/features/models/components/ModelProfileStatus';
import { calculateAge } from '@/types/model';

export function PendingModels() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: models, isLoading } = useQuery({
    queryKey: ['pendingModels'],
    queryFn: () => modelRegistrationService.getPendingModels(),
  });

  const approveMutation = useMutation({
    mutationFn: (modelId: number) => modelRegistrationService.approveModel(modelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingModels'] });
      alert('Model approved successfully!');
    },
    onError: (error: Error) => {
      alert(`Failed to approve: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ modelId, reason }: { modelId: number; reason: string }) =>
      modelRegistrationService.rejectModel(modelId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingModels'] });
      setRejectingId(null);
      setRejectionReason('');
      alert('Model rejected. Email sent to applicant.');
    },
    onError: (error: Error) => {
      alert(`Failed to reject: ${error.message}`);
    },
  });

  const handleApprove = (modelId: number) => {
    if (confirm('Are you sure you want to approve this model?')) {
      approveMutation.mutate(modelId);
    }
  };

  const handleReject = (modelId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    if (rejectionReason.length > 500) {
      alert('Rejection reason must be 500 characters or less');
      return;
    }
    rejectMutation.mutate({ modelId, reason: rejectionReason });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Pending Model Registrations</h1>
        <p className="text-gray-600">
          Review and approve or reject model applications ({models?.length || 0} pending)
        </p>
      </div>

      {!models || models.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No pending model registrations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {models.map((model) => {
            // Calculate display age
            const displayAge = model.date_of_birth
              ? `${calculateAge(model.date_of_birth)} years old (DOB: ${new Date(model.date_of_birth).toLocaleDateString()})`
              : `Age ${model.age_range.min}-${model.age_range.max}`;

            return (
              <Card key={model.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Images */}
                    <div className="lg:w-1/3">
                      {model.images && model.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {model.images.slice(0, 4).map((img) => (
                            <img
                              key={img.id}
                              src={img.url}
                              alt={img.alt_text}
                              className="w-full aspect-[3/4] object-cover rounded-md"
                            />
                          ))}
                          {model.images.length > 4 && (
                            <div className="w-full aspect-[3/4] bg-gray-100 rounded-md flex items-center justify-center">
                              <p className="text-sm text-gray-500">+{model.images.length - 4} more</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] bg-gray-100 rounded-md flex items-center justify-center">
                          <p className="text-sm text-gray-500">No images</p>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{model.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {model.gender} • {displayAge}
                            </p>
                          </div>
                          <RegistrationStatusBadge status={model.registration_status} />
                        </div>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(model.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Consent Status */}
                      <div className="bg-gray-50 rounded-md p-4">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Consent Status
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div className={`flex items-center gap-2 ${model.consent_age_confirmation ? 'text-green-600' : 'text-gray-400'}`}>
                            {model.consent_age_confirmation ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Age Verification
                          </div>
                          <div className={`flex items-center gap-2 ${model.consent_ai_usage ? 'text-green-600' : 'text-gray-400'}`}>
                            {model.consent_ai_usage ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            AI Usage
                          </div>
                          <div className={`flex items-center gap-2 ${model.consent_brand_usage ? 'text-green-600' : 'text-gray-400'}`}>
                            {model.consent_brand_usage ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Brand Usage
                          </div>
                        </div>
                        {model.consent_timestamp && (
                          <p className="text-xs text-gray-500 mt-2">
                            Consented on: {new Date(model.consent_timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Measurements */}
                      {(model.height_cm || model.waist_cm || model.hips_cm) && (
                        <div className="bg-gray-50 rounded-md p-4">
                          <h4 className="text-sm font-semibold mb-2">Measurements</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                            {model.height_cm && <div>Height: {model.height_cm} cm</div>}
                            {model.waist_cm && <div>Waist: {model.waist_cm} cm</div>}
                            {model.hips_cm && <div>Hips: {model.hips_cm} cm</div>}
                            {model.bust_cm && <div>Bust: {model.bust_cm} cm</div>}
                            {model.chest_cm && <div>Chest: {model.chest_cm} cm</div>}
                            {model.shoe_size_eu && <div>Shoe: EU {model.shoe_size_eu}</div>}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {(model.phone_number || model.instagram_handle || model.country) && (
                        <div className="bg-gray-50 rounded-md p-4">
                          <h4 className="text-sm font-semibold mb-2">Contact Info</h4>
                          <div className="space-y-1 text-sm">
                            {model.phone_number && <div>Phone: {model.phone_number}</div>}
                            {model.instagram_handle && <div>Instagram: {model.instagram_handle}</div>}
                            {model.country && <div>Country: {model.country}</div>}
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {model.bio && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Bio</h4>
                          <p className="text-sm text-gray-700">{model.bio}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        {rejectingId === model.id ? (
                          <div className="w-full space-y-3">
                            <div>
                              <Label htmlFor={`reason-${model.id}`}>Rejection Reason *</Label>
                              <textarea
                                id={`reason-${model.id}`}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                maxLength={500}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Be specific about what needs improvement..."
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                {rejectionReason.length}/500 characters
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReject(model.id)}
                                disabled={rejectMutation.isPending}
                                variant="destructive"
                              >
                                {rejectMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  'Confirm Rejection'
                                )}
                              </Button>
                              <Button
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectionReason('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleApprove(model.id)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {approveMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => setRejectingId(model.id)}
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
