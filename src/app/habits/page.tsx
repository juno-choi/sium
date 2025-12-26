'use client';

import { useHabits } from '@/lib/hooks/useHabits';
import HabitCard from '@/components/habits/HabitCard';
import { Plus, Loader2, Target, Search } from 'lucide-react';
import Link from 'next/link';

export default function HabitListPage() {
    const { habits, loading } = useHabits();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-display mb-2">나의 퀘스트 목록</h1>
                        <p className="text-slate-500">지금까지 설정한 모든 습관을 관리할 수 있습니다.</p>
                    </div>

                    <Link
                        href="/habits/new"
                        className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        새 습관 추가하기
                    </Link>
                </div>

                {habits.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Target className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">아직 습관이 없네요!</h2>
                        <p className="text-slate-500 mb-8">새로운 습관을 추가하고 모험을 시작해보세요.</p>
                        <Link
                            href="/habits/new"
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            첫 습관 만들러 가기 →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {habits.map((habit) => (
                            <HabitCard key={habit.id} habit={habit} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
