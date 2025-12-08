/* ============================================
   Generation Feature - Barrel Export
   Exports all AI generation related components
   ============================================ */

// Main Page Components
export { CreatePage } from './components/CreatePage';
export { FlatLayPhotos } from './components/FlatLayPhotos';
export { MannequinPhotos } from './components/MannequinPhotos';
export { OnModelPhotos } from './components/OnModelPhotos';
export { BackgroundChange } from './components/BackgroundChange';

// History
export { GenerationHistory } from './components/GenerationHistory/GenerationHistory';

// Shared Components
export { Steps } from './components/Steps';
export { StepProgressBar } from './components/StepProgressBar';
export { FloatingAskBar } from './components/FloatingAskBar';
export { FloatingPromptInput } from './components/FloatingPromptInput';
export { ImageFeedbackActions } from './components/ImageFeedbackActions';
export { UploadedImagesGrid } from './components/UploadedImagesGrid';
export { UploadHeader } from './components/UploadHeader';

// Background Components
export { BackgroundSelector } from './components/BackgroundSelector';
export { BackgroundChangePreview } from './components/BackgroundChangePreview';
export { BackgroundChangePreviewPanel } from './components/BackgroundChangePreviewPanel';
export { BackgroundChangeUpload } from './components/BackgroundChangeUpload';
export { BackgroundPreviewCard } from './components/BackgroundPreviewCard';

// FlatLay Components
export { FlatLayPreviewPanel } from './components/FlatLayPreviewPanel';
export { FlatLaySelectedItems } from './components/FlatLaySelectedItems';
export { FlatLayActionButton } from './components/FlatLayActionButton';

// Mannequin Components
export { MannequinSelector } from './components/MannequinSelector';

// On-Model Components
export { OnModelUpload } from './components/OnModelUpload';
export { OnModelPreviewPanel } from './components/OnModelPreviewPanel';

// Product Components
export { ProductSelector } from './components/ProductSelector';
export { ProductUpload } from './components/ProductUpload';
export { ProductPreviewCard } from './components/ProductPreviewCard';

// Note: ModelSelector is in @/features/models, import from there if needed
// Note: FlatLayPreview, FlatLayRightPanel, FlatLayStepContent, FlatLaySummary are empty/stub files

