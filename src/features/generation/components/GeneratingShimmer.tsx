"use client";

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Shimmer } from '@/components/ai-elements/shimmer';

interface GeneratingShimmerProps {
  /** Array of image URLs to show as blurred preview */
  images: string[];
  /** CSS aspect ratio string e.g. "3/4", "16/9" */
  aspectRatio?: string;
  /** Optional className override for the container */
  className?: string;
  /** The generated image URL — when set, triggers the reveal animation */
  generatedImageUrl?: string | null;
  /** Called when the reveal animation finishes */
  onRevealComplete?: () => void;
}

/**
 * Blurred shimmer placeholder shown while an image is being generated.
 * When `generatedImageUrl` is provided, the real image is revealed with a
 * smooth top-to-bottom blur wipe transition.
 */
export function GeneratingShimmer({
  images,
  aspectRatio = '3/4',
  className,
  generatedImageUrl,
  onRevealComplete,
}: GeneratingShimmerProps) {
  const validImages = useMemo(() => images.filter(Boolean), [images]);

  // Reveal state: 'loading' → 'revealing' → 'done'
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading');
  const [imageLoaded, setImageLoaded] = useState(false);

  // When the generated image URL arrives, preload it
  useEffect(() => {
    if (!generatedImageUrl) {
      setPhase('loading');
      setImageLoaded(false);
      return;
    }

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // fallback — still reveal
    img.src = generatedImageUrl;
  }, [generatedImageUrl]);

  // Once image is loaded, start the reveal
  useEffect(() => {
    if (imageLoaded && generatedImageUrl) {
      // Small delay so the browser paints the hidden image first
      requestAnimationFrame(() => setPhase('revealing'));
    }
  }, [imageLoaded, generatedImageUrl]);

  // When reveal animation ends, notify parent
  const handleRevealEnd = useCallback(() => {
    setPhase('done');
    onRevealComplete?.();
  }, [onRevealComplete]);

  return (
    <>
      {/* ── "Creating image" shimmer label — above the component ── */}
      {phase === 'loading' && (
        <div className="w-full max-w-[92%] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[480px] mx-auto">
          <Shimmer
            className="text-sm sm:text-base font-medium text-gray-400 dark:text-gray-400"
            duration={2}
            spread={2}
          >
            Creating image
          </Shimmer>
        </div>
      )}

      <div
        className={
          className ??
          'relative rounded-2xl sm:rounded-3xl overflow-hidden mx-auto w-full max-w-[92%] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[480px]'
        }
        style={{ aspectRatio }}
      >
      {/* ── Blurred composite background ── */}
      <div className="absolute inset-0">
        {validImages.length > 0 ? (
          <div className="w-full h-full relative">
            {validImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: 1 / validImages.length,
                  filter: 'blur(30px) saturate(1.2)',
                  transform: 'scale(1.1)',
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
        )}
      </div>

      {/* Shimmer sweep overlay */}
      {phase === 'loading' && <div className="absolute inset-0 gs-shimmer-sweep" />}

      {/* Subtle pulse */}
      {phase === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-white/10 dark:bg-black/10" />
      )}

      {/* ── Generated image with top-to-bottom reveal ── */}
      {generatedImageUrl && (
        <div
          className={`absolute inset-0 gs-reveal-mask ${
            phase === 'revealing' ? 'gs-reveal-active' : ''
          } ${phase === 'done' ? 'gs-reveal-done' : ''}`}
          onAnimationEnd={handleRevealEnd}
        >
          <img
            src={generatedImageUrl}
            alt="Generated"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Scoped styles */}
      <style>{`
        @keyframes gsShimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes gsRevealWipe {
          0% {
            clip-path: inset(0 0 100% 0);
            filter: blur(20px);
          }
          40% {
            filter: blur(8px);
          }
          100% {
            clip-path: inset(0 0 0% 0);
            filter: blur(0px);
          }
        }

        .gs-shimmer-sweep {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.15) 40%,
            rgba(255, 255, 255, 0.25) 50%,
            rgba(255, 255, 255, 0.15) 60%,
            transparent 100%
          );
          animation: gsShimmerSweep 2s ease-in-out infinite;
        }

        .gs-reveal-mask {
          clip-path: inset(0 0 100% 0);
          filter: blur(20px);
        }

        .gs-reveal-active {
          animation: gsRevealWipe 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .gs-reveal-done {
          clip-path: inset(0 0 0% 0);
          filter: blur(0px);
          animation: none;
        }
      `}</style>
    </div>
    </>
  );
}
