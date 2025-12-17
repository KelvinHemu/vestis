"use client";

import * as lucideReact from 'lucide-react';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { ModelRegistrationData } from '@/types/model';

interface MeasurementsAttributesProps {
  formData: Partial<ModelRegistrationData>;
  handleInputChange: (field: keyof ModelRegistrationData, value: any) => void;
  showFemaleFields: boolean;
  errors?: Record<string, string>;
}

const CLOTHING_SIZES = ['S', 'S-M', 'S-L', 'M-L', 'L-XL', 'L-XXL', 'XXL'] as const;

export function MeasurementsAttributes({
  formData,
  handleInputChange,
  showFemaleFields,
  errors = {}
}: MeasurementsAttributesProps) {
  return (
    <div className="space-y-2 lg:space-y-3">
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Measurements & Attributes</h2>
        <p className="text-sm lg:text-base text-gray-500">Help us match you with the perfect opportunities</p>
      </div>

      <div className="space-y-2 lg:space-y-3">
        {/* Physical Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="eye_color" className="text-sm font-medium text-gray-700">Eye Color</FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucideReact.Eye className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="eye_color"
                placeholder="e.g., Brown, Blue, Green"
                value={formData.eye_color || ''}
                onChange={(e) => handleInputChange('eye_color', e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="hair_color" className="text-sm font-medium text-gray-700">Hair Color</FieldLabel>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <lucideReact.Palette className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="hair_color"
                placeholder="e.g., Black, Blonde, Brown"
                value={formData.hair_color || ''}
                onChange={(e) => handleInputChange('hair_color', e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
              />
            </div>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="clothing_size" className="text-sm font-medium text-gray-700">Clothing Size</FieldLabel>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <lucideReact.Shirt className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="clothing_size"
              value={formData.clothing_size || ''}
              onChange={(e) => handleInputChange('clothing_size', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select size</option>
              {CLOTHING_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </Field>

        {/* Body Measurements */}
        <div className="pt-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Body Measurements (cm)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="height_cm" className="text-sm font-medium text-gray-700">Height</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="height_cm"
                  type="number"
                  placeholder="170"
                  value={formData.height_cm || ''}
                  onChange={(e) => handleInputChange('height_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="140"
                  max="250"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="waist_cm" className="text-sm font-medium text-gray-700">Waist</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="waist_cm"
                  type="number"
                  placeholder="70"
                  value={formData.waist_cm || ''}
                  onChange={(e) => handleInputChange('waist_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="50"
                  max="200"
                />
              </div>              {errors.chest_cm && <FieldError className="mt-1">{errors.chest_cm}</FieldError>}            </Field>

            <Field>
              <FieldLabel htmlFor="hips_cm" className="text-sm font-medium text-gray-700">Hips</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="hips_cm"
                  type="number"
                  placeholder="90"
                  value={formData.hips_cm || ''}
                  onChange={(e) => handleInputChange('hips_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="50"
                  max="200"
                />
              </div>
              {errors.hips_cm && <FieldError className="mt-1">{errors.hips_cm}</FieldError>}
            </Field>

            {showFemaleFields && (
              <Field>
                <FieldLabel htmlFor="bust_cm" className="text-sm font-medium text-gray-700">Bust</FieldLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="bust_cm"
                    type="number"
                    placeholder="85"
                    value={formData.bust_cm || ''}
                    onChange={(e) => handleInputChange('bust_cm', e.target.value ? Number(e.target.value) : undefined)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                    min="50"
                    max="200"
                  />
                </div>
              </Field>
            )}

            {!showFemaleFields && (
              <Field>
                <FieldLabel htmlFor="chest_cm" className="text-sm font-medium text-gray-700">Chest</FieldLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="chest_cm"
                    type="number"
                    placeholder="95"
                    value={formData.chest_cm || ''}
                    onChange={(e) => handleInputChange('chest_cm', e.target.value ? Number(e.target.value) : undefined)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                    min="50"
                    max="200"
                  />
                </div>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="shoulder_width_cm" className="text-sm font-medium text-gray-700">Shoulder Width</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="shoulder_width_cm"
                  type="number"
                  placeholder="40"
                  value={formData.shoulder_width_cm || ''}
                  onChange={(e) => handleInputChange('shoulder_width_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="30"
                  max="80"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="inseam_cm" className="text-sm font-medium text-gray-700">Inseam</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="inseam_cm"
                  type="number"
                  placeholder="75"
                  value={formData.inseam_cm || ''}
                  onChange={(e) => handleInputChange('inseam_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="50"
                  max="120"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="neck_cm" className="text-sm font-medium text-gray-700">Neck</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Ruler className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="neck_cm"
                  type="number"
                  placeholder="35"
                  value={formData.neck_cm || ''}
                  onChange={(e) => handleInputChange('neck_cm', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="20"
                  max="60"
                />
              </div>
              {errors.neck_cm && <FieldError className="mt-1">{errors.neck_cm}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="shoe_size_eu" className="text-sm font-medium text-gray-700">Shoe Size (EU)</FieldLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <lucideReact.Footprints className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="shoe_size_eu"
                  type="number"
                  placeholder="40"
                  value={formData.shoe_size_eu || ''}
                  onChange={(e) => handleInputChange('shoe_size_eu', e.target.value ? Number(e.target.value) : undefined)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-lg"
                  min="20"
                  max="60"
                />
              </div>
              {errors.shoe_size_eu && <FieldError className="mt-1">{errors.shoe_size_eu}</FieldError>}
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
