'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Habit, HabitDifficulty } from '@/types/habit';

export function useHabits() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchHabits = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHabits(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addHabit = async (habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('habits')
                .insert({
                    ...habitData,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            setHabits([data, ...habits]);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateHabit = async (id: string, habitData: Partial<Habit>) => {
        try {
            const { data, error } = await supabase
                .from('habits')
                .update({
                    ...habitData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setHabits(habits.map(h => h.id === id ? data : h));
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteHabit = async (id: string) => {
        try {
            const { error } = await supabase
                .from('habits')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setHabits(habits.filter(h => h.id !== id));
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    return {
        habits,
        loading,
        error,
        addHabit,
        updateHabit,
        deleteHabit,
        refresh: fetchHabits
    };
}
