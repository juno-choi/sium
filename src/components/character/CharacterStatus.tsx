'use client';

import { UserCharacter } from '@/types/character';
import LevelProgress from './LevelProgress';
import { Coins, Sparkles, User as UserIcon } from 'lucide-react';

interface CharacterStatusProps {
    userCharacter: UserCharacter;
}

export default function CharacterStatus({ userCharacter }: CharacterStatusProps) {
    const { character, current_xp, current_level, gold, hair_style, face_shape, skin_color } = userCharacter;

    if (!character) return null;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-indigo-100/30 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-50/50 rounded-full -z-0" />
            <div className="absolute top-1/2 -left-12 w-32 h-32 bg-amber-50/50 rounded-full -z-0" />

            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                {/* Character Visual */}
                <div className="relative group">
                    <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[3rem] flex items-center justify-center text-8xl md:text-9xl shadow-inner animate-[float_4s_ease-in-out_infinite]">
                        {/* 
              Simplified visual: Using the base emoji. 
              Future: CharacterAvatar component with hair/skin layers
            */}
                        <span style={{ color: skin_color }}>{character.base_image_url}</span>
                    </div>
                    <div className="absolute -bottom-4 inset-x-0 mx-auto w-32 h-6 bg-slate-900/10 blur-xl rounded-full -z-10" />

                    {/* Level Badge */}
                    <div className="absolute -top-3 -right-3 bg-indigo-600 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform font-black">
                        <span className="text-[10px] opacity-70 leading-none">LV</span>
                        <span className="text-xl leading-none">{current_level}</span>
                    </div>
                </div>

                {/* Stats and Info */}
                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-4xl font-black text-slate-900 font-display">
                                    {character.name}
                                </h2>
                                <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                                    {hair_style} 헤어
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                멋진 모험을 계속해볼까요?
                            </p>
                        </div>

                        {/* Gold Display */}
                        <div className="bg-amber-50 border border-amber-100 px-6 py-4 rounded-[1.5rem] flex items-center gap-3 shadow-sm hover:scale-105 transition-transform">
                            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-md shadow-amber-200">
                                <Coins className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Gold</span>
                                <span className="text-2xl font-black text-amber-700 font-display">{gold.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <LevelProgress currentXP={current_xp} level={current_level} />
                    </div>
                </div>
            </div>
        </div>
    );
}
