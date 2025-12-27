'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Character, UserCharacter } from '@/types/character';

interface CharacterContextType {
    character: UserCharacter | null;
    availableCharacters: Character[];
    loading: boolean;
    error: string | null;
    selectCharacter: (characterId: number) => Promise<UserCharacter>;
    addRewards: (xp: number, gold: number) => Promise<{ data: UserCharacter; leveledUp: boolean }>;
    updateAppearance: (appearance: Partial<Pick<UserCharacter, 'hair_style' | 'face_shape' | 'skin_color'>>) => Promise<UserCharacter>;
    refresh: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
    const [character, setCharacter] = useState<UserCharacter | null>(null);
    const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchAvailableCharacters = useCallback(async () => {
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
    }, [supabase]);

    const fetchUserCharacter = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_characters')
                .select('*, character:characters(*)')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setCharacter(data || null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

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
                    gold: 0,
                    hair_style: 'short',
                    face_shape: 'smiling',
                    skin_color: '#FFDAB9',
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

    const addRewards = async (xp: number, gold: number) => {
        if (!character) throw new Error('No character selected');

        try {
            const newXP = character.current_xp + xp;
            const newGold = character.gold + gold;
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
                    gold: newGold,
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



    const updateAppearance = async (appearance: Partial<Pick<UserCharacter, 'hair_style' | 'face_shape' | 'skin_color'>>) => {
        if (!character) throw new Error('No character selected');

        try {
            const { data, error } = await supabase
                .from('user_characters')
                .update({
                    ...appearance,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', character.id)
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

    useEffect(() => {
        fetchUserCharacter();
        fetchAvailableCharacters();
    }, [fetchUserCharacter, fetchAvailableCharacters]);

    return (
        <CharacterContext.Provider
            value={{
                character,
                availableCharacters,
                loading,
                error,
                selectCharacter,
                addRewards,
                updateAppearance,
                refresh: fetchUserCharacter,
            }}
        >
            {children}
        </CharacterContext.Provider>
    );
}

export function useCharacter() {
    const context = useContext(CharacterContext);
    if (context === undefined) {
        throw new Error('useCharacter must be used within a CharacterProvider');
    }
    return context;
}
