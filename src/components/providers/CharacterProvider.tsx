'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Character, UserCharacter } from '@/types/character';

interface CharacterContextType {
    character: UserCharacter | null;
    userCharacters: UserCharacter[];
    availableCharacters: Character[];
    gold: number;
    loading: boolean;
    error: string | null;
    selectCharacter: (characterId: number) => Promise<UserCharacter>;
    switchCharacter: (userCharacterId: string) => Promise<void>;
    addRewards: (xp: number, gold: number) => Promise<{ data: UserCharacter; leveledUp: boolean }>;
    updateAppearance: (appearance: Partial<Pick<UserCharacter, 'hair_style' | 'face_shape' | 'skin_color'>>) => Promise<UserCharacter>;
    updateGold: (newGold: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
    const [character, setCharacter] = useState<UserCharacter | null>(null);
    const [userCharacters, setUserCharacters] = useState<UserCharacter[]>([]);
    const [availableCharacters, setAvailableCharacters] = useState<Character[]>([]);
    const [gold, setGold] = useState(0);
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

    const fetchUserData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Fetch User Profile (Gold)
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('gold')
                .eq('uuid', user.id)
                .single();

            if (profileError) throw profileError;
            setGold(profile.gold || 0);

            // 2. Fetch User Characters
            const { data: characters, error: charError } = await supabase
                .from('user_characters')
                .select('*, character:characters(*)')
                .eq('user_id', user.id);

            if (charError) throw charError;

            setUserCharacters(characters || []);

            // 3. Set active character
            const active = characters?.find(c => c.is_active) || characters?.[0] || null;
            setCharacter(active);

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

            // 1. Deactivate other characters
            await supabase
                .from('user_characters')
                .update({ is_active: false })
                .eq('user_id', user.id);

            // 2. Check if already owned
            const existing = userCharacters.find(uc => uc.character_id === characterId);

            if (existing) {
                // Just activate it
                const { data, error } = await supabase
                    .from('user_characters')
                    .update({ is_active: true })
                    .eq('id', existing.id)
                    .select('*, character:characters(*)')
                    .single();

                if (error) throw error;
                setCharacter(data);
                await fetchUserData();
                return data;
            } else {
                // Create new one
                const { data, error } = await supabase
                    .from('user_characters')
                    .insert({
                        user_id: user.id,
                        character_id: characterId,
                        current_xp: 0,
                        current_level: 1,
                        is_active: true,
                        hair_style: 'short',
                        face_shape: 'smiling',
                        skin_color: '#FFDAB9',
                    })
                    .select('*, character:characters(*)')
                    .single();

                if (error) throw error;
                setCharacter(data);
                await fetchUserData(); // Refresh list
                return data;
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const switchCharacter = async (userCharacterId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Deactivate all
            await supabase
                .from('user_characters')
                .update({ is_active: false })
                .eq('user_id', user.id);

            // 2. Activate selected
            const { error } = await supabase
                .from('user_characters')
                .update({ is_active: true })
                .eq('id', userCharacterId);

            if (error) throw error;
            await fetchUserData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const addRewards = async (xp: number, earnedGold: number) => {
        if (!character) throw new Error('No character selected');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Update Character XP
            const newXP = character.current_xp + xp;
            const nextLevelThreshold = character.current_level * 100;
            let newLevel = character.current_level;
            let finalXP = newXP;

            if (newXP >= nextLevelThreshold) {
                newLevel += 1;
                finalXP = newXP - nextLevelThreshold;
            }

            const { data: charData, error: charError } = await supabase
                .from('user_characters')
                .update({
                    current_xp: finalXP,
                    current_level: newLevel,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', character.id)
                .select('*, character:characters(*)')
                .single();

            if (charError) throw charError;

            // 2. Update Shared Gold
            const newGold = gold + earnedGold;
            const { error: goldError } = await supabase
                .from('users')
                .update({ gold: newGold })
                .eq('uuid', user.id);

            if (goldError) throw goldError;

            setGold(newGold);
            setCharacter(charData);
            setUserCharacters(prev => prev.map(c => c.id === charData.id ? charData : c));

            return { data: charData, leveledUp: newLevel > character.current_level };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateGold = async (newGoldValue: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('users')
                .update({ gold: newGoldValue })
                .eq('uuid', user.id);

            if (error) throw error;
            setGold(newGoldValue);
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
            setUserCharacters(prev => prev.map(c => c.id === data.id ? data : c));
            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchAvailableCharacters();
    }, [fetchUserData, fetchAvailableCharacters]);

    return (
        <CharacterContext.Provider
            value={{
                character,
                userCharacters,
                availableCharacters,
                gold,
                loading,
                error,
                selectCharacter,
                switchCharacter,
                addRewards,
                updateAppearance,
                updateGold,
                refresh: fetchUserData,
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
