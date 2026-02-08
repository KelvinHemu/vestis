"use client";

interface EditHistoryThumbnailsProps {
  /** Previous generated images from the current editing session */
  history: string[];
  /** The currently displayed generated image */
  currentImage: string;
  /** Called when user clicks a history thumbnail */
  onSelect: (imageUrl: string, index: number) => void;
}

/**
 * Shows small thumbnails of previous edits during a session.
 * Desktop: vertical strip rendered as a separate column to the left.
 * Mobile: horizontal strip rendered below the image.
 *
 * The parent must use this component as a sibling to the image container,
 * NOT inside it.
 */
export function EditHistoryThumbnails({
  history,
  currentImage,
  onSelect,
}: EditHistoryThumbnailsProps) {
  if (history.length === 0) return null;

  // Show history + current image; latest (current) first so it appears on top (desktop) / left (mobile)
  const allImages = [...history, currentImage].reverse();

  const renderThumbnail = (url: string, i: number, size: string) => {
    const isCurrent = i === 0; // After reversing, current image is first
    // Map reversed index back to original index for onSelect
    const originalIndex = allImages.length - 1 - i;
    return (
      <button
        key={`${originalIndex}-${url.slice(-20)}`}
        type="button"
        onClick={() => {
          if (!isCurrent) onSelect(url, originalIndex);
        }}
        className={`
          ${size} rounded-lg overflow-hidden border-2 transition-all shadow-md flex-shrink-0
          ${isCurrent
            ? 'border-white ring-2 ring-white/50 opacity-100 scale-105'
            : 'border-white/40 opacity-70 hover:opacity-100 hover:border-white/80 hover:scale-110 cursor-pointer active:scale-95'
          }
        `}
        title={isCurrent ? 'Current' : `Version ${originalIndex + 1}`}
      >
        <img
          src={url}
          alt={isCurrent ? 'Current version' : `Version ${originalIndex + 1}`}
          className="w-full h-full object-cover pointer-events-none"
        />
      </button>
    );
  };

  return (
    <>
      {/* Desktop — vertical strip, rendered as a column sibling */}
      <div className="hidden md:flex flex-col gap-2 items-center justify-center">
        {allImages.map((url, i) => renderThumbnail(url, i, 'w-14 h-14 lg:w-16 lg:h-16'))}
      </div>

      {/* Mobile — horizontal strip, below image */}
      <div className="flex md:hidden gap-2 justify-center py-3">
        {allImages.map((url, i) => renderThumbnail(url, i, 'w-11 h-11'))}
      </div>
    </>
  );
}
