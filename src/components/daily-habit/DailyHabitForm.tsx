'use client';

import { useState } from 'react';
import { Plus, Loader2, Zap, Flame, Star, X, Save } from 'lucide-react';
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
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<HabitDifficulty>('normal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(title.trim(), description.trim() || null, difficulty);
            setTitle('');
            setDescription('');
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
                일일 퀘스트 추가
            </button>
        );
    }

    return (
        <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-lg font-black text-slate-800 font-display">새 일일 퀘스트</h4>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                        분류
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 영양제 챙겨먹기"
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-lg font-medium"
                        autoFocus
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                        설명 (선택)
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="이 퀘스트에 대해 간단히 메모해보세요."
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all min-h-[100px]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 px-1">
                        난이도 설정
                    </label>
                    <div className="flex gap-3">
                        {DIFFICULTY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setDifficulty(option.value)}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2 ${difficulty === option.value
                                    ? option.color
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !title.trim()}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100/50 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>퀘스트 저장하기</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
