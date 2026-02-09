
"use client";

/**
 * AddCustomModelPage - Full page for businesses to add their own models
 * 
 * Redesign:
 * - Split layout for desktop (Image Left, Form Right)
 * - Mobile-first scrollable layout for better UX
 * - Clean, focused typography
 * - Framer Motion interactions
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, ImagePlus, Loader2, Check, X, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModelCard } from './ModelCard';
import { Label } from '@/components/ui/label';
import { useCreateCustomModel } from '@/hooks/useCustomModels';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { MainContent } from '@/components/layout/MainContent';
import { detectFaceWithGender } from '@/utils/faceDetection';
import { STORAGE_KEYS } from '@/config/api';

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
  const [isDetectingFace, setIsDetectingFace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateCustomModel();

  // Face Preview State
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [faceBase64, setFaceBase64] = useState<string | null>(null);

  // ============================================================================
  // Load cached data on mount (only name/gender are cached)
  // ============================================================================
  
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.addModelFormCache);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.name) setName(data.name);
        if (data.gender) setGender(data.gender);
      }
    } catch (err) {
      // Silently ignore - cache is not critical
      logger.warn('[AddCustomModelPage] Failed to load cached data');
    }
  }, []);

  // ============================================================================
  // Save to cache whenever form data changes
  // Note: Only cache name/gender, not images (localStorage has ~5MB limit)
  // ============================================================================
  
  useEffect(() => {
    try {
      // Only cache lightweight data - images are too large for localStorage
      const cacheData = {
        name,
        gender,
      };
      localStorage.setItem(STORAGE_KEYS.addModelFormCache, JSON.stringify(cacheData));
    } catch (err) {
      // Silently ignore cache errors - not critical
      logger.warn('[AddCustomModelPage] Failed to cache form data');
    }
  }, [name, gender]);

  // ============================================================================
  // File Handling
  // ============================================================================

  const handleFile = useCallback(async (file: File) => {
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
    reader.onloadend = async () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);

      // Automatically detect face, crop it, and detect gender
      setIsDetectingFace(true);
      try {
        const faceResult = await detectFaceWithGender(result);
        if (faceResult) {
          setFacePreview(faceResult.croppedFace);
          setFaceBase64(faceResult.croppedFace);
          
          // Auto-set gender if confidence is high enough (>70%)
          if (faceResult.genderProbability > 0.7) {
            setGender(faceResult.gender);
          }
        }
      } catch (err) {
        logger.error('[AddCustomModelPage] Face detection failed:', { data: err });
        // Don't show error, face detection is optional
      } finally {
        setIsDetectingFace(false);
      }
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

  const handleFaceFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an valid image file (PNG, JPG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      
      // Apply face detection to manually uploaded image too
      setIsDetectingFace(true);
      try {
        const faceResult = await detectFaceWithGender(result);
        if (faceResult) {
          setFacePreview(faceResult.croppedFace);
          setFaceBase64(faceResult.croppedFace);
          
          // Auto-set gender if confidence is high enough (>70%)
          if (faceResult.genderProbability > 0.7) {
            setGender(faceResult.gender);
          }
        } else {
          // If no face detected, use the original image
          setFacePreview(result);
          setFaceBase64(result);
        }
      } catch (err) {
        logger.error('[AddCustomModelPage] Face detection failed:', { data: err });
        // Fallback to original image
        setFacePreview(result);
        setFaceBase64(result);
      } finally {
        setIsDetectingFace(false);
      }
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
  // Paste Functionality
  // ============================================================================

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFile]);

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
        faceImage: faceBase64 || undefined, // Send face image if available
      });
      
      // Clear cache on success
      localStorage.removeItem(STORAGE_KEYS.addModelFormCache);
      router.push('/models');
    } catch (err) {
      logger.error('[AddCustomModelPage] Failed to create custom model:', { data: err });
      setError(err instanceof Error ? err.message : 'Failed to add model. Please try again.');
    }
  };

  const isSubmitting = createMutation.isPending;
  const canSubmit = name.trim() && imageBase64 && !isSubmitting;

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // ============================================================================
  // Render - Show Mobile or Desktop layout based on screen size
  // ============================================================================
  return (
    <>
      {/* Mobile Layout - visible on small screens */}
      <div className="md:hidden">
        {/* Mobile Layout */}
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#1A1A1A] flex flex-col">
          {/* Mobile Header */}
          <div className="flex-shrink-0 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => {
                    if (currentStep === 2) {
                        setCurrentStep(1);
                    } else {
                        router.back();
                    }
                }}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
              
              <div className="flex flex-col items-center">
                 <h1 className="text-base font-bold text-gray-900 dark:text-white">New Model</h1>
                 <div className="flex gap-1.5 mt-0.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", currentStep === 1 ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-700")} />
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", currentStep === 2 ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-700")} />
                 </div>
              </div>
              
              <div className="w-10" /> 
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 ? (
                <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col px-5 pb-24 pt-6 overflow-y-auto scrollbar-hide"
                >
                    <div className="text-center mb-8">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Photo</h2>
                         <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Choose a clear full-body photo of your model.
                         </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div
                            className="relative group w-full max-w-[280px]"
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
                                "relative aspect-[3/4] w-full mx-auto rounded-3xl overflow-hidden cursor-pointer shadow-2xl shadow-gray-200/50 dark:shadow-black/50 transition-all duration-300",
                                !imagePreview ? 
                                "bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700" :
                                "bg-black dark:bg-gray-900"
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
                                        <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImagePreview(null);
                                            setImageBase64(null);
                                            setFacePreview(null);
                                            setFaceBase64(null);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20"
                                        >
                                        <X className="w-5 h-5" />
                                        </button>
                                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                                            <ImagePlus className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[10px] uppercase tracking-wide font-bold text-white">Tap to change</span>
                                        </div>
                                    </motion.div>
                                    ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-700 shadow-lg mb-4 flex items-center justify-center text-gray-900 dark:text-white">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            Select Photo
                                        </h3>
                                        <p className="text-xs text-gray-500 max-w-[150px]">
                                            Tap to upload from library
                                        </p>
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

                    <div className="mt-8">
                         <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                            <div className="text-black dark:text-white">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                            </div>
                            <p className="text-xs text-black dark:text-white leading-relaxed font-medium">
                                First make sure the face is clearly visible. We'll verify the face in the next step.
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col px-5 pb-24 pt-6 overflow-y-auto scrollbar-hide"
                >
                    <div className="text-center mb-8">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Model Details</h2>
                         <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Verify face detection and add details.
                         </p>
                    </div>

                    <div className="space-y-8">
                        {/* Face Preview - Centered Profile Design */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative group">
                                <motion.div 
                                    onClick={() => faceInputRef.current?.click()}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-800 shadow-xl cursor-pointer bg-white dark:bg-gray-800"
                                >
                                    {facePreview ? (
                                        <img src={facePreview} alt="Face" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                    )}
                                    
                                    {isDetectingFace && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </motion.div>
                                
                                {/* Edit Button Badge */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => faceInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg border-4 border-white dark:border-[#1A1A1A] hover:scale-110 transition-transform"
                                >
                                    <Camera className="w-4 h-4" />
                                </motion.button>

                                <input
                                    ref={faceInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFaceFileChange}
                                    className="hidden"
                                />
                            </div>
                            
                            <div className="mt-4 text-center">
                                 <h3 className="text-sm font-bold text-gray-900 dark:text-white">Profile Photo</h3>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Auto-detected from your photo
                                 </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Name Input */}
                            <div className="space-y-2">
                                 <Label htmlFor="model-name-mobile" className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-1">Model Name</Label>
                                 <Input
                                id="model-name-mobile"
                                placeholder="e.g. Sarah"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isSubmitting}
                                className="h-14 text-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl px-4 focus:ring-2 ring-black dark:ring-white ring-offset-2 transition-all shadow-sm"
                                />
                            </div>

                            {/* Gender Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-1">Gender</Label>
                                <div className="grid grid-cols-2 gap-4">
                                {(['female', 'male'] as const).map((g) => (
                                    <button
                                    key={g}
                                    type="button"
                                    onClick={() => setGender(g)}
                                    className={cn(
                                        "relative flex items-center justify-center py-4 rounded-2xl border transition-all duration-200 font-semibold capitalize text-base",
                                        gender === g
                                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/5 scale-[1.02]"
                                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                    >
                                    {g}
                                    </button>
                                ))}
                                </div>
                            </div>
                        </div>

                       {/* Error Message */}
                       {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 animate-in slide-in-from-top-2">
                                <X className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Bottom Button - Transparent background like flatlay feature */}
          <div className="fixed bottom-4 left-3 right-3 p-0 bg-transparent z-[101]">
            {currentStep === 1 ? (
                 <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!imagePreview}
                    className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-2xl shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                    Next Step
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            ) : (
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-2xl shadow-lg shadow-black/20 dark:shadow-white/10 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <>
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                        Creating Model...
                        </>
                    ) : (
                        "Create Model"
                    )}
                </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop Layout - visible on medium+ screens */}
      <div className="hidden md:block h-screen">
        <MainContent showBackButton={false}>
          <div className="flex flex-row gap-0 h-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* Left Component - Main Image Area */}
            <div className="flex-1 bg-white dark:bg-[#1A1A1A] border-r-2 border-gray-300 dark:border-gray-700 m-0 overflow-y-auto relative min-h-0">
              {/* Header Bar */}
              <div className="border-b-2 border-gray-300 dark:border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => router.back()}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Upload Area */}
              <div className="p-4 h-full flex flex-col items-center justify-center">
                <div
                  className="relative group w-full max-w-md"
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
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                            <ImagePlus className="w-8 h-8 mb-2" />
                            <span className="font-medium">Change Photo</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                              setImageBase64(null);
                              setFacePreview(null);
                              setFaceBase64(null);
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
                          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm",
                            isDragging ? "bg-black dark:bg-white text-white dark:text-black scale-110" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
                          )}>
                            <Upload className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {isDragging ? 'Drop it here!' : 'Upload Model Photo'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[180px]">
                            Drag, paste, or click to upload
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
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
            <div className="w-80 lg:w-96 bg-white dark:bg-[#1A1A1A] p-6 m-0 overflow-y-auto flex flex-col shrink-0">
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Model Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Configure your new model.</p>
                </div>

                {/* Portrait Preview Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Model Profile Photo</Label>
                  {isDetectingFace && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Detecting face...</span>
                    </div>
                  )}
                  <div
                    onClick={() => faceInputRef.current?.click()}
                    className="group relative"
                  >
                    <ModelCard
                      id="preview"
                      name={name || "Model Name"}
                      image={facePreview || ""}
                    />
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
                    Face is auto-detected from the main photo. You can also upload a different photo manually.
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
                  className="w-full h-12 text-base font-medium bg-black text-white hover:bg-black/90"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Model"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </MainContent>
      </div>
    </>
  );
}



