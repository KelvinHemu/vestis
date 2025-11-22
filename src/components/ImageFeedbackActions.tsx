import { ThumbsUp, ThumbsDown, Redo2 } from 'lucide-react';

interface ImageFeedbackActionsProps {
  onUndo?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  showUndo?: boolean;
}

export function ImageFeedbackActions({
  onUndo,
  onThumbsUp,
  onThumbsDown,
  showUndo = true,
}: ImageFeedbackActionsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-0.5">
      {showUndo && onUndo && (
        <button
          onClick={onUndo}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors transform scale-x-[-1]"
          title="Undo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={onThumbsUp}
        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
        title="Like"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      
      <button
        onClick={onThumbsDown}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        title="Dislike"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
}
