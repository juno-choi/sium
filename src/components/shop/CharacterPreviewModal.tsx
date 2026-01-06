'use client';

import { useState, useEffect } from 'react';
import { X, Eye, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Character } from '@/types/character';

interface CharacterPreviewModalProps {
    character: Character;
    onClose: () => void;
}

const LEVEL_TIERS = [1, 10, 20] as const;

export default function CharacterPreviewModal({ character, onClose }: CharacterPreviewModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<number>(1);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const getImageForLevel = (level: number): string | null => {
        if (!character.level_images) return null;
        return character.level_images[String(level)] || null;
    };

    const currentImage = getImageForLevel(selectedLevel);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`bg-white rounded-[3rem] p-8 md:p-10 max-w-md w-full relative z-10 shadow-2xl transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-black text-slate-900 font-display">캐릭터 미리보기</h2>
                </div>

                {/* Character Image */}
                <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner overflow-hidden relative">
                    {currentImage ? (
                        <Image
                            src={currentImage}
                            alt={`${character.name} Lv.${selectedLevel}`}
                            fill
                            className="object-contain p-8 transition-all duration-500"
                            key={selectedLevel}
                        />
                    ) : (
                        <div className="text-center text-slate-400">
                            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">이미지 없음</p>
                        </div>
                    )}

                    {/* Level Badge */}
                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-lg">
                        Lv. {selectedLevel}
                    </div>
                </div>

                {/* Level Tabs */}
                <div className="flex gap-2 mb-6">
                    {LEVEL_TIERS.map((level) => {
                        const hasImage = !!getImageForLevel(level);
                        return (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(level)}
                                disabled={!hasImage}
                                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${selectedLevel === level
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : hasImage
                                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                    }`}
                            >
                                Lv. {level}
                            </button>
                        );
                    })}
                </div>

                {/* Character Info */}
                <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-900 font-display mb-2">
                        {character.name}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        {character.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
