'use client';

import { useTodoList } from '@/lib/hooks/useTodoList';
import { useHabits } from '@/lib/hooks/useHabits';
import TodoItem from './TodoItem';
import { Loader2, Calendar, LayoutList } from 'lucide-react';
import HabitInlineForm from '@/components/habits/HabitInlineForm';
import { HabitDifficulty } from '@/types/habit';

export default function TodoList() {
    const { todos, loading, clearHabit, refresh } = useTodoList();
    const { addHabit } = useHabits();

    const handleQuickAddHabit = async (data: any) => {
        try {
            await addHabit({
                ...data,
                is_active: true
            });
            // Refresh todo list to show the new habit if it's for today (which it is)
            refresh();
        } catch (err) {
            console.error('Failed to add habit:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const completedCount = todos.filter(t => t.is_completed).length;
    const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-bold text-slate-900 font-display">오늘의 퀘스트</h3>
                </div>
                <div className="text-sm font-bold text-slate-500">
                    {completedCount} / {todos.length} 완료
                </div>
            </div>

            {todos.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LayoutList className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium mb-6">오늘 예정된 퀘스트가 없습니다.</p>
                </div>
            ) : (
                <>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {todos.map((todo) => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onClear={clearHabit}
                            />
                        ))}
                    </div>
                </>
            )}

            <HabitInlineForm onSubmit={handleQuickAddHabit} />
        </div>
    );
}
