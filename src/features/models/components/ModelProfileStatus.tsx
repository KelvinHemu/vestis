import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelfRegisteredModel, RegistrationStatus } from '@/types/model';

interface ModelProfileStatusProps {
  model: SelfRegisteredModel;
  onEdit?: () => void;
  onRegisterAgain?: () => void;
}

const statusConfig: Record<RegistrationStatus, {
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  title: string;
  description: string;
}> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    title: 'Registration Under Review',
    description: 'Your model profile is being reviewed by our team. We\'ll notify you once it\'s approved.',
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

export function ModelProfileStatus({ model, onEdit, onRegisterAgain }: ModelProfileStatusProps) {
  const config = statusConfig[model.registration_status];
  const Icon = config.icon;

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
                <p className="text-sm text-gray-600">
                  Age: {model.age_range.min}-{model.age_range.max}
                </p>
                {model.height_cm && (
                  <p className="text-sm text-gray-600">Height: {model.height_cm} cm</p>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {model.registration_status === 'rejected' && model.rejection_reason && (
            <div className="bg-white rounded-md p-4 border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-900 mb-1">Feedback:</p>
              <p className="text-sm text-gray-700">{model.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
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
