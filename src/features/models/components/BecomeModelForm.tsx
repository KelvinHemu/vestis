"use client";

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as lucideReact from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepProgressBar } from '@/features/generation/components/StepProgressBar';
import { modelRegistrationSchema, type ModelRegistrationData } from '@/types/model';
import modelRegistrationService from '@/services/modelRegistrationService';

interface BecomeModelFormProps {
  onSuccess?: () => void;
}

const CLOTHING_SIZES = ['S', 'S-M', 'S-L', 'M-L', 'L-XL', 'L-XXL', 'XXL'] as const;
const AGE_RANGES = [
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45+', label: '45+' }
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
  'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

export function BecomeModelForm({ onSuccess }: BecomeModelFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ModelRegistrationData>>({
    gender: 'female',
    age_min: 18,
    age_max: 24,
  });
  const [selectedAgeRange, setSelectedAgeRange] = useState('18-24');
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: async (data: ModelRegistrationData) => {
      return await modelRegistrationService.register(data);
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: Error) => {
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

  const handleInputChange = (field: keyof ModelRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleAgeRangeChange = (range: string) => {
    setSelectedAgeRange(range);
    const [min, max] = range.split('-');
    if (max === '+') {
      handleInputChange('age_min', parseInt(min));
      handleInputChange('age_max', 120);
    } else {
      handleInputChange('age_min', parseInt(min));
      handleInputChange('age_max', parseInt(max));
    }
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
      if (!selectedAgeRange) stepErrors.age_range = 'Age range is required';
    }

    if (step === 3) {
      if (images.length < 4) {
        stepErrors.images = 'Please upload at least 4 photos';
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

    if (!validateStep(3)) return;

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

    // Register model
    const model = await registerMutation.mutateAsync(result.data);

    // Upload images
    if (images.length > 0 && model) {
      for (let i = 0; i < images.length; i++) {
        try {
          const base64 = await convertToBase64(images[i].file);
          await uploadImageMutation.mutateAsync({
            image: base64,
            position: i + 1,
          });
        } catch (error) {
          console.error('Failed to upload image:', error);
        }
      }
    }
  };

  const showFemaleFields = formData.gender === 'female' || formData.gender === 'non-binary';
  const isSubmitting = registerMutation.isPending || uploadImageMutation.isPending;

  const steps = [
    { num: 1, label: 'Basic Info', icon: lucideReact.User },
    { num: 2, label: 'Measurements', icon: lucideReact.Ruler },
    { num: 3, label: 'Photos', icon: lucideReact.Camera }
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500">Let's start with the essentials</p>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
              required
            />
          </div>
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.User className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="gender"
              value={formData.gender || 'female'}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 h-12 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-Binary</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
        </div>

        <div>
          <Label htmlFor="age_range" className="text-sm font-medium text-gray-700">Age Range *</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="age_range"
              value={selectedAgeRange}
              onChange={(e) => handleAgeRangeChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 h-12 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer"
              required
            >
              {AGE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.age_range && <p className="text-sm text-red-500 mt-1">{errors.age_range}</p>}
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country *</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Globe className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="country"
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 h-12 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer"
              required
            >
              <option value="">Select Country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Measurements & Attributes</h2>
        <p className="text-gray-500">Help us match you with the right opportunities</p>
      </div>

      {/* Contact Info */}
      <div className="space-y-5">
        <h3 className="font-semibold text-sm text-gray-900 uppercase tracking-wider">Contact Information</h3>

        <div>
          <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Phone className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="phone_number"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone_number || ''}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="instagram_handle" className="text-sm font-medium text-gray-700">Instagram Handle</Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Instagram className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="instagram_handle"
              placeholder="@username"
              value={formData.instagram_handle || ''}
              onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Physical Attributes */}
      <div className="space-y-5">
        <h3 className="font-semibold text-sm text-gray-900 uppercase tracking-wider">Physical Attributes</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eye_color" className="text-sm font-medium text-gray-700">Eye Color</Label>
            <Input
              id="eye_color"
              value={formData.eye_color || ''}
              onChange={(e) => handleInputChange('eye_color', e.target.value)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="hair_color" className="text-sm font-medium text-gray-700">Hair Color</Label>
            <Input
              id="hair_color"
              value={formData.hair_color || ''}
              onChange={(e) => handleInputChange('hair_color', e.target.value)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clothing_size" className="text-sm font-medium text-gray-700">Clothing Size</Label>
            <select
              id="clothing_size"
              value={formData.clothing_size || ''}
              onChange={(e) => handleInputChange('clothing_size', e.target.value)}
              className="w-full px-3 py-2.5 h-12 border border-gray-200 rounded-lg bg-gray-50 mt-1.5 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
            >
              <option value="">Select size</option>
              {CLOTHING_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="shoe_size_eu" className="text-sm font-medium text-gray-700">Shoe Size (EU)</Label>
            <Input
              id="shoe_size_eu"
              type="number"
              min="20"
              max="60"
              value={formData.shoe_size_eu || ''}
              onChange={(e) => handleInputChange('shoe_size_eu', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Body Measurements */}
      <div className="space-y-5">
        <h3 className="font-semibold text-sm text-gray-900 uppercase tracking-wider">Body Measurements (cm)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height_cm" className="text-sm font-medium text-gray-700">Height</Label>
            <Input
              id="height_cm"
              type="number"
              min="140"
              max="250"
              value={formData.height_cm || ''}
              onChange={(e) => handleInputChange('height_cm', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
          {showFemaleFields && (
            <div>
              <Label htmlFor="bust_cm" className="text-sm font-medium text-gray-700">Bust</Label>
              <Input
                id="bust_cm"
                type="number"
                min="50"
                max="200"
                value={formData.bust_cm || ''}
                onChange={(e) => handleInputChange('bust_cm', e.target.value ? Number(e.target.value) : undefined)}
                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
              />
            </div>
          )}
          <div>
            <Label htmlFor="waist_cm" className="text-sm font-medium text-gray-700">Waist</Label>
            <Input
              id="waist_cm"
              type="number"
              min="50"
              max="200"
              value={formData.waist_cm || ''}
              onChange={(e) => handleInputChange('waist_cm', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="hips_cm" className="text-sm font-medium text-gray-700">Hips</Label>
            <Input
              id="hips_cm"
              type="number"
              min="50"
              max="200"
              value={formData.hips_cm || ''}
              onChange={(e) => handleInputChange('hips_cm', e.target.value ? Number(e.target.value) : undefined)}
              className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Bio */}
      <div>
        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">About You</Label>
        <textarea
          id="bio"
          maxLength={1000}
          rows={4}
          value={formData.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg mt-1.5 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
          placeholder="Tell us about your modeling experience, interests, or style."
        />
        <p className="text-sm text-gray-500 mt-1">
          {(formData.bio?.length || 0)}/1000 characters
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Photos</h2>
        <p className="text-gray-500 mb-2">Upload clear, well-lit photos. Mix headshots and full-body shots.</p>
        <p className="text-sm font-medium text-gray-900">Minimum 4 photos required • Maximum 10 photos</p>
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

      {images.length > 0 && images.length < 4 && (
        <p className="text-sm text-amber-600">
          You need {4 - images.length} more photo{4 - images.length > 1 ? 's' : ''} to meet the minimum requirement
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-white">
      {/* Left Panel - Pure Black with Info */}
      <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-black text-white flex-col justify-between p-8 lg:p-12">
        {/* Logo */}
        <div>
          <img
            src="/Vestis.svg"
            alt="Vestis"
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        {/* Main Content */}
        <div className="max-w-md">
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
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          © 2025 Vestis. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-black"
          >
            <lucideReact.ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="md:hidden">
            <img src="/Vestis.svg" alt="Vestis" className="h-6 w-auto" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto p-6 lg:p-10">
            <div className="mb-10">
              <StepProgressBar steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handleSubmit}>
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
              <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="px-8 py-6 text-base font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-8 py-6 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-6 text-base font-semibold rounded-xl bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
