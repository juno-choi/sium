'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DailyHabit, DailyHabitWithCompletion } from '@/types/daily-habit';
import { HabitDifficulty } from '@/types/habit';
import { useCharacter } from './useCharacter';

export function useDailyHabits() {
    const [dailyHabits, setDailyHabits] = useState<DailyHabitWithCompletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { addRewards } = useCharacter();

    const getTodayDateStr = () => new Date().toISOString().split('T')[0];

    const fetchDailyHabits = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const dateStr = getTodayDateStr();

            // 1. Fetch today's daily habits
            const { data: habits, error: habitsError } = await supabase
                .from('daily_habits')
                .select('*')
                .eq('user_id', user.id)
                .eq('quest_date', dateStr)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (habitsError) throw habitsError;

            // 2. Fetch today's logs for daily habits
            const habitIds = (habits || []).map(h => h.id);
            let completedIds = new Set<string>();

            if (habitIds.length > 0) {
                const { data: logs, error: logsError } = await supabase
                    .from('daily_habit_logs')
                    .select('daily_habit_id')
                    .in('daily_habit_id', habitIds)
                    .eq('completed_date', dateStr);

                if (logsError) throw logsError;
                completedIds = new Set(logs?.map(log => log.daily_habit_id) || []);
            }

            // 3. Merge completion status
            const habitsWithCompletion: DailyHabitWithCompletion[] = (habits || []).map(habit => ({
                ...habit,
                is_completed: completedIds.has(habit.id),
            }));

            setDailyHabits(habitsWithCompletion);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addDailyHabit = async (
        title: string,
        description: string | null,
        difficulty: HabitDifficulty
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('daily_habits')
                .insert({
                    user_id: user.id,
                    title,
                    description,
                    difficulty,
                    quest_date: getTodayDateStr(),
                })
                .select()
                .single();

            if (error) throw error;

            setDailyHabits([{ ...data, is_completed: false }, ...dailyHabits]);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const completeDailyHabit = async (habitId: string, difficulty: HabitDifficulty) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const dateStr = getTodayDateStr();

            // Rewards
            const xpTable: Record<HabitDifficulty, number> = { easy: 1000, normal: 2000, hard: 3500 };
            const goldTable: Record<HabitDifficulty, number> = { easy: 1000, normal: 2000, hard: 3500 };

            const xpEarned = xpTable[difficulty];
            const goldEarned = goldTable[difficulty];

            // 1. Create daily habit log
            const { error: logError } = await supabase
                .from('daily_habit_logs')
                .insert({
                    daily_habit_id: habitId,
                    user_id: user.id,
                    completed_date: dateStr,
                    xp_earned: xpEarned,
                    gold_earned: goldEarned,
                });

            if (logError) throw logError;

            // 2. Add rewards to character
            await addRewards(xpEarned, goldEarned);

            // 3. Update local state
            setDailyHabits(dailyHabits.map(habit =>
                habit.id === habitId ? { ...habit, is_completed: true } : habit
            ));

            return { success: true, xpEarned, goldEarned };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteDailyHabit = async (habitId: string) => {
        try {
            const { error } = await supabase
                .from('daily_habits')
                .delete()
                .eq('id', habitId);

            if (error) throw error;

            setDailyHabits(dailyHabits.filter(h => h.id !== habitId));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchDailyHabits();
    }, []);

    return {
        dailyHabits,
        loading,
        error,
        addDailyHabit,
        completeDailyHabit,
        deleteDailyHabit,
        refresh: fetchDailyHabits,
    };
}
