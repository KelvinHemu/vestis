"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as lucideReact from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StepProgressBar } from '@/features/generation/components/StepProgressBar';
import { modelRegistrationSchema, type ModelRegistrationData, type ModelFormData, calculateAge } from '@/types/model';
import modelRegistrationService from '@/services/modelRegistrationService';
import LocationSelector from '@/components/shared/locationInput';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form'; // Assuming Form is imported from here

interface BecomeModelFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Get the maximum date for date of birth (must be 18+)
 */
function getMaxDateOfBirth(): string {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today.toISOString().split('T')[0];
}

export function BecomeModelForm({ onSuccess, onCancel }: BecomeModelFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ModelFormData>>({
    gender: 'female',
    consent_age_confirmation: false,
    consent_ai_usage: false,
    consent_brand_usage: false,
  });
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: async (data: ModelRegistrationData) => {
      return await modelRegistrationService.register(data);
    },
    onError: (error: Error) => {
      const anyError = error as any;
      const fieldErrors = anyError?.fieldErrors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors({ ...fieldErrors, submit: error.message });
        return;
      }
      setErrors({ submit: error.message });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ image, position }: { image: string; position: number }) => {
      return await modelRegistrationService.uploadImage({
        image,
        position,
        alt_text: `Model photo ${position}`,
      });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async () => {
      return await modelRegistrationService.submitForReview();
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message });
    },
  });

  const handleInputChange = (field: keyof ModelFormData | string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      delete newErrors.submit;
      return newErrors;
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).slice(0, 10 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      delete newErrors.submit;
      return newErrors;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name) stepErrors.name = 'Name is required';
      if (!formData.gender) stepErrors.gender = 'Gender is required';
      if (!formData.country) stepErrors.country = 'Country is required';
      if (!formData.date_of_birth) {
        stepErrors.date_of_birth = 'Date of birth is required';
      } else {
        const age = calculateAge(formData.date_of_birth);
        if (age < 18) {
          stepErrors.date_of_birth = 'You must be 18 years or older';
        }
      }
    }

    if (step === 2) {
      if (images.length < 2) {
        stepErrors.images = 'Please upload at least 2 photos';
        stepErrors.submit = 'Please upload at least 2 photos to continue.';
      }
    }

    if (step === 3) {
      if (!formData.consent_age_confirmation) {
        stepErrors.consent_age_confirmation = 'You must confirm you are 18 or older';
      }
      if (!formData.consent_ai_usage) {
        stepErrors.consent_ai_usage = 'AI usage consent is required';
      }
      if (!formData.consent_brand_usage) {
        stepErrors.consent_brand_usage = 'Brand usage consent is required';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setErrors({});

    // Validate with Zod
    const result = modelRegistrationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Phase 1: Register model (creates draft)
    let model: any;
    try {
      model = await registerMutation.mutateAsync(result.data);
    } catch (error) {
      return;
    }

    // Phase 2: Upload images
    if (images.length > 0 && model) {
      for (let i = 0; i < images.length; i++) {
        try {
          const base64 = await convertToBase64(images[i].file);
          await uploadImageMutation.mutateAsync({
            image: base64,
            position: i + 1,
          });
        } catch (error) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
        }
      }
    }

    // Phase 3: Submit for review (draft → pending_review)
    try {
      await submitForReviewMutation.mutateAsync();
    } catch (error) {
      console.error('❌ Failed to submit for review:', error);
    }
  };

  const isSubmitting = registerMutation.isPending || uploadImageMutation.isPending || submitForReviewMutation.isPending;

  const steps = [
    { num: 1, label: 'Basic Info', icon: lucideReact.User },
    { num: 2, label: 'Photos', icon: lucideReact.Camera },
    { num: 3, label: 'Consent', icon: lucideReact.Shield }
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Basic Information</h2>
        <p className="text-sm text-muted-foreground">Tell us a bit about yourself.</p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <lucideReact.User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="pl-9"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender || 'female'}
            onValueChange={(val) => handleInputChange('gender', val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <div className="relative">
            <lucideReact.Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              max={getMaxDateOfBirth()}
              className="pl-9 block"
            />
          </div>
          {formData.date_of_birth && (
            <p className="text-xs text-muted-foreground">
              Age: {calculateAge(formData.date_of_birth)} years old
            </p>
          )}
          {errors.date_of_birth && <p className="text-xs text-red-500">{errors.date_of_birth}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone_number">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <div className="relative">
            <lucideReact.Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone_number"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="instagram_handle">Instagram Handle <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <div className="relative">
            <lucideReact.Instagram className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="instagram_handle"
              placeholder="@username"
              value={formData.instagram_handle || ''}
              onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Location</Label>
          <LocationSelector
            showStateSelector={false}
            onCountryChange={(country) => {
              handleInputChange('country', country?.name || '')
            }}
          />
          {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Portfolio</h2>
        <p className="text-sm text-muted-foreground">Upload 2-10 high-quality photos. Mix headshots and full-body shots.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="group relative aspect-[3/4] rounded-xl overflow-hidden border bg-muted">
            <img
              src={img.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black"
            >
              <lucideReact.X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {images.length < 10 && (
          <label className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-black/50 hover:bg-muted/50 transition-all">
            <div className="p-4 rounded-full bg-muted mb-3 group-hover:scale-110 transition-transform">
              <lucideReact.Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {errors.images && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
          <lucideReact.AlertCircle className="w-4 h-4" />
          {errors.images}
        </div>
      )}

      {images.length > 0 && images.length < 2 && (
        <p className="text-sm text-yellow-600 flex items-center gap-2">
          <lucideReact.Info className="w-4 h-4" />
          Add {2 - images.length} more photo{2 - images.length > 1 ? 's' : ''} to continue
        </p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Legal Consent</h2>
        <p className="text-sm text-muted-foreground">Please review and agree to the following terms.</p>
      </div>

      <div className="space-y-4">
        {[
          {
            id: 'consent_age_confirmation',
            label: 'Age Confirmation',
            desc: 'I confirm that I am 18 years of age or older',
            checked: formData.consent_age_confirmation
          },
          {
            id: 'consent_ai_usage',
            label: 'AI Usage Consent',
            desc: 'I consent to my images being used for AI-generated fashion photography',
            checked: formData.consent_ai_usage
          },
          {
            id: 'consent_brand_usage',
            label: 'Brand Usage Consent',
            desc: 'I consent to my images being used by brands and designers',
            checked: formData.consent_brand_usage
          }
        ].map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
              item.checked
                ? "border-black/10 bg-black/5"
                : "border-border hover:border-black/20 hover:bg-muted/30",
              errors[item.id] && "border-red-200 bg-red-50"
            )}
          >
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={item.checked || false}
                onChange={(e) => handleInputChange(item.id, e.target.checked)}
                className="peer h-5 w-5 appearance-none rounded-md border border-input shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-black checked:text-primary-foreground checked:border-black"
              />
              <lucideReact.Check className="pointer-events-none absolute left-0 top-0 h-5 w-5 p-0.5 text-white opacity-0 peer-checked:opacity-100" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-medium leading-none">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {Object.keys(errors).some(k => k.startsWith('consent')) && (
        <p className="text-sm text-red-500 text-center">Please accept all terms to proceed.</p>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <lucideReact.Info className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900">What happens next?</p>
          <p className="text-sm text-blue-700">
            After submission, your profile will be reviewed by our team (1-2 business days).
            We'll notify you via email once approved.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/30 via-[#0A0A0A] to-[#0A0A0A]" />

        <div className="relative z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            <lucideReact.ArrowLeft className="w-5 h-5" />
          </Button>
          <img src="/Vestis.svg" alt="Vestis" className="h-6 w-auto brightness-0 invert opacity-90" />
        </div>

        <div className="relative z-10 max-w-lg mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {currentStep === 1 && (
            <>
              <h1 className="text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Become a Model.</h1>
              <p className="text-xl text-neutral-400 leading-relaxed font-light">
                Join an elite community. Connect with top-tier brands and redefine fashion with AI-driven opportunities.
              </p>
            </>
          )}
          {currentStep === 2 && (
            <>
              <h1 className="text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Curate Your Look.</h1>
              <p className="text-xl text-neutral-400 leading-relaxed font-light">
                Your portfolio is your signature. Upload high-fidelity images that capture your unique aesthetic and versatility.
              </p>
            </>
          )}
          {currentStep === 3 && (
            <>
              <h1 className="text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Final Polish.</h1>
              <p className="text-xl text-neutral-400 leading-relaxed font-light">
                Confirm your details and consents. You're one step away from launching your professional AI modeling career.
              </p>
            </>
          )}
        </div>

        <div className="relative z-10">
          <StepProgressBar steps={steps} currentStep={currentStep} theme="dark" />
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-full bg-background relative">
        <div className="lg:hidden p-4 border-b flex items-center justify-between bg-background sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="-ml-2"
            >
              <lucideReact.ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold">Register</span>
          </div>
          <div className="w-[100px]">
            <StepProgressBar steps={steps} currentStep={currentStep} theme="light" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-md mx-auto p-6 md:p-12 h-full flex flex-col">
            <Form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 py-4">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="pt-6 mt-auto flex items-center gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 w-full"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type={currentStep === 3 ? "submit" : "button"}
                  onClick={currentStep < 3 ? handleNext : undefined}
                  disabled={isSubmitting}
                  className="h-12 w-full bg-black hover:bg-black/90 text-white"
                >
                  {isSubmitting ? (
                    <lucideReact.Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {currentStep === 3 ? (isSubmitting ? 'Submitting...' : 'Submit Board') : 'Continue'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

