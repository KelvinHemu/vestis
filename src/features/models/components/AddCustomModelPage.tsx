
"use client";

/**
 * AddCustomModelPage - Full page for businesses to add their own models
 * 
 * Redesign:
 * - Split layout for desktop (Image Left, Form Right)
 * - Clean, focused typography
 * - Framer Motion interactions
 */

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, ImagePlus, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModelCard } from './ModelCard';
import { Label } from '@/components/ui/label';
import { useCreateCustomModel } from '@/hooks/useCustomModels';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { MainContent } from '@/components/layout/MainContent';

// ============================================================================
// Component
// ============================================================================

export function AddCustomModelPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateCustomModel();

  // Face Preview State
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | null>(null);

  // ============================================================================
  // File Handling
  // ============================================================================

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please select an valid image file (PNG, JPG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.onerror = () => {
      logger.error('[AddCustomModelPage] FileReader error');
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFaceFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an valid image file (PNG, JPG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFacePreview(result);
      setFaceBase64(result);
    };
    reader.onerror = () => {
      logger.error('[AddCustomModelPage] Face FileReader error');
      setError('Failed to read face image file');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFaceFile(file);
  };

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Please enter a name for your model');
      return;
    }

    if (!imageBase64) {
      setError('Please upload a photo first');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        gender,
        image: imageBase64,
      });
      router.push('/models');
    } catch (err) {
      logger.error('[AddCustomModelPage] Failed to create custom model:', { data: err });
      setError(err instanceof Error ? err.message : 'Failed to add model. Please try again.');
    }
  };

  const isSubmitting = createMutation.isPending;
  const canSubmit = name.trim() && imageBase64 && !isSubmitting;

  return (
    <MainContent showBackButton={false}>
      {/* Content Area with Left and Right Sections */}
      <div className="flex flex-col md:flex-row gap-0 h-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden">

        {/* Left Component - Main Image Area */}
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] md:border-r-2 border-gray-300 dark:border-gray-700 m-0 overflow-y-auto relative min-h-0 pb-44 md:pb-0">

          {/* Header Bar */}
          <div className="border-b-2 border-gray-300 dark:border-gray-700 p-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <span className="text-gray-400 dark:text-gray-500 mr-2 font-medium">Add Model /</span>
              Upload Photo
            </h1>
            <button
              onClick={() => router.back()}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-8 h-full flex flex-col items-center justify-center">
            <div
              className="relative group w-full max-w-lg"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <motion.div
                animate={{
                  scale: isDragging ? 1.02 : 1,
                  borderColor: isDragging ? 'var(--primary)' : imagePreview ? 'transparent' : ''
                }}
                className={cn(
                  "relative aspect-[3/4] w-full mx-auto rounded-3xl overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-all duration-300",
                  !imagePreview && "border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <AnimatePresence mode="wait">
                  {imagePreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={imagePreview}
                        alt="Model preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                        <ImagePlus className="w-8 h-8 mb-2" />
                        <span className="font-medium">Change Photo</span>
                      </div>

                      {/* Remove Button - Top Right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setImageBase64(null);
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                    >
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-sm",
                        isDragging ? "bg-black dark:bg-white text-white dark:text-black scale-110" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
                      )}>
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {isDragging ? 'Drop it here!' : 'Upload Model Photo'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-[200px]">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-gray-400 mt-2">Max 10MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Component - Sidebar */}
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-80 lg:w-96 bg-white dark:bg-[#1A1A1A] p-6 m-0 md:overflow-y-auto flex flex-col border-t-2 md:border-t-0 border-gray-300 dark:border-gray-700 shrink-0 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none">
          <div className="space-y-6 flex-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Model Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure your new model.</p>
            </div>

            {/* Portrait Preview Upload */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Portrait Face Preview</Label>
              <div
                onClick={() => faceInputRef.current?.click()}
                className="group relative"
              >
                <ModelCard
                  id="preview"
                  name={name || "Model Name"}
                  age="23"
                  size="Standard"
                  image={facePreview || ""}
                />

                {/* Hover Overlay for upload hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 text-black text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    {facePreview ? 'Change Photo' : 'Upload Face'}
                  </div>
                </div>
              </div>
              <input
                ref={faceInputRef}
                type="file"
                accept="image/*"
                onChange={handleFaceFileChange}
                className="hidden"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a clear close-up of the model's face for the card preview.
              </p>
            </div>

            {/* Name Input */}
            <div className="space-y-3">
              <Label htmlFor="model-name" className="text-base font-medium">Name</Label>
              <Input
                id="model-name"
                placeholder="e.g. Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="h-12 bg-gray-50 dark:bg-gray-800/50"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Gender</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['female', 'male'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={cn(
                      "relative flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 font-medium capitalize",
                      gender === g
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <p>Models are private to your workspace.</p>
            </div>


          </div>

          {/* Bottom Actions */}
          <div className="pt-6 space-y-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Model"
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
