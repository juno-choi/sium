'use client';

import { Habit } from '@/types/habit';
import { Settings2, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

interface HabitCardProps {
    habit: Habit;
}

const difficultyLabels = {
    easy: { label: '쉬움', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    normal: { label: '보통', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    hard: { label: '어려움', color: 'text-rose-600', bg: 'bg-rose-50' },
};

export default function HabitCard({ habit }: HabitCardProps) {
    const diff = difficultyLabels[habit.difficulty];

    const selectedDays = [
        { label: '월', active: habit.mon },
        { label: '화', active: habit.tue },
        { label: '수', active: habit.wed },
        { label: '목', active: habit.thu },
        { label: '금', active: habit.fri },
        { label: '토', active: habit.sat },
        { label: '일', active: habit.sun },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${diff.bg} ${diff.color}`}>
                    {diff.label}
                </div>
                <Link
                    href={`/habits/${habit.id}`}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
                >
                    <Settings2 className="w-5 h-5" />
                </Link>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display group-hover:text-indigo-600 transition-colors">
                {habit.title}
            </h3>

            {habit.description && (
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                    {habit.description}
                </p>
            )}

            <div className="flex flex-wrap gap-1 mt-auto">
                {selectedDays.map((day, idx) => (
                    <div
                        key={idx}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${day.active
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-50 text-slate-300'
                            }`}
                    >
                        {day.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
