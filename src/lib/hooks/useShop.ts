'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Character, UserCharacter } from '@/types/character';
import { EquipmentItem, UserEquipment } from '@/types/equipment';
import { useCharacter } from './useCharacter';

export function useShop() {
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [userItems, setUserItems] = useState<UserEquipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { character, gold, spendGold, refresh: refreshCharacter } = useCharacter();

    const fetchShopData = useCallback(async () => {
        try {
            if (items.length === 0 && userItems.length === 0) {
                setLoading(true);
            }
            if (!character) return;

            // 1. Fetch all shop items
            const { data: shopItems, error: shopError } = await supabase
                .from('equipment_items')
                .select('*')
                .order('price', { ascending: true });

            if (shopError) throw shopError;
            setItems(shopItems || []);

            // 2. Fetch all characters
            const { data: charItems, error: charError } = await supabase
                .from('characters')
                .select('*')
                .order('price', { ascending: true });

            if (charError) throw charError;
            setCharacters(charItems || []);

            // 3. Fetch user's owned items for THIS character
            const { data: ownedItems, error: ownedError } = await supabase
                .from('user_equipment')
                .select('*, item:equipment_items(*)')
                .eq('user_character_id', character.id);

            if (ownedError) throw ownedError;
            setUserItems(ownedItems || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase, character?.id]);

    const buyItem = async (itemId: number, price: number) => {
        if (!character) throw new Error('캐릭터가 선택되지 않았습니다.');
        if (gold < price) throw new Error('골드가 부족합니다.');

        try {
            // 1. Deduct gold using latest DB state
            await spendGold(price);

            // 2. Add item to user_equipment for THIS character
            const { error: buyError } = await supabase
                .from('user_equipment')
                .insert({
                    user_character_id: character.id,
                    item_id: itemId,
                    is_equipped: false,
                });

            if (buyError) throw buyError;

            // 3. Refresh data
            await fetchShopData();

            return { success: true };
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const buyCharacter = async (characterId: number, price: number) => {
        if (gold < price) throw new Error('골드가 부족합니다.');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('인증되지 않았습니다.');

            // 1. Deduct gold using latest DB state
            await spendGold(price);

            // 2. Add character to user_characters
            const { error: buyError } = await supabase
                .from('user_characters')
                .insert({
                    user_id: user.id,
                    character_id: characterId,
                    current_xp: 0,
                    current_level: 1,
                    is_active: false // Newly bought char is not active by default
                });

            if (buyError) throw buyError;

            // 3. Refresh context data
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
        items,
        characters,
        userItems,
        loading,
        error,
        buyItem,
        buyCharacter,
        refresh: fetchShopData
    };
}

