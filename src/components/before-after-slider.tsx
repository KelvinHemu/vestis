"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeAlt?: string;
    afterAlt?: string;
    initialPosition?: number;
    className?: string;
    aspectRatio?: "video" | "square" | "portrait";
}

export const BeforeAfterSlider = ({
    beforeImage,
    afterImage,
    beforeAlt = "Before",
    afterAlt = "After",
    initialPosition = 50,
    className = "",
    aspectRatio = "video",
}: BeforeAfterSliderProps) => {
    const [inset, setInset] = useState<number>(initialPosition);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const rect = e.currentTarget.getBoundingClientRect();
        let x = 0;

        if ("touches" in e && e.touches.length > 0) {
            x = e.touches[0].clientX - rect.left;
        } else if ("clientX" in e) {
            x = e.clientX - rect.left;
        }

        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setInset(percentage);
    };

    const aspectClass = {
        video: "aspect-video",
        square: "aspect-square",
        portrait: "aspect-[3/4]",
    }[aspectRatio];

    return (
        <div
            className={`relative ${aspectClass} w-full h-full overflow-hidden rounded-2xl select-none cursor-ew-resize ${className}`}
            onMouseMove={handleMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchMove={handleMove}
            onTouchEnd={() => setIsDragging(false)}
        >
            {/* Slider Line */}
            <div
                className="h-full w-0.5 absolute z-20 top-0 select-none bg-white/80 shadow-lg"
                style={{
                    left: `${inset}%`,
                    transform: "translateX(-50%)",
                }}
            >
                {/* Slider Handle */}
                <button
                    className="bg-white rounded-full hover:scale-110 transition-all w-10 h-10 select-none -translate-y-1/2 absolute top-1/2 -translate-x-1/2 z-30 cursor-ew-resize flex justify-center items-center shadow-lg border border-gray-200"
                    onTouchStart={(e) => {
                        setIsDragging(true);
                        handleMove(e);
                    }}
                    onMouseDown={(e) => {
                        setIsDragging(true);
                        handleMove(e);
                    }}
                    onTouchEnd={() => setIsDragging(false)}
                    onMouseUp={() => setIsDragging(false)}
                >
                    <GripVertical className="h-5 w-5 select-none text-gray-600" />
                </button>
            </div>

            {/* After Image (Bottom layer - revealed from right) */}
            <Image
                src={afterImage}
                alt={afterAlt}
                width={1920}
                height={1080}
                priority
                className="absolute left-0 top-0 w-full h-full rounded-2xl select-none object-cover"
            />

            {/* Before Image (Top layer - clipped from left) */}
            <Image
                src={beforeImage}
                alt={beforeAlt}
                width={1920}
                height={1080}
                priority
                className="absolute left-0 top-0 z-10 w-full h-full rounded-2xl select-none object-cover"
                style={{
                    clipPath: `inset(0 ${100 - inset}% 0 0)`,
                }}
            />

            {/* Labels */}
            <div className="absolute bottom-4 left-4 z-30 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                Before
            </div>
            <div className="absolute bottom-4 right-4 z-30 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                After
            </div>
        </div>
    );
};
