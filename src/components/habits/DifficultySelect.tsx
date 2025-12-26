'use client';

import { HabitDifficulty } from '@/types/habit';
import { Sparkles, Zap, Flame } from 'lucide-react';

interface DifficultySelectProps {
    value: HabitDifficulty;
    onChange: (value: HabitDifficulty) => void;
}

const difficulties: { value: HabitDifficulty; label: string; xp: string; icon: any; color: string; bg: string; border: string }[] = [
    {
        value: 'easy',
        label: '쉬움',
        xp: '+10 XP',
        icon: Sparkles,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
    },
    {
        value: 'normal',
        label: '보통',
        xp: '+20 XP',
        icon: Zap,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200'
    },
    {
        value: 'hard',
        label: '어려움',
        xp: '+35 XP',
        icon: Flame,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200'
    },
];

export default function DifficultySelect({ value, onChange }: DifficultySelectProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => {
                const Icon = d.icon;
                const isSelected = value === d.value;
                return (
                    <button
                        key={d.value}
                        type="button"
                        onClick={() => onChange(d.value)}
                        className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${isSelected
                                ? `${d.border} ${d.bg} shadow-md scale-105 z-10`
                                : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                    >
                        <div className={`p-2 rounded-xl mb-2 ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? d.color : 'text-slate-400'}`} />
                        </div>
                        <span className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                            {d.label}
                        </span>
                        <span className={`text-[10px] font-black ${isSelected ? d.color : 'text-slate-400'}`}>
                            {d.xp}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
