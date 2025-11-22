interface UploadHeaderProps {
  title: string;
  subtitle?: string;
  onClearAll?: () => void;
  showClearButton?: boolean;
}

export function UploadHeader({ title, onClearAll, showClearButton = false }: UploadHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 relative">
      <h3 className="text-sm font-medium text-gray-700 whitespace-nowrap">Upload Images</h3>
      <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap absolute left-1/2 transform -translate-x-1/2 bg-gray-100 px-4 py-1.5 rounded-full">{title}</h2>
      {showClearButton && onClearAll && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      )}
    </div>
  );
}