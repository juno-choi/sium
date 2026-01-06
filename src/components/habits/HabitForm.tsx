'use client';

import { useState, useEffect } from 'react';
import { Habit, HabitDifficulty } from '@/types/habit';
import DifficultySelect from './DifficultySelect';
import DaySelect from './DaySelect';
import { Loader2, Save } from 'lucide-react';

export interface HabitFormData {
    title: string;
    description: string;
    difficulty: HabitDifficulty;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
    is_active: boolean;
}

export interface HabitSample {
    id: string;
    label: string;
    data: HabitFormData;
}

const DEFAULT_SAMPLES: HabitSample[] = [
    {
        id: 'exercise',
        label: '🏃 운동하기',
        data: {
            title: '운동하기',
            description: '30분간 전신 운동을 완료하고 체력을 단련합니다.',
            difficulty: 'normal',
            mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true,
            is_active: true
        }
    },
    {
        id: 'study',
        label: '📚 공부하기',
        data: {
            title: '공부하기',
            description: '1시간 동안 집중해서 공부하고 지력을 높입니다.',
            difficulty: 'hard',
            mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false,
            is_active: true
        }
    }
];

interface HabitFormProps {
    initialData?: Habit | HabitFormData | null;
    onSubmit: (data: HabitFormData) => Promise<void>;
    isSubmitting: boolean;
}

export default function HabitForm({ initialData, onSubmit, isSubmitting }: HabitFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<HabitDifficulty>('normal');
    const [days, setDays] = useState({
        mon: true,
        tue: true,
        wed: true,
        thu: true,
        fri: true,
        sat: false,
        sun: false,
    });

    // Sync initialData when it changes
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setDifficulty(initialData.difficulty || 'normal');
            setDays({
                mon: initialData.mon ?? true,
                tue: initialData.tue ?? true,
                wed: initialData.wed ?? true,
                thu: initialData.thu ?? true,
                fri: initialData.fri ?? true,
                sat: initialData.sat ?? false,
                sun: initialData.sun ?? false,
            });
        }
    }, [initialData]);

    const handleSampleClick = (sampleData: HabitFormData) => {
        setTitle(sampleData.title);
        setDescription(sampleData.description);
        setDifficulty(sampleData.difficulty);
        setDays({
            mon: sampleData.mon,
            tue: sampleData.tue,
            wed: sampleData.wed,
            thu: sampleData.thu,
            fri: sampleData.fri,
            sat: sampleData.sat,
            sun: sampleData.sun,
        });
    };

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
            is_active: initialData?.is_active ?? true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Samples Section */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">
                    초보 모험가를 위한 추천 퀘스트
                </label>
                <div className="flex flex-wrap gap-3">
                    {DEFAULT_SAMPLES.map((sample) => (
                        <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSampleClick(sample.data)}
                            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2 px-1">
                    퀘스트 이름
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
