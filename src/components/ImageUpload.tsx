'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, ChangeEvent } from 'react';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    onRemove?: (url: string) => void;
    maxSizeInMB?: number;
    disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ImageUpload({
    onUploadComplete,
    onRemove,
    maxSizeInMB = 5,
    disabled = false,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // 1. Validate File Type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)');
            return;
        }

        // 2. Validate File Size
        if (file.size > maxSizeInMB * 1024 * 1024) {
            setError(`파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.`);
            return;
        }

        try {
            setUploading(true);
            const supabase = createClient();

            // Get user for folder structure
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // If user is not logged in / checked on client side
                // Though RLS will also block it, better to check here
                throw new Error('로그인이 필요합니다.');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`;

            // 3. Upload File
            const { error: uploadError } = await supabase.storage
                .from('flyers')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // 4. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('flyers')
                .getPublicUrl(fileName);

            onUploadComplete(publicUrl);

            // Reset input (optional, but good for uploading same file again if deleted)
            e.target.value = '';

        } catch (err) {
            console.error('업로드 실패:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('이미지 업로드 중 오류가 발생했습니다.');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-4">
                <label className={`
                    relative flex cursor-pointer items-center justify-center rounded-md 
                    border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 
                    shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700
                    ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}>
                    {uploading ? (
                        <>
                            <svg className="mr-2 h-4 w-4 animate-spin text-zinc-700 dark:text-zinc-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <svg className="mr-2 h-5 w-5 text-zinc-500 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            이미지 추가
                        </>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileChange}
                        disabled={disabled || uploading}
                    />
                </label>

                {/* Optional help text */}
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    최대 {maxSizeInMB}MB (JPG, PNG, GIF)
                </span>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
