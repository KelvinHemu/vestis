import { CheckCircle, Clock, XCircle, FileEdit, Send, CheckCircle2, Calendar, MapPin, User, Ruler } from 'lucide-react';
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
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    title: 'Draft Profile',
    description: 'Your profile is saved as a draft. Upload at least 2 photos and submit for review.',
  },
  pending_review: {
    icon: Clock,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    title: 'Under Review',
    description: 'Your profile has been submitted and is being reviewed by our team. We\'ll notify you once it\'s approved.',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-gray-900 dark:text-white',
    bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    title: 'Profile Approved',
    description: 'Congratulations! Your model profile is active and visible to users.',
  },
  rejected: {
    icon: XCircle,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
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
    <div className={`rounded-lg border p-8 shadow-sm ${config.bg}`}>
      <div className="flex items-start gap-6">
        <div className={`w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2 dark:text-white">{config.title}</h3>
            <p className="text-base text-gray-600 dark:text-gray-400">{config.description}</p>
          </div>

          {/* Profile Preview */}
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start gap-6">
              {model.images && model.images.length > 0 && (
                <img
                  src={model.images[0].url}
                  alt={model.name}
                  className="w-28 h-28 object-cover rounded-lg shadow-sm flex-shrink-0"
                />
              )}
              <div className="flex-1 space-y-3">
                <p className="text-xl font-semibold dark:text-white">{model.name}</p>

                {/* Info Grid */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="capitalize">{model.gender}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{displayAge}</span>
                  </div>
                  {model.country && (
                    <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{model.country}</span>
                    </div>
                  )}
                  {model.height_cm && (
                    <div className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-400">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <span>{model.height_cm} cm</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photo count for draft status */}
            {model.registration_status === 'draft' && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Photos uploaded: <span className={imageCount >= 2 ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                    {imageCount}/2 minimum
                  </span>
                </p>
              </div>
            )}

            {/* Consent status */}
            {(model.consent_age_confirmation || model.consent_ai_usage || model.consent_brand_usage) && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Status:</p>
                <div className="flex flex-wrap gap-3">
                  {model.consent_age_confirmation && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>Age Verified</span>
                    </div>
                  )}
                  {model.consent_ai_usage && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>AI Usage</span>
                    </div>
                  )}
                  {model.consent_brand_usage && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>Brand Usage</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          {model.registration_status === 'rejected' && model.rejection_reason && (
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <p className="text-base font-semibold text-gray-900 mb-2">Feedback:</p>
              <p className="text-base text-gray-700">{model.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap pt-2">
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
                  <p className="text-base text-amber-600 font-medium">
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
