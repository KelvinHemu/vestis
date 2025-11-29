import React, { useState, useRef } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';

interface FloatingAskBarProps {
  onFilesSelected: (files: File[]) => void;
  onSubmit: (prompt: string, images: string[]) => Promise<void>;
  isGenerating?: boolean;
  editMode?: boolean;
}

export const FloatingAskBar: React.FC<FloatingAskBarProps> = ({ 
  onFilesSelected, 
  onSubmit,
  isGenerating = false,
  editMode = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onFilesSelected?.(fileArray);
      
      // Convert images to base64 for API
      const base64Images: string[] = [];
      for (const file of fileArray) {
        const base64 = await convertToBase64(file);
        base64Images.push(base64);
      }
      setSelectedImages(prev => [...prev, ...base64Images]);
      
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = () => {
    if (query.trim() && !isGenerating) {
      onSubmit?.(query, selectedImages);
      setQuery('');
      setSelectedImages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className={`
        bg-white rounded-full shadow-lg border-[0.5px] border-gray-200
        transition-all duration-300
        ${isFocused ? 'shadow-xl ring-2 ring-gray-900/10' : ''}
      `}>
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* PaperClip Icon Button */}
          <button 
            onClick={handleFileClick}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Attach files"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 -rotate-45" />
          </button>

          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={editMode ? "Edit your image..." : "Create Anything"}
            disabled={isGenerating}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm sm:text-base disabled:opacity-50"
          />

          {/* Send Button */}
          <button 
            onClick={handleSubmit}
            disabled={!query.trim() || isGenerating}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
