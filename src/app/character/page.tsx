'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import { Loader2, ChevronRight, Check, Users as UsersIcon, ChevronLeft, Sparkles, Eye } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { getLevelImage } from '@/lib/utils/getLevelImage';
import Link from 'next/link';
import CharacterPreviewModal from '@/components/shop/CharacterPreviewModal';
import { Character } from '@/types/character';

const ITEMS_PER_PAGE = 8;

export default function CharacterPage() {
    const { character, userCharacters, switchCharacter, loading: charLoading } = useCharacter();
    const [charPage, setCharPage] = useState(1);
    const [previewChar, setPreviewChar] = useState<Character | null>(null);

    if (charLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!character) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <div className="relative mb-8">
                    <div className="w-32 h-32 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center rotate-3 animate-[float_3s_ease-in-out_infinite]">
                        <UsersIcon className="w-16 h-16 text-indigo-600 -rotate-3" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center animate-pulse">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-3 font-display">동료를 기다리고 있어요!</h1>
                <p className="text-slate-500 mb-10 font-medium leading-relaxed max-w-sm">
                    아직 함께할 동료가 없네요.<br />
                    <span className="text-indigo-600 font-bold">모험하기</span>를 눌러 첫 번째 캐릭터를 선택해주세요!
                </p>

                <Link
                    href="/character-select"
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 hover:-translate-y-1 transition-all"
                >
                    <span>첫 캐릭터 선택하기</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }

    // Get current level image
    const currentImage = getLevelImage(character.current_level, character.character?.level_images);
    const imageSrc = currentImage ? `${currentImage}` : null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {previewChar && (
                    <CharacterPreviewModal
                        character={previewChar}
                        onClose={() => setPreviewChar(null)}
                    />
                )}
                <div className="space-y-10">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <UsersIcon className="w-8 h-8 text-indigo-600" />
                                <h1 className="text-4xl font-black text-slate-900 font-display">나의 동료들</h1>
                            </div>
                            <p className="text-slate-500 font-medium">지금까지 수집한 모든 동료들을 한눈에 확인하고 교체할 수 있습니다.</p>
                        </div>

                        <div className="bg-white px-8 py-4 rounded-[2rem] border-2 border-slate-100 flex items-center gap-4 shadow-xl shadow-slate-200/20">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Collection</span>
                                <span className="text-2xl font-black text-indigo-600 font-display">{userCharacters.length} 명</span>
                            </div>
                        </div>
                    </div>

                    {/* Companion Grid Section */}
                    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-indigo-100/10 min-h-[600px] flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start">
                            {userCharacters.slice((charPage - 1) * ITEMS_PER_PAGE, charPage * ITEMS_PER_PAGE).map((uc) => {
                                const isActive = uc.id === character.id;
                                const ucImage = getLevelImage(uc.current_level, uc.character?.level_images);
                                const ucImgSrc = ucImage ? `${ucImage}` : null;

                                return (
                                    <div
                                        key={uc.id}
                                        className={`group relative p-10 rounded-[3rem] border-4 transition-all flex flex-col items-center justify-center gap-8 aspect-[3/4] w-full ${isActive
                                            ? 'border-indigo-500 bg-indigo-50/50 shadow-2xl shadow-indigo-100/50 lg:scale-105 z-10'
                                            : 'border-slate-50 hover:border-indigo-200 hover:bg-slate-50/50 hover:-translate-y-2'
                                            }`}
                                    >
                                        <div className={`w-full aspect-square rounded-[2.5rem] flex items-center justify-center text-7xl shadow-inner overflow-hidden transition-transform duration-500 ${isActive ? 'bg-white' : 'bg-slate-50 group-hover:scale-110'}`}>
                                            {ucImgSrc ? (
                                                <Image
                                                    src={ucImgSrc}
                                                    alt={uc.character?.name || 'Character'}
                                                    width={256}
                                                    height={256}
                                                    className="w-full h-full object-contain p-0"
                                                />
                                            ) : (
                                                uc.character?.base_image_url
                                            )}
                                        </div>

                                        <div className="text-center w-full">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full mb-3 shadow-sm">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">LV. {uc.current_level}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-slate-800 font-display">{uc.character?.name}</h4>
                                        </div>

                                        {/* Action Overlay */}
                                        <div className="absolute inset-x-4 bottom-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <button
                                                onClick={() => uc.character && setPreviewChar(uc.character)}
                                                className="flex-1 bg-white/90 backdrop-blur-sm text-slate-700 py-3 rounded-[1.5rem] font-bold text-sm shadow-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                미리보기
                                            </button>
                                            {!isActive && (
                                                <button
                                                    onClick={() => switchCharacter(uc.id)}
                                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-[1.5rem] font-bold text-sm shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    선택하기
                                                </button>
                                            )}
                                        </div>

                                        {isActive && (
                                            <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-bounce-slow">
                                                <Check className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paging */}
                        {userCharacters.length > ITEMS_PER_PAGE && (
                            <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-slate-100">
                                <button
                                    disabled={charPage === 1}
                                    onClick={() => setCharPage(prev => prev - 1)}
                                    className="p-3 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-100"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <span className="text-lg font-black text-slate-600 font-display">
                                    {charPage} <span className="text-slate-300 mx-1">/</span> {Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}
                                </span>
                                <button
                                    disabled={charPage === Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}
                                    onClick={() => setCharPage(prev => prev + 1)}
                                    className="p-3 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-100"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
