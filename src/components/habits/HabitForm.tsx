'use client';

import { useState } from 'react';
import { Habit, HabitDifficulty } from '@/types/habit';
import DifficultySelect from './DifficultySelect';
import DaySelect from './DaySelect';
import { Loader2, Save } from 'lucide-react';

interface HabitFormProps {
    initialData?: Habit;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
}

export default function HabitForm({ initialData, onSubmit, isSubmitting }: HabitFormProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [difficulty, setDifficulty] = useState<HabitDifficulty>(initialData?.difficulty || 'normal');
    const [days, setDays] = useState({
        mon: initialData?.mon ?? true,
        tue: initialData?.tue ?? true,
        wed: initialData?.wed ?? true,
        thu: initialData?.thu ?? true,
        fri: initialData?.fri ?? true,
        sat: initialData?.sat ?? false,
        sun: initialData?.sun ?? false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        // Check if at least one day is selected
        if (!Object.values(days).some(v => v)) {
            alert('최소 하루 이상의 요일을 선택해주세요!');
            return;
        }

        await onSubmit({
            title,
            description,
            difficulty,
            ...days,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                    습관 이름
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 매일 물 8잔 마시기"
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-lg"
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
                    placeholder="이 습관을 지키고 싶은 이유를 적어보세요."
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all min-h-[120px]"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">
                    난이도 설정
                </label>
                <DifficultySelect value={difficulty} onChange={setDifficulty} />
                <p className="mt-2 text-xs text-slate-500 px-1">
                    난이도가 높을수록 더 많은 경험치(XP)를 얻을 수 있습니다.
                </p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">
                    수행 요일
                </label>
                <DaySelect days={days} onChange={setDays} />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !title}
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
    );
}
