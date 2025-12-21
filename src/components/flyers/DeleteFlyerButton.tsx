'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface DeleteFlyerButtonProps {
    flyerId: string;
}

export function DeleteFlyerButton({ flyerId }: DeleteFlyerButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

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

            showToast('success', '전단지가 삭제되었습니다.');
            router.push('/flyers');
            router.refresh();
        } catch (err) {
            console.error('삭제 실패:', err);
            showToast('error', '삭제에 실패했습니다.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="전단지 삭제"
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors text-sm font-medium"
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
            <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
        </button>
    );
}
