"use client";

/**
 * AddBackgroundPage - Full page for users to add their own custom backgrounds
 *
 * Design Principles:
 * - Split layout for desktop (Image Left, Form Right)
 * - Clean, focused typography following Apple HIG
 * - Framer Motion interactions
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomBackground } from "@/hooks/useCustomBackgrounds";
import { logger } from "@/utils/logger";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { MainContent } from "@/components/layout/MainContent";

// ============================================================================
// Component
// ============================================================================

export function AddBackgroundPage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateCustomBackground();

  // ============================================================================
  // File Handling
  // ============================================================================

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.onerror = () => {
      logger.error("[AddBackgroundPage] FileReader error");
      setError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Drag and drop handlers
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

  // ============================================================================
  // Paste Functionality - Allows pasting images from clipboard
  // ============================================================================

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async () => {
    setError(null);

    // Validate name
    if (!name.trim()) {
      setError("Give your background a name");
      return;
    }

    // Validate image
    if (!imageBase64) {
      setError("Upload an image first");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        image: imageBase64,
      });

      // Navigate back to backgrounds page on success
      router.push("/backgrounds");
    } catch (err) {
      logger.error("[AddBackgroundPage] Failed to create custom background:", {
        data: err,
      });
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add background. Please try again.",
      );
    }
  };

  // Derived state for submit button
  const isSubmitting = createMutation.isPending;
  const canSubmit = name.trim() && imageBase64 && !isSubmitting;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      {/* Mobile Layout - visible on small screens only */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-[100] bg-white dark:bg-[#1A1A1A] flex flex-col">
          {/* Mobile Header */}
          <div className="flex-shrink-0 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              <h1 className="text-base font-bold text-gray-900 dark:text-white">New Background</h1>

              <div className="w-10" />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 flex flex-col px-4 pb-24 pt-6 overflow-y-auto scrollbar-hide">
            {/* Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="relative group w-full max-w-sm sm:max-w-md"
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
                          alt="Background preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setImageBase64(null);
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
                          Upload Background
                        </h3>
                        <p className="text-xs text-gray-500 max-w-[150px]">
                          Tap to upload from library
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP • Max 10MB
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

            {/* Name Input */}
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="background-name-mobile" className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-1">Name</Label>
                <Input
                  id="background-name-mobile"
                  placeholder="e.g. Studio Lights, Beach Scene"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="h-14 text-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl px-4 focus:ring-2 ring-black dark:ring-white ring-offset-2 transition-all shadow-sm"
                />
              </div>

              {/* Privacy Note */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                <p>Custom backgrounds are private to your workspace.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 animate-in slide-in-from-top-2">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Floating Bottom Button */}
          <div className="fixed bottom-4 left-3 right-3 p-0 bg-transparent z-[101]">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-14 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded-2xl shadow-lg shadow-black/20 dark:shadow-white/10 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Background"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - visible on medium+ screens */}
      <div className="hidden md:block h-screen">
        <MainContent showBackButton={false}>
          {/* Content Area with Left and Right Sections */}
          <div className="flex flex-row gap-0 h-full border-2 border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* Left Component - Main Image Area */}
            <div className="flex-1 bg-white dark:bg-[#1A1A1A] border-r-2 border-gray-300 dark:border-gray-700 m-0 overflow-y-auto relative min-h-0">
              {/* Header Bar */}
              <div className="border-b border-gray-300 dark:border-gray-700 px-6 py-3 flex items-center">
                <button
                  onClick={() => router.back()}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Upload Area */}
              <div className="h-full flex flex-col items-center justify-center">
                <div
                  className="relative group w-full max-w-xl"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <motion.div
                    animate={{
                      scale: isDragging ? 1.02 : 1,
                      borderColor: isDragging
                        ? "var(--primary)"
                        : imagePreview
                          ? "transparent"
                          : "",
                    }}
                    className={cn(
                      "relative aspect-[3/4] w-full max-w-md rounded-3xl overflow-hidden cursor-pointer bg-gray-50 dark:bg-gray-800/50 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-all duration-300",
                      !imagePreview &&
                        "border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800",
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
                            alt="Background preview"
                            className="w-full h-full object-cover"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                            <ImagePlus className="w-8 h-8 mb-2" />
                            <span className="font-medium">Change Image</span>
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
                          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                        >
                          <div
                            className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm",
                              isDragging
                                ? "bg-black dark:bg-white text-white dark:text-black scale-110"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 group-hover:bg-gray-300 dark:group-hover:bg-gray-600",
                            )}
                          >
                            <Upload className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {isDragging
                              ? "Drop it here!"
                              : "Upload Background Image"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                            Drag, paste, or click to upload
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG, WEBP • Max 10MB
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
            </div>

            {/* Right Component - Sidebar */}
            <div className="w-80 lg:w-96 bg-white dark:bg-[#1A1A1A] p-6 m-0 overflow-y-auto flex flex-col shrink-0">
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    Background Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add a custom background to use in your generations.
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-3">
                  <Label
                    htmlFor="background-name"
                    className="text-base font-medium"
                  >
                    Name
                  </Label>
                  <Input
                    id="background-name"
                    placeholder="e.g. Studio Lights, Beach Scene"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="h-12 bg-gray-50 dark:bg-gray-800/50"
                  />
                </div>

                {/* Privacy Note */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <p>Custom backgrounds are private to your workspace.</p>
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
                      Uploading...
                    </>
                  ) : (
                    "Add Background"
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

