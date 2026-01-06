'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TodoItem } from '@/types/todo';
import { HabitDifficulty, HabitLog } from '@/types/habit';
import { useCharacter } from './useCharacter';

export function useTodoList() {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { addRewards } = useCharacter();

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date();
            const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const currentDay = days[today.getDay()];
            const dateStr = today.toISOString().split('T')[0];

            // 1. Fetch habits scheduled for today
            const { data: habits, error: habitsError } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .eq(currentDay, true);

            if (habitsError) throw habitsError;

            // 2. Fetch today's logs
            const { data: logs, error: logsError } = await supabase
                .from('habit_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('completed_date', dateStr);

            if (logsError) throw logsError;

            // 3. Merge data
            const completedHabitIds = new Set(logs?.map(log => log.habit_id) || []);

            const todoItems: TodoItem[] = (habits || []).map(habit => ({
                ...habit,
                is_completed: completedHabitIds.has(habit.id),
            }));

            setTodos(todoItems);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearHabit = async (habitId: string, difficulty: HabitDifficulty) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const dateStr = new Date().toISOString().split('T')[0];

            // Rewards (Updated values from plan)
            const xpTable: Record<HabitDifficulty, number> = { easy: 1000, normal: 2000, hard: 3500 };
            const goldTable: Record<HabitDifficulty, number> = { easy: 1000, normal: 2000, hard: 3500 };

            const xpEarned = xpTable[difficulty];
            const goldEarned = goldTable[difficulty];

            // 1. Create habit log
            const { error: logError } = await supabase
                .from('habit_logs')
                .insert({
                    habit_id: habitId,
                    user_id: user.id,
                    completed_date: dateStr,
                    xp_earned: xpEarned,
                    gold_earned: goldEarned,
                });

            if (logError) throw logError;

            // 2. Add rewards to character
            await addRewards(xpEarned, goldEarned);

            // 3. Update local state
            setTodos(todos.map(todo =>
                todo.id === habitId ? { ...todo, is_completed: true } : todo
            ));

            return { success: true, xpEarned, goldEarned };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };



    useEffect(() => {
        fetchTodos();
    }, []);

    return {
        todos,
        loading,
        error,
        clearHabit,
        refresh: fetchTodos
    };
}
