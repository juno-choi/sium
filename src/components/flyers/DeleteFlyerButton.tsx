'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DeleteFlyerButtonProps {
    flyerId: string;
}

export function DeleteFlyerButton({ flyerId }: DeleteFlyerButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('정말로 삭제하시겠습니까?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('flyers')
                .delete()
                .eq('uuid', flyerId);

            if (error) throw error;

            // 성공 시 메인 페이지로 이동
            router.push('/flyers');
            router.refresh();
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
        >
            {isDeleting ? '삭제 중...' : '삭제'}
        </button>
    );
}
