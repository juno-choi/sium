'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacter } from '@/lib/hooks/useCharacter';
import { Sparkles, Check, ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const ITEMS_PER_PAGE = 6;

export default function CharacterSelectPage() {
    const { availableCharacters, selectCharacter, loading: hookLoading, character, userCharacters } = useCharacter();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    // Only show specific starter characters (IDs 1, 2, 3)
    const filteredCharacters = availableCharacters.filter(c => [1, 2, 3].includes(c.id));

    // Redirect to dashboard if character already exists
    useEffect(() => {
        if (!hookLoading && character) {
            router.push('/dashboard');
        }
    }, [hookLoading, character, router]);

    const handleSelect = async () => {
        if (!selectedId) return;

        setIsSubmitting(true);
        try {
            await selectCharacter(selectedId);
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    if (hookLoading || character) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">당신의 모험이 시작됩니다</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 font-display">
                    함께 성장할 친구를 선택하세요!
                </h1>
                <p className="text-slate-600 mb-12 max-w-xl mx-auto">
                    선택한 캐릭터는 당신의 대표 캐릭터가 되어,<br />
                    습관을 완료할 때마다 함께 성장하고 진화합니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {filteredCharacters.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((char) => {
                        const isOwned = userCharacters.some(uc => uc.character_id === char.id);
                        return (
                            <button
                                key={char.id}
                                onClick={() => setSelectedId(char.id)}
                                className={`relative group bg-white p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:shadow-xl ${selectedId === char.id
                                    ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg scale-105'
                                    : 'border-slate-100 hover:border-indigo-200'
                                    }`}
                            >
                                {selectedId === char.id && (
                                    <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1 rounded-full">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}

                                {isOwned && (
                                    <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                        보유 중
                                    </div>
                                )}

                                <div className="text-8xl mb-6 text-center transform group-hover:scale-110 transition-transform">
                                    <Image src={`${char.base_image_url}`} alt={`${char.name}`} width={100} height={100} />
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">{char.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {char.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Paging */}
                {filteredCharacters.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-slate-600">
                            {currentPage} / {Math.ceil(filteredCharacters.length / ITEMS_PER_PAGE)}
                        </span>
                        <button
                            disabled={currentPage === Math.ceil(filteredCharacters.length / ITEMS_PER_PAGE)}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <button
                    onClick={handleSelect}
                    disabled={!selectedId || isSubmitting}
                    className={`inline-flex items-center px-12 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg ${selectedId && !isSubmitting
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 -translate-y-1'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    ) : (
                        <>
                            {userCharacters.some(uc => uc.character_id === selectedId) ? '이 친구와 계속하기' : '이 친구와 시작하기'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
