'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { FlyerFormData } from '@/types/flyer';
import { generateFlyerHTML } from '@/lib/flyer-template';

interface FlyerFormProps {
    mode: 'create' | 'edit';
    initialData?: {
        title: string;
        description: string;
        imageUrls: string[];
    };
    flyerId?: string;
    onSuccess?: () => void;
}

export default function FlyerForm({ mode, initialData, flyerId, onSuccess }: FlyerFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<FlyerFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        imageUrls: initialData?.imageUrls || [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, url],
        }));
    };

    const handleImageRemove = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((u) => u !== url),
        }));
    };

    const validate = (): boolean => {
        if (!formData.title.trim()) {
            setError('제목을 입력해주세요.');
            return false;
        }
        if (formData.imageUrls.length === 0) {
            setError('최소 1개의 이미지를 업로드해주세요.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            // Generate HTML
            const htmlContent = generateFlyerHTML({
                title: formData.title,
                description: formData.description,
                imageUrls: formData.imageUrls,
            });

            const thumbnailUrl = formData.imageUrls[0] || null;

            if (mode === 'create') {
                const { error: insertError } = await supabase.from('flyers').insert({
                    title: formData.title,
                    description: formData.description,
                    image_url: thumbnailUrl,
                    html_content: htmlContent,
                    user_id: user.id,
                });

                if (insertError) throw insertError;

                router.push('/flyers');
                router.refresh();
            } else {
                if (!flyerId) throw new Error('수정할 전단지 ID가 없습니다.');

                const { error: updateError } = await supabase
                    .from('flyers')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        image_url: thumbnailUrl,
                        html_content: htmlContent,
                    })
                    .eq('uuid', flyerId);

                if (updateError) throw updateError;

                onSuccess?.();
                router.push(`/flyers/${flyerId}`);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    제목
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="전단지 제목을 입력하세요"
                    disabled={isSubmitting}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    설명
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="전단지에 대한 설명을 입력하세요"
                    disabled={isSubmitting}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    이미지 업로드
                </label>
                <div className="space-y-4">
                    <ImageUpload onUploadComplete={handleImageUpload} disabled={isSubmitting} />

                    {formData.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                            {formData.imageUrls.map((url, index) => (
                                <div key={url} className="relative group aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={url}
                                        alt={`Uploaded ${index + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={isSubmitting}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                                        {index === 0 ? '대표 이미지' : `${index + 1}번째 이미지`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? '저장 중...' : (mode === 'create' ? '작성 완료' : '수정 완료')}
                </button>
            </div>
        </form>
    );
}
