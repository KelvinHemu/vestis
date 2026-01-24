"use client";

import { useRouter } from 'next/navigation';
import { Plus, Image as ImageIcon, Trash2, Palette } from 'lucide-react';
import { useCustomBackgroundsList, useDeleteCustomBackground } from '@/hooks/useCustomBackgrounds';
import { useSystemBackgroundsList } from '@/hooks/useSystemBackgrounds';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { BackgroundCategory } from '@/types/background';

// ============================================================================
// BackgroundCard - Reusable card for displaying backgrounds
// ============================================================================

interface BackgroundCardProps {
    id: string;
    name: string;
    image: string;
    onDelete?: (e: React.MouseEvent) => void;
    isDeleting?: boolean;
    showDelete?: boolean;
}

function BackgroundCard({ id, name, image, onDelete, isDeleting, showDelete }: BackgroundCardProps) {
    return (
        <div className="relative group rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="aspect-[4/3] relative">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {name}
                </h3>
            </div>

            {/* Delete button overlay */}
            {showDelete && onDelete && (
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    title="Delete background"
                >
                    {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            )}
        </div>
    );
}

// ============================================================================
// Category Tabs Configuration
// ============================================================================

const categories: Array<{ id: BackgroundCategory; label: string }> = [
    { id: 'Indoor', label: 'Indoor' },
    { id: 'Outdoor', label: 'Outdoor' },
    { id: 'studio', label: 'Studio' },
];

// ============================================================================
// BackgroundsPage - Shows all available backgrounds in a grid
// ============================================================================

export function BackgroundsPage() {
    const router = useRouter();

    // ============================================================================
    // Category Filter State
    // ============================================================================
    const [activeCategory, setActiveCategory] = useState<BackgroundCategory>('Indoor');

    // ============================================================================
    // Data Fetching
    // ============================================================================

    // Fetch custom backgrounds (My Backgrounds)
    const { data: customBackgrounds, isLoading: isLoadingCustom } = useCustomBackgroundsList();
    const deleteCustomBackground = useDeleteCustomBackground();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Fetch system backgrounds
    const { data: systemBackgrounds, isLoading: isLoadingSystem, error: systemError } = useSystemBackgroundsList();

    // Filter system backgrounds by category
    const filteredSystemBackgrounds = systemBackgrounds?.filter(
        bg => bg.category === activeCategory
    ) || [];

    // ============================================================================
    // Handle Custom Background Delete
    // ============================================================================
    const handleDeleteCustomBackground = async (backgroundId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (deletingId) return; // Prevent multiple deletes

        if (window.confirm('Are you sure you want to delete this background?')) {
            setDeletingId(backgroundId);
            try {
                await deleteCustomBackground.mutateAsync(backgroundId);
            } finally {
                setDeletingId(null);
            }
        }
    };

    // ============================================================================
    // Render Component
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Backgrounds
                    </h1>

                    <Button
                        onClick={() => router.push('/add-background')}
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Background
                    </Button>
                </div>

                {/* ================================================================== */}
                {/* My Backgrounds Section - User's Custom Backgrounds */}
                {/* ================================================================== */}
                {customBackgrounds && customBackgrounds.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Backgrounds</h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({customBackgrounds.length})
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                            {customBackgrounds.map((background) => (
                                <BackgroundCard
                                    key={`custom-${background.id}`}
                                    id={`custom-${background.id}`}
                                    name={background.name}
                                    image={background.url}
                                    showDelete={true}
                                    isDeleting={deletingId === background.id}
                                    onDelete={(e) => handleDeleteCustomBackground(background.id, e)}
                                />
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="mt-8 mb-6 border-t border-gray-200 dark:border-gray-700" />
                    </div>
                )}

                {/* Loading Custom Backgrounds */}
                {isLoadingCustom && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-400">My Backgrounds</h2>
                        </div>
                        <div className="flex gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="w-48 h-36 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                )}

                {/* ================================================================== */}
                {/* System Backgrounds Section */}
                {/* ================================================================== */}
                <div>
                    {/* Section Header with Category Tabs */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Vestis Backgrounds
                            </h2>
                       
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                                        activeCategory === category.id
                                            ? 'bg-black dark:bg-white text-white dark:text-black'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoadingSystem && (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading backgrounds...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {systemError && !isLoadingSystem && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-2xl mx-auto">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-base font-medium text-red-800 dark:text-red-200">Failed to load backgrounds</h3>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{systemError instanceof Error ? systemError.message : 'Unknown error'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Background Grid - Filtered by Category */}
                    {!isLoadingSystem && !systemError && filteredSystemBackgrounds && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
                            {filteredSystemBackgrounds.map((background) => (
                                <BackgroundCard
                                    key={background.id}
                                    id={background.id.toString()}
                                    name={background.name}
                                    image={background.url}
                                    showDelete={false}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty State for Current Category */}
                    {!isLoadingSystem && !systemError && filteredSystemBackgrounds && filteredSystemBackgrounds.length === 0 && (
                        <div className="text-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <Palette className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                                    No {activeCategory.toLowerCase()} backgrounds available.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
