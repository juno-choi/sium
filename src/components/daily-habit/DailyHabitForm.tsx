'use client';

import { useState } from 'react';
import { Plus, Loader2, Zap, Flame, Star } from 'lucide-react';
import { HabitDifficulty } from '@/types/habit';

interface DailyHabitFormProps {
    onSubmit: (title: string, description: string | null, difficulty: HabitDifficulty) => Promise<void>;
}

const DIFFICULTY_OPTIONS: { value: HabitDifficulty; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'easy', label: '쉬움', icon: <Star className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'normal', label: '보통', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'hard', label: '어려움', icon: <Flame className="w-4 h-4" />, color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function DailyHabitForm({ onSubmit }: DailyHabitFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState<HabitDifficulty>('normal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title.trim(), null, difficulty);
            setTitle('');
            setDifficulty('normal');
            setIsOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                오늘의 퀘스트 추가
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="퀘스트 제목을 입력하세요"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
            />

            <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setDifficulty(option.value)}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-1.5 ${difficulty === option.value
                                ? option.color
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            추가
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
