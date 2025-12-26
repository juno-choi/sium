'use client';

interface LevelProgressProps {
    currentXP: number;
    level: number;
}

export default function LevelProgress({ currentXP, level }: LevelProgressProps) {
    const nextLevelXP = level * 100;
    const progress = Math.min((currentXP / nextLevelXP) * 100, 100);

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-3">
                <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Experience</span>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-black text-slate-900 font-display leading-none">{currentXP}</span>
                            <span className="text-sm font-bold text-slate-400">/ {nextLevelXP}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 px-3 py-1 rounded-lg">
                    <span className="text-sm font-black text-indigo-600 font-display">
                        {Math.floor(progress)}%
                    </span>
                </div>
            </div>

            <div className="relative h-5 bg-slate-200/50 rounded-2xl overflow-hidden p-1 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-xl transition-all duration-1000 ease-out shadow-lg relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Animated Glow effect */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-xl" />

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_3s_infinite]" />
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium font-display uppercase tracking-wider">
                    Next Rank: <span className="text-indigo-600 font-black">Level {level + 1}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-black">
                    {nextLevelXP - currentXP} XP REMAINING
                </p>
            </div>
        </div>
    );
}
