'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserEquipment, EquipmentSlot } from '@/types/equipment';

export function useEquipment() {
    const [equippedItems, setEquippedItems] = useState<Record<EquipmentSlot, UserEquipment | null>>({
        hat: null,
        top: null,
        bottom: null,
        shoes: null,
        gloves: null,
        face_accessory: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error: fetchError } = await supabase
                .from('user_equipment')
                .select('*, item:equipment_items(*)')
                .eq('user_id', user.id)
                .eq('is_equipped', true);

            if (fetchError) throw fetchError;

            const newEquipped: Record<EquipmentSlot, UserEquipment | null> = {
                hat: null,
                top: null,
                bottom: null,
                shoes: null,
                gloves: null,
                face_accessory: null,
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
    }, [supabase]);

    const toggleEquip = async (userEquipmentId: string, slot: EquipmentSlot, currentlyEquipped: boolean) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('인증되지 않았습니다.');

            if (!currentlyEquipped) {
                // 1. Unequip existing item in the same slot
                await supabase
                    .from('user_equipment')
                    .update({ is_equipped: false })
                    .eq('user_id', user.id)
                    .eq('is_equipped', true)
                    .filter('item_id', 'in', (
                        await supabase
                            .from('equipment_items')
                            .select('id')
                            .eq('slot', slot)
                    ).data?.map(i => i.id) || []);

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
