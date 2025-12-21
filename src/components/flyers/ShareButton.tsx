'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    const handleShare = async () => {
        try {
            const url = window.location.href;

            if (navigator.share) {
                await navigator.share({
                    title,
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                showToast('success', '링크가 복사되었습니다!');
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
            showToast('error', '공유하기에 실패했습니다.');
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? '복사됨' : '공유하기'}</span>
        </button>
    );
}
