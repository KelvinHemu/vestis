import { CheckCircle, Clock, XCircle, FileEdit, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelfRegisteredModel, RegistrationStatus } from '@/types/model';
import { calculateAge } from '@/types/model';

interface ModelProfileStatusProps {
  model: SelfRegisteredModel;
  onEdit?: () => void;
  onRegisterAgain?: () => void;
  onSubmitForReview?: () => void;
  isSubmitting?: boolean;
}

const statusConfig: Record<RegistrationStatus, {
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  title: string;
  description: string;
}> = {
  draft: {
    icon: FileEdit,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'Draft Profile',
    description: 'Your profile is saved as a draft. Upload at least 2 photos and submit for review.',
  },
  pending_review: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    title: 'Under Review',
    description: 'Your profile has been submitted and is being reviewed by our team. We\'ll notify you once it\'s approved.',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    title: 'Profile Approved ✓',
    description: 'Congratulations! Your model profile is active and visible to users.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    title: 'Profile Rejected',
    description: 'Unfortunately, your profile was not approved. Please review the feedback and register again.',
  },
};

export function ModelProfileStatus({
  model,
  onEdit,
  onRegisterAgain,
  onSubmitForReview,
  isSubmitting = false
}: ModelProfileStatusProps) {
  const config = statusConfig[model.registration_status];
  const Icon = config.icon;
  const imageCount = model.images?.length || 0;
  const canSubmitForReview = imageCount >= 2;

  // Calculate age from date of birth if available
  const displayAge = model.date_of_birth
    ? `${calculateAge(model.date_of_birth)} years old`
    : model.age_range
      ? `${model.age_range.min}-${model.age_range.max}`
      : 'Age not specified';

  return (
    <div className={`rounded-lg border p-6 ${config.bg}`}>
      <div className="flex items-start gap-4">
        <Icon className={`w-8 h-8 ${config.color} flex-shrink-0 mt-1`} />

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>

          {/* Profile Preview */}
          <div className="bg-white rounded-md p-4 space-y-2">
            <div className="flex items-start gap-4">
              {model.images && model.images.length > 0 && (
                <img
                  src={model.images[0].url}
                  alt={model.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{model.name}</p>
                <p className="text-sm text-gray-600 capitalize">{model.gender}</p>
                <p className="text-sm text-gray-600">Age: {displayAge}</p>
                {model.country && (
                  <p className="text-sm text-gray-600">{model.country}</p>
                )}
                {model.height_cm && (
                  <p className="text-sm text-gray-600">Height: {model.height_cm} cm</p>
                )}
              </div>
            </div>

            {/* Photo count for draft status */}
            {model.registration_status === 'draft' && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Photos uploaded: <span className={imageCount >= 2 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                    {imageCount}/2 minimum
                  </span>
                </p>
              </div>
            )}

            {/* Consent status */}
            {(model.consent_age_confirmation || model.consent_ai_usage || model.consent_brand_usage) && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Consents:
                  {model.consent_age_confirmation && ' ✓ Age'}
                  {model.consent_ai_usage && ' ✓ AI Usage'}
                  {model.consent_brand_usage && ' ✓ Brand Usage'}
                </p>
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          {model.registration_status === 'rejected' && model.rejection_reason && (
            <div className="bg-white rounded-md p-4 border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-900 mb-1">Feedback:</p>
              <p className="text-sm text-gray-700">{model.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {model.registration_status === 'draft' && (
              <>
                {canSubmitForReview ? (
                  <Button
                    onClick={onSubmitForReview}
                    size="sm"
                    disabled={isSubmitting}
                    className="bg-black hover:bg-gray-800"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                ) : (
                  <p className="text-sm text-amber-600">
                    Upload {2 - imageCount} more photo{2 - imageCount > 1 ? 's' : ''} to submit for review
                  </p>
                )}
                {onEdit && (
                  <Button onClick={onEdit} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                )}
              </>
            )}
            {model.registration_status === 'approved' && onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm">
                Edit Profile
              </Button>
            )}
            {model.registration_status === 'rejected' && onRegisterAgain && (
              <Button onClick={onRegisterAgain} size="sm">
                Register Again
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.title}
    </span>
  );
}
