"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as lucideReact from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { StepProgressBar } from '@/features/generation/components/StepProgressBar';
import { modelRegistrationSchema, type ModelRegistrationData, type ModelFormData, calculateAge } from '@/types/model';
import modelRegistrationService from '@/services/modelRegistrationService';
import LocationSelector from '@/components/shared/locationInput';

interface BecomeModelFormProps {
  onSuccess?: () => void;
}

/**
 * Get the maximum date for date of birth (must be 18+)
 */
function getMaxDateOfBirth(): string {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  return today.toISOString().split('T')[0];
}

export function BecomeModelForm({ onSuccess }: BecomeModelFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted');
    console.log('📸 Images count:', images.length);
    console.log('📋 Form data:', formData);

    if (!validateStep(3)) {
      console.log('❌ Step 3 validation failed');
      return;
    }

    setErrors({});

    // Validate with Zod
    const result = modelRegistrationSchema.safeParse(formData);

    if (!result.success) {
      console.log('❌ Zod validation failed:', result.error.issues);
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    console.log('✅ Validation passed, sending to API...');

    // Phase 1: Register model (creates draft)
    let model: any;
    try {
      model = await registerMutation.mutateAsync(result.data);
      console.log('✅ Model registered successfully:', model);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return;
    }

    // Phase 2: Upload images
    if (images.length > 0 && model) {
      console.log(`📤 Uploading ${images.length} images...`);
      for (let i = 0; i < images.length; i++) {
        try {
          const base64 = await convertToBase64(images[i].file);
          await uploadImageMutation.mutateAsync({
            image: base64,
            position: i + 1,
          });
          console.log(`✅ Image ${i + 1} uploaded`);
        } catch (error) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
        }
      }
    }

    // Phase 3: Submit for review (draft → pending_review)
    try {
      await submitForReviewMutation.mutateAsync();
      console.log('🎉 Registration complete and submitted for review!');
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
    <div className="space-y-2 lg:space-y-3">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-sm lg:text-base text-gray-500">Let's start with the essentials</p>
      </div>

      <div className="space-y-2 lg:space-y-3">
        <Field>
          <FieldLabel htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
              required
            />
          </div>
          {errors.name && <FieldError className="mt-1">{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="gender"
              value={formData.gender || 'female'}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.gender && <FieldError className="mt-1">{errors.gender}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">Date of Birth *</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              max={getMaxDateOfBirth()}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
              required
            />
          </div>
          {formData.date_of_birth && (
            <p className="text-sm text-gray-500 mt-1">
              Age: {calculateAge(formData.date_of_birth)} years old
            </p>
          )}
          {errors.date_of_birth && <FieldError className="mt-1">{errors.date_of_birth}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="phone_number"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="instagram_handle" className="text-sm font-medium text-gray-700">Instagram Handle</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Instagram className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="instagram_handle"
              placeholder="@username"
              value={formData.instagram_handle || ''}
              onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
            />
          </div>
        </Field>

        <Field>
          <FieldLabel className="text-sm font-medium text-gray-700">Location *</FieldLabel>
          <div>
            <LocationSelector
              showStateSelector={false}
              onCountryChange={(country) => {
                handleInputChange('country', country?.name || '')
              }}
            />
          </div>
          {errors.country && <FieldError className="mt-1">{errors.country}</FieldError>}
        </Field>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-2 lg:space-y-3">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Upload Your Photos</h2>
        <p className="text-sm lg:text-base text-gray-500">Upload clear, well-lit photos. Mix headshots and full-body shots.</p>
        <p className="text-xs lg:text-sm font-medium text-gray-900">Minimum 2 photos required • Maximum 10 photos</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden group border border-gray-200">
            <img
              src={img.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            >
              <lucideReact.X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < 10 && (
          <label className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
            <lucideReact.Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 font-medium">Add Photo</span>
            <span className="text-xs text-gray-400 mt-1">{images.length}/10</span>
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
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{errors.images}</p>
        </div>
      )}

      {images.length > 0 && images.length < 2 && (
        <p className="text-sm text-amber-600">
          You need {2 - images.length} more photo{2 - images.length > 1 ? 's' : ''} to meet the minimum requirement
        </p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Legal Consent</h2>
        <p className="text-sm lg:text-base text-gray-500">Please confirm the following to proceed with your registration</p>
      </div>

      <div className="space-y-4">
        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.consent_age_confirmation
            ? 'border-green-500 bg-green-50'
            : errors.consent_age_confirmation
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:bg-gray-50'
            }`}
        >
          <input
            type="checkbox"
            checked={formData.consent_age_confirmation || false}
            onChange={(e) => handleInputChange('consent_age_confirmation', e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Age Confirmation *</p>
            <p className="text-sm text-gray-600">I confirm that I am 18 years of age or older</p>
          </div>
          {formData.consent_age_confirmation && (
            <lucideReact.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </label>
        {errors.consent_age_confirmation && (
          <p className="text-sm text-red-600 -mt-2 ml-1">{errors.consent_age_confirmation}</p>
        )}

        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.consent_ai_usage
            ? 'border-green-500 bg-green-50'
            : errors.consent_ai_usage
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:bg-gray-50'
            }`}
        >
          <input
            type="checkbox"
            checked={formData.consent_ai_usage || false}
            onChange={(e) => handleInputChange('consent_ai_usage', e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">AI Usage Consent *</p>
            <p className="text-sm text-gray-600">I consent to my images being used for AI-generated fashion photography</p>
          </div>
          {formData.consent_ai_usage && (
            <lucideReact.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </label>
        {errors.consent_ai_usage && (
          <p className="text-sm text-red-600 -mt-2 ml-1">{errors.consent_ai_usage}</p>
        )}

        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.consent_brand_usage
            ? 'border-green-500 bg-green-50'
            : errors.consent_brand_usage
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:bg-gray-50'
            }`}
        >
          <input
            type="checkbox"
            checked={formData.consent_brand_usage || false}
            onChange={(e) => handleInputChange('consent_brand_usage', e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Brand Usage Consent *</p>
            <p className="text-sm text-gray-600">I consent to my images being used by brands and designers for their products</p>
          </div>
          {formData.consent_brand_usage && (
            <lucideReact.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
        </label>
        {errors.consent_brand_usage && (
          <p className="text-sm text-red-600 -mt-2 ml-1">{errors.consent_brand_usage}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <lucideReact.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">What happens next?</p>
            <p className="text-sm text-blue-700 mt-1">
              After submission, your profile will be reviewed by our team. This usually takes 1-2 business days.
              We'll notify you by email once your profile is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">
      {/* Left Panel - Pure Black with Info */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo and Back Button */}
        <div className="flex items-center justify-between w-full">
          <img
            src="/Vestis.svg"
            alt="Vestis"
            className="h-8 w-auto brightness-0 invert"
          />
          <button
            onClick={() => window.history.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <lucideReact.X className="w-6 h-6" />
          </button>
        </div>


        {/* Main Content */}
        <div className="max-w-md w-full">
          <div className="mb-12">
            <StepProgressBar steps={steps} currentStep={currentStep} theme="dark" />
          </div>
          {currentStep === 1 && (
            <>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Become a Model
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Join our professional community of models and showcase your talent to top brands and designers worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Globe className="w-5 h-5" />
                  </div>
                  <span>Global Exposure</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Camera className="w-5 h-5" />
                  </div>
                  <span>Professional Portfolio</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.User className="w-5 h-5" />
                  </div>
                  <span>Direct Connections</span>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Showcase Your Look
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                High-quality photos are your first impression. Upload clear, professional shots that highlight your versatility.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Image className="w-5 h-5" />
                  </div>
                  <span>High Resolution</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Sun className="w-5 h-5" />
                  </div>
                  <span>Natural Lighting</span>
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                Almost There!
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Review and confirm your consent to complete your registration. Your privacy and rights are important to us.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Shield className="w-5 h-5" />
                  </div>
                  <span>Your Rights Protected</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.Lock className="w-5 h-5" />
                  </div>
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <lucideReact.FileCheck className="w-5 h-5" />
                  </div>
                  <span>Legal Compliance</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          © 2025 Vestis. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col h-full bg-white">
        {/* Header - Mobile Only */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-gray-100">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-black"
          >
            <lucideReact.ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div>
            <img src="/Vestis.svg" alt="Vestis" className="h-6 w-auto" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-xl mx-auto p-3 lg:p-6 w-full flex-1 flex flex-col">
            <Form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-row justify-end items-center gap-4 mt-auto pt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="px-8 py-4 text-base font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-4 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <lucideReact.Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
