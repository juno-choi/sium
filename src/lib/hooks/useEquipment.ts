'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserEquipment, EquipmentSlot } from '@/types/equipment';
import { useCharacter } from './useCharacter';

export function useEquipment() {
    const { character } = useCharacter();
    const [equippedItems, setEquippedItems] = useState<Record<EquipmentSlot, UserEquipment | null>>({
        hat: null,
        top: null,
        bottom: null,
        shoes: null,
        gloves: null,
        weapon: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchEquipment = useCallback(async () => {
        if (!character) return;
        try {
            // Only set loading to true if we don't have any data yet
            const isInitialLoad = Object.values(equippedItems).every(item => item === null);
            if (isInitialLoad) setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('user_equipment')
                .select('*, item:equipment_items(*)')
                .eq('user_character_id', character.id)
                .eq('is_equipped', true);

            if (fetchError) throw fetchError;

            const newEquipped: Record<EquipmentSlot, UserEquipment | null> = {
                hat: null,
                top: null,
                bottom: null,
                shoes: null,
                gloves: null,
                weapon: null,
            };

            data?.forEach((ue: any) => {
                if (ue.item) {
                    newEquipped[ue.item.slot as EquipmentSlot] = ue;
                }
            });

            setEquippedItems(newEquipped);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase, character?.id]);

    const toggleEquip = async (userEquipmentId: string, slot: EquipmentSlot, currentlyEquipped: boolean) => {
        if (!character) throw new Error('캐릭터가 선택되지 않았습니다.');
        try {
            if (!currentlyEquipped) {
                // 1. Unequip existing item in the same slot for THIS character
                const { data: slotItems } = await supabase
                    .from('equipment_items')
                    .select('id')
                    .eq('slot', slot);

                const slotItemIds = slotItems?.map(i => i.id) || [];

                await supabase
                    .from('user_equipment')
                    .update({ is_equipped: false })
                    .eq('user_character_id', character.id)
                    .eq('is_equipped', true)
                    .filter('item_id', 'in', `(${slotItemIds.join(',')})`);

                // 2. Equip new item
                const { error: equipError } = await supabase
                    .from('user_equipment')
                    .update({ is_equipped: true })
                    .eq('id', userEquipmentId);

                if (equipError) throw equipError;
            } else {
                // 1. Just unequip
                const { error: unequipError } = await supabase
                    .from('user_equipment')
                    .update({ is_equipped: false })
                    .eq('id', userEquipmentId);

                if (unequipError) throw unequipError;
            }

            await fetchEquipment();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    return {
        equippedItems,
        loading,
        error,
        toggleEquip,
        refresh: fetchEquipment
    };
}
