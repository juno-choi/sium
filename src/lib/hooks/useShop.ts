'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EquipmentItem, UserEquipment } from '@/types/equipment';
import { useCharacter } from './useCharacter';

export function useShop() {
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [userItems, setUserItems] = useState<UserEquipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { character, refresh: refreshCharacter } = useCharacter();

    const fetchShopData = useCallback(async () => {
        try {
            if (items.length === 0 && userItems.length === 0) {
                setLoading(true);
            }
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch all shop items
            const { data: shopItems, error: shopError } = await supabase
                .from('equipment_items')
                .select('*')
                .order('price', { ascending: true });

            if (shopError) throw shopError;
            setItems(shopItems || []);

            // 2. Fetch user's owned items
            const { data: ownedItems, error: ownedError } = await supabase
                .from('user_equipment')
                .select('*, item:equipment_items(*)')
                .eq('user_id', user.id);

            if (ownedError) throw ownedError;
            setUserItems(ownedItems || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const buyItem = async (itemId: number, price: number) => {
        if (!character) throw new Error('캐릭터가 없습니다.');
        if (character.gold < price) throw new Error('골드가 부족합니다.');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('인증되지 않았습니다.');

            // 1. Deduct gold
            const { error: goldError } = await supabase
                .from('user_characters')
                .update({ gold: character.gold - price })
                .eq('id', character.id);

            if (goldError) throw goldError;

            // 2. Add item to user_equipment
            const { error: buyError } = await supabase
                .from('user_equipment')
                .insert({
                    user_id: user.id,
                    item_id: itemId,
                    is_equipped: false,
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
        items,
        userItems,
        loading,
        error,
        buyItem,
        refresh: fetchShopData
    };
}
