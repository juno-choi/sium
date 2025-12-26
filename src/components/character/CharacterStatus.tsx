'use client';

import { UserCharacter } from '@/types/character';
import LevelProgress from './LevelProgress';

interface CharacterStatusProps {
    userCharacter: UserCharacter;
}

export default function CharacterStatus({ userCharacter }: CharacterStatusProps) {
    const { character, current_xp, current_level } = userCharacter;

    if (!character) return null;

    // Find current evolution based on level
    const sortedEvolutions = [...(character.evolutions || [])].sort((a, b) => b.level_required - a.level_required);
    const currentEvolution = sortedEvolutions.find(ev => current_level >= ev.level_required);
    const displayImage = currentEvolution?.image_url || character.base_image_url;
    const evolutionName = currentEvolution?.evolution_name || character.name;

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-indigo-100/20 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full -z-0" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-full flex items-center justify-center text-8xl md:text-9xl shadow-inner animate-[float_3s_ease-in-out_infinite]">
                        {displayImage}
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-24 h-4 bg-slate-200/50 blur-md rounded-full -z-10" />
                </div>

                <div className="flex-1 w-full text-center md:text-left">
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-900 font-display mb-1">
                            {evolutionName}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            오늘도 함께 멋진 습관을 만들어봐요!
                        </p>
                    </div>

                    <LevelProgress currentXP={current_xp} level={current_level} />
                </div>
            </div>
        </div>
    );
}
