'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Character, UserCharacter } from '@/types/character';

export function useCharacter() {
    const [character, setCharacter] = useState<UserCharacter | null>(null);
    const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    // Fetch available characters for selection
    const fetchAvailableCharacters = async () => {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setAvailableCharacters(data || []);
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Fetch the user's selected character and progress
    const fetchUserCharacter = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('user_characters')
                .select('*, character:characters(*, evolutions:character_evolutions(*))')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
            setCharacter(data || null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Select a character (initial setup)
    const selectCharacter = async (characterId: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('user_characters')
                .insert({
                    user_id: user.id,
                    character_id: characterId,
                    current_xp: 0,
                    current_level: 1,
                })
                .select('*, character:characters(*)')
                .single();

            if (error) throw error;
            setCharacter(data);
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Update XP and Level
    const addXP = async (amount: number) => {
        if (!character) return;

        try {
            const newXP = character.current_xp + amount;
            const nextLevelThreshold = character.current_level * 100;
            let newLevel = character.current_level;
            let finalXP = newXP;

            if (newXP >= nextLevelThreshold) {
                newLevel += 1;
                finalXP = newXP - nextLevelThreshold;
            }

            const { data, error } = await supabase
                .from('user_characters')
                .update({
                    current_xp: finalXP,
                    current_level: newLevel,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', character.id)
                .select('*, character:characters(*)')
                .single();

            if (error) throw error;
            setCharacter(data);
            return { data, leveledUp: newLevel > character.current_level };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchUserCharacter();
        fetchAvailableCharacters();
    }, []);

    return {
        character,
        availableCharacters,
        loading,
        error,
        selectCharacter,
        addXP,
        refresh: fetchUserCharacter
    };
}
