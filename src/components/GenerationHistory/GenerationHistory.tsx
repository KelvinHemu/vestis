import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generationService } from '../../services/generationService';
import type { Generation } from '../../types/generation';
import { Loader2, Trash2, Image as ImageIcon, Download, Share2 } from 'lucide-react';

export const GenerationHistory: React.FC = () => {
    const navigate = useNavigate();
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [_currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const loadGenerations = useCallback(async (pageNum: number, append: boolean = false) => {
        if (loading) return;
        
        setLoading(true);
        setError(null);
        try {
            const data = await generationService.list(pageNum, 20);
            const newGenerations = data.generations || [];
            
            if (append) {
                setGenerations(prev => [...prev, ...newGenerations]);
            } else {
                setGenerations(newGenerations);
            }
            
            if (data.metadata) {
                const totalPages = Math.ceil(data.metadata.total_records / data.metadata.page_size);
                setHasMore(pageNum < totalPages);
            } else {
                setHasMore(newGenerations.length === 20);
            }
        } catch (err) {
            console.error('Failed to load generations:', err);
            setError('Failed to load generation history. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        loadGenerations(1, false);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setCurrentPage(prev => {
                        const nextPage = prev + 1;
                        loadGenerations(nextPage, true);
                        return nextPage;
                    });
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadGenerations]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this generation?')) return;

        try {
            await generationService.delete(id);
            // Remove from the list
            setGenerations(prev => prev.filter(gen => gen.id !== id));
        } catch (err) {
            console.error('Failed to delete generation:', err);
            alert('Failed to delete generation');
        }
    };

    const handleDownload = async (imageUrl: string, id: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `generation-${id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download image:', err);
            alert('Failed to download image');
        }
    };

    const handleShare = async (imageUrl: string, id: number) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Generation ${id}`,
                    text: 'Check out this generated image!',
                    url: imageUrl
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Failed to share:', err);
                }
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(imageUrl);
                alert('Image URL copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                alert('Failed to share image');
            }
        }
    };

    const handleImageClick = (imageUrl: string) => {
        // Store the image URL in sessionStorage to be picked up by CreatePage
        sessionStorage.setItem('editImage', imageUrl);
        navigate('/create');
    };

    return (
        <div className="h-screen overflow-y-auto p-6 max-w-7xl mx-auto scrollbar-hide">
    
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {loading && generations.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
            ) : generations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No generations yet</h3>
                    <p className="text-gray-500 mt-2">Start creating images to see them here.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {generations.map((gen) => (
                            <div key={gen.id} className="aspect-[3/4] relative bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                                <img
                                    src={gen.image_url}
                                    alt={`Generation ${gen.id}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onClick={() => handleImageClick(gen.image_url)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" onClick={() => handleImageClick(gen.image_url)} />
                                
                                <button
                                    onClick={() => handleDelete(gen.id)}
                                    className="absolute top-2 right-2 p-2 bg-transparent rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/80 text-white hover:text-red-600"
                                    title="Delete generation"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => handleDownload(gen.image_url, gen.id)}
                                    className="absolute bottom-3 left-2 p-2 bg-transparent rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/80 text-white hover:text-blue-600"
                                    title="Download image"
                                >
                                    <Download className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => handleShare(gen.image_url, gen.id)}
                                    className="absolute bottom-3 right-2 p-2 bg-transparent rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/80 text-white hover:text-green-600"
                                    title="Share image"
                                >
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Infinite scroll trigger */}
                    <div ref={observerTarget} className="flex justify-center items-center py-8">
                        {loading && (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
