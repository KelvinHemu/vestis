"use client";

import { type ElementType, type ComponentPropsWithoutRef } from "react";

type ShimmerProps<T extends ElementType = "span"> = {
  as?: T;
  /** Animation duration in seconds (default: 2) */
  duration?: number;
  /** Shimmer spread multiplier (default: 2) */
  spread?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * Renders text with a moving shimmer / shine effect.
 *
 * ```tsx
 * <Shimmer>Creating image</Shimmer>
 * <Shimmer as="h1" className="text-4xl font-bold">Title</Shimmer>
 * ```
 */
export function Shimmer<T extends ElementType = "span">({
  as,
  duration = 2,
  spread = 2,
  className = "",
  style,
  children,
  ...rest
}: ShimmerProps<T>) {
  const Tag = as ?? "span";

  return (
    <Tag
      className={`shimmer-text ${className}`}
      style={
        {
          "--shimmer-duration": `${duration}s`,
          "--shimmer-spread": spread,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      {children}

      <style>{`
        .shimmer-text {
          position: relative;
          display: inline-block;
          background: linear-gradient(
            90deg,
            currentColor 0%,
            currentColor 40%,
            rgba(255, 255, 255, 0.9) 50%,
            currentColor 60%,
            currentColor 100%
          );
          background-size: calc(100% * var(--shimmer-spread, 2)) 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerTextSlide var(--shimmer-duration, 2s) ease-in-out infinite;
        }

        @keyframes shimmerTextSlide {
          0% {
            background-position: 100% center;
          }
          100% {
            background-position: -100% center;
          }
        }
      `}</style>
    </Tag>
  );
}
