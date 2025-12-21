'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { FlyerFormData } from '@/types/flyer';
import { generateFlyerHTML } from '@/lib/flyer-template';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { uploadHTMLToStorage } from '@/lib/storage/html-storage';

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
    const { showToast } = useToast();

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
            showToast('error', '제목을 입력해주세요.');
            return false;
        }
        if (formData.imageUrls.length === 0) {
            setError('최소 1개의 이미지를 업로드해주세요.');
            showToast('error', '최소 1개의 이미지를 업로드해주세요.');
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

            // Prepare Form Data for JSONB
            const dbFormData = {
                title: formData.title,
                description: formData.description,
                imageUrls: formData.imageUrls,
            };

            if (mode === 'create') {
                // Insert into DB (to get uuid)
                const { data: flyer, error: insertError } = await supabase
                    .from('flyers')
                    .insert({
                        title: formData.title,
                        description: formData.description,
                        image_url: thumbnailUrl,
                        html_content: htmlContent, // 백업용 유지
                        template_id: 'basic',
                        form_data: dbFormData,
                        user_id: user.id,
                    })
                    .select('uuid')
                    .single();

                if (insertError) throw insertError;

                // Upload HTML to Storage
                const { success, url } = await uploadHTMLToStorage({
                    flyerUuid: flyer.uuid,
                    htmlContent,
                });

                if (success && url) {
                    // Update DB with html_url
                    await supabase
                        .from('flyers')
                        .update({ html_url: url })
                        .eq('uuid', flyer.uuid);
                }

                showToast('success', '전단지가 성공적으로 생성되었습니다!');
                router.push('/flyers');
                router.refresh();
            } else {
                if (!flyerId) throw new Error('수정할 전단지 ID가 없습니다.');

                // Update DB
                const { error: updateError } = await supabase
                    .from('flyers')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        image_url: thumbnailUrl,
                        html_content: htmlContent, // 백업용 유지
                        template_id: 'basic',
                        form_data: dbFormData,
                    })
                    .eq('uuid', flyerId);

                if (updateError) throw updateError;

                // Upload HTML to Storage (Upsert)
                const { success, url } = await uploadHTMLToStorage({
                    flyerUuid: flyerId,
                    htmlContent,
                });

                if (success && url) {
                    // Update DB with html_url
                    await supabase
                        .from('flyers')
                        .update({ html_url: url })
                        .eq('uuid', flyerId);
                }

                showToast('success', '전단지가 수정되었습니다.');
                onSuccess?.();
                router.push(`/flyers/${flyerId}`);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : '저장에 실패했습니다.';
            setError(msg);
            showToast('error', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
            {/* Title Input */}
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    제목 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                        placeholder="전단지 제목을 입력하세요"
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                    <div className="absolute right-3 top-3 text-xs text-gray-400">
                        {formData.title.length}/100
                    </div>
                </div>
                {error && !formData.title.trim() && (
                    <p className="text-sm text-red-500 mt-1">제목은 필수입니다.</p>
                )}
            </div>

            {/* Description Input */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    설명
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
                    placeholder="전단지에 대한 설명을 자유롭게 입력하세요"
                    disabled={isSubmitting}
                />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    이미지 <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6">
                    <ImageUpload onUploadComplete={handleImageUpload} disabled={isSubmitting} />

                    {formData.imageUrls.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">업로드된 이미지 ({formData.imageUrls.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {formData.imageUrls.map((url, index) => (
                                    <div key={url} className="relative group aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                        <Image
                                            src={url}
                                            alt={`Uploaded ${index + 1}`}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 33vw"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(url)}
                                                className="bg-white/90 text-red-500 p-2 rounded-full hover:bg-white transition"
                                                disabled={isSubmitting}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    disabled={isSubmitting}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    취소
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            저장 중...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            {mode === 'create' ? '전단지 생성' : '수정 완료'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
