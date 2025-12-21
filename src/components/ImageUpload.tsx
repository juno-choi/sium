'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, ChangeEvent } from 'react';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    onRemove?: (url: string) => void;
    maxSizeInMB?: number;
    disabled?: boolean;
}

import { Upload, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    onRemove?: (url: string) => void;
    maxSizeInMB?: number;
    disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/webp'];

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

            // Reset input
            e.target.value = '';

        } catch (err) {
            console.error('업로드 실패:', err);
            setError(err instanceof Error ? err.message : '이미지 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className={`
                    relative flex cursor-pointer items-center justify-center rounded-xl 
                    border-2 border-dashed border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 
                    shadow-sm hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 transition-all
                    ${disabled || uploading ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                `}>
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            업로드 중...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="mr-2 h-5 w-5" />
                            전단지 이미지 추가
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

                <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Upload className="w-3 h-3 mr-1.5" />
                    최대 {maxSizeInMB}MB (JPG, PNG, WEBP, GIF)
                </div>
            </div>

            {error && (
                <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
