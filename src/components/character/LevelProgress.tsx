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
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-baseline space-x-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Level</span>
                    <span className="text-3xl font-black text-indigo-600 font-display">{level}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-slate-700">{currentXP}</span>
                    <span className="text-sm font-medium text-slate-400"> / {nextLevelXP} XP</span>
                </div>
            </div>

            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    style={{ width: `${progress}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
            </div>

            <p className="mt-2 text-xs text-slate-500 font-medium">
                다음 레벨까지 <span className="text-indigo-600 font-bold">{nextLevelXP - currentXP} XP</span> 남았습니다!
            </p>
        </div>
    );
}
