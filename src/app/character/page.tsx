'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import { Loader2, ChevronRight, Check, Users as UsersIcon, ChevronLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { getLevelImage } from '@/lib/utils/getLevelImage';
import Link from 'next/link';

const ITEMS_PER_PAGE = 6;

export default function CharacterPage() {
    const { character, userCharacters, switchCharacter, loading: charLoading } = useCharacter();
    const [charPage, setCharPage] = useState(1);

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
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Side: Character Preview */}
                    <div className="lg:w-2/5">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-indigo-100/30 overflow-hidden relative group">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -z-0 group-hover:w-40 group-hover:h-40 transition-all duration-700" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h1 className="text-3xl font-black text-slate-900 font-display mb-1">캐릭터 설정</h1>
                                            <p className="text-slate-500 font-medium">{character.character?.name} 정보</p>
                                        </div>
                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                            {character.current_level}
                                        </div>
                                    </div>

                                    {/* Visual Preview Area */}
                                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[2.5rem] flex items-center justify-center shadow-inner mb-8 relative overflow-hidden">
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={character.character?.name || 'Character'}
                                                fill
                                                className="object-contain p-4"
                                            />
                                        ) : (
                                            <span className="text-[8rem]">{character.character?.base_image_url}</span>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="w-full h-px bg-slate-100" />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Level</span>
                                            <span className="text-indigo-600 font-black text-lg">{character.current_level}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Companion List */}
                    <div className="lg:w-3/5 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-6 h-6 text-indigo-600" />
                                    <h2 className="text-2xl font-black text-slate-900 font-display">내 동료</h2>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total {userCharacters.length}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1 content-start">
                                {userCharacters.slice((charPage - 1) * ITEMS_PER_PAGE, charPage * ITEMS_PER_PAGE).map((uc) => {
                                    const isActive = uc.id === character.id;
                                    const ucImage = getLevelImage(uc.current_level, uc.character?.level_images);
                                    const ucImgSrc = ucImage ? `${ucImage}` : null;

                                    return (
                                        <button
                                            key={uc.id}
                                            onClick={() => switchCharacter(uc.id)}
                                            className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-3 aspect-[3/4] w-full ${isActive ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-5xl shadow-inner overflow-hidden">
                                                {ucImgSrc ? (
                                                    <Image
                                                        src={ucImgSrc}
                                                        alt={uc.character?.name || 'Character'}
                                                        width={64}
                                                        height={64}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    uc.character?.base_image_url
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-bold text-indigo-500 uppercase">LV. {uc.current_level}</p>
                                                <h4 className="text-sm font-bold text-slate-800">{uc.character?.name}</h4>
                                            </div>
                                            {isActive && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Paging */}
                            {userCharacters.length > ITEMS_PER_PAGE && (
                                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-50">
                                    <button
                                        disabled={charPage === 1}
                                        onClick={() => setCharPage(prev => prev - 1)}
                                        className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm font-bold text-slate-600">{charPage} / {Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}</span>
                                    <button
                                        disabled={charPage === Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}
                                        onClick={() => setCharPage(prev => prev + 1)}
                                        className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
