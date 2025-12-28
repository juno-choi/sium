'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Character } from '@/types/character';
import { useCharacter } from './useCharacter';

export function useShop() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { gold, spendGold, refresh: refreshCharacter, userCharacters } = useCharacter();

    const fetchShopData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch all characters available for purchase
            const { data: charItems, error: charError } = await supabase
                .from('characters')
                .select('*')
                .order('price', { ascending: true });

            if (charError) throw charError;
            setCharacters(charItems || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const buyCharacter = async (characterId: number, price: number) => {
        if (gold < price) throw new Error('골드가 부족합니다.');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('인증되지 않았습니다.');

            // Check if already owned
            const alreadyOwned = userCharacters.some(uc => uc.character_id === characterId);
            if (alreadyOwned) throw new Error('이미 보유한 캐릭터입니다.');

            // 1. Deduct gold
            await spendGold(price);

            // 2. Add character to user_characters
            const { error: buyError } = await supabase
                .from('user_characters')
                .insert({
                    user_id: user.id,
                    character_id: characterId,
                    current_xp: 0,
                    current_level: 1,
                    is_active: false
                });

            if (buyError) throw buyError;

            // 3. Refresh data
            await refreshCharacter();
            await fetchShopData();

            return { success: true };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    return {
        characters,
        loading,
        error,
        buyCharacter,
        refresh: fetchShopData
    };
}
