'use client';

import { useDailyHabits } from '@/lib/hooks/useDailyHabits';
import DailyHabitForm from './DailyHabitForm';
import DailyHabitItem from './DailyHabitItem';
import { Loader2, Sparkles } from 'lucide-react';

export default function DailyHabitList() {
    const { dailyHabits, loading, addDailyHabit, completeDailyHabit, deleteDailyHabit } = useDailyHabits();

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const completedCount = dailyHabits.filter(h => h.is_completed).length;
    const totalCount = dailyHabits.length;

    return (
        <div className="space-y-4 mt-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    <h3 className="text-lg font-bold text-slate-900 font-display">오늘의 일일 퀘스트</h3>
                </div>
                {totalCount > 0 && (
                    <span className="text-sm font-bold text-slate-500">
                        {completedCount} / {totalCount} 완료
                    </span>
                )}
            </div>

            {/* Progress bar - only show if there are habits */}
            {totalCount > 0 && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-500 transition-all duration-500"
                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                    />
                </div>
            )}

            {/* Daily Habits List */}
            <div className="space-y-3">
                {dailyHabits.map((habit) => (
                    <DailyHabitItem
                        key={habit.id}
                        habit={habit}
                        onComplete={completeDailyHabit}
                        onDelete={deleteDailyHabit}
                    />
                ))}
            </div>

            {/* Add Form */}
            <DailyHabitForm onSubmit={addDailyHabit} />
        </div>
    );
}
