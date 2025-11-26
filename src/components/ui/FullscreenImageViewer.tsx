import React, { useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface FullscreenImageViewerProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onDownload,
  onShare,
}) => {
  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Close fullscreen"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Action buttons */}
      <div className="absolute top-6 right-6 flex gap-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Download image"
          >
            <Download className="h-6 w-6 text-white" />
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            aria-label="Share image"
          >
            <Share2 className="h-6 w-6 text-white" />
          </button>
        )}
      </div>

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center cursor-pointer"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt="Fullscreen view"
          className="max-w-full max-h-[90vh] object-contain animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

    </div>
  );
};
