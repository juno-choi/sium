'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CustomizationOption } from '@/types/character';
import { useCharacter } from './useCharacter';

export function useCustomization() {
    const [options, setOptions] = useState<CustomizationOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { character, updateAppearance } = useCharacter();

    const fetchOptions = useCallback(async () => {
        try {
            if (options.length === 0) {
                setLoading(true);
            }
            const { data, error: fetchError } = await supabase
                .from('customization_options')
                .select('*')
                .order('id', { ascending: true });

            if (fetchError) throw fetchError;
            setOptions(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const changeOption = async (category: 'hair' | 'face' | 'skin', value: string) => {
        if (!character) return;
        try {
            const updateData: any = {};
            if (category === 'hair') updateData.hair_style = value;
            if (category === 'face') updateData.face_shape = value;
            if (category === 'skin') updateData.skin_color = value;

            await updateAppearance(updateData);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    return {
        options,
        loading,
        error,
        changeOption,
        refresh: fetchOptions
    };
}
