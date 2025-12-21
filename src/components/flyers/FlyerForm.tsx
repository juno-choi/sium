'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUpload from '@/components/ImageUpload';
import { FlyerFormData, AppleTemplateData } from '@/types/flyer';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface FlyerFormProps {
    mode: 'create' | 'edit';
    initialData?: {
        title: string;
        description: string;
        imageUrls: string[];
        templateId?: string;
        formData?: any;
    };
    flyerId?: string;
    onSuccess?: () => void;
}

const DEFAULT_APPLE_DATA: AppleTemplateData = {
    juiceSale: {
        productName: '사과즙 판매',
        price: '35,000원',
        shippingNote: '택배비 포함',
    },
    table5kg: [
        { range: '12~13과', price: '75,000', quantity: '12~13' },
        { range: '14~15과', price: '65,000', quantity: '14~15' },
        { range: '16~17과', price: '55,000', quantity: '16~17' },
        { range: '18~19과', price: '50,000', quantity: '18~19' },
        { range: '20~21과', price: '45,000', quantity: '20~21' },
        { range: '22~23과', price: '40,000', quantity: '22~23' },
        { range: '24~25과', price: '35,000', quantity: '24~25' },
    ],
    table10kg: [
        { range: '12~13과', price: '140,000', quantity: '24~26' },
        { range: '14~15과', price: '120,000', quantity: '28~30' },
        { range: '16~17과', price: '100,000', quantity: '32~34' },
        { range: '18~19과', price: '90,000', quantity: '36~38' },
        { range: '20~21과', price: '80,000', quantity: '40~42' },
        { range: '22~23과', price: '70,000', quantity: '44~46' },
        { range: '24~25과', price: '60,000', quantity: '48~50' },
    ],
    contacts: [
        { name: '이름1', phone: '010-0000-0000' },
        { name: '이름2', phone: '010-0000-0000' }
    ],
    varieties: '아리수, 감홍, 시나노골드, 부사 판매',
    orderInstruction: '주문 시 "성함, 전화번호, 주소" 보내주세요',
    shippingFee: '택배비 포함',
    account: {
        bank: '농협',
        number: '000-0000-0000-00',
        owner: '홍길동',
    }
};

export default function FlyerForm({ mode, initialData, flyerId, onSuccess }: FlyerFormProps) {
    const router = useRouter();
    const { showToast } = useToast();

    const [templateId, setTemplateId] = useState(initialData?.templateId || 'basic');
    const [formData, setFormData] = useState<FlyerFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        imageUrls: initialData?.imageUrls || [],
    });

    const [appleData, setAppleData] = useState<AppleTemplateData>(
        templateId === 'apple' && initialData?.formData ? initialData.formData : DEFAULT_APPLE_DATA
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, url],
        }));
    };

    const handleAppleImageUpload = (url: string, field: 'juice' | 'apple') => {
        if (field === 'juice') {
            setAppleData(prev => ({ ...prev, juiceSale: { ...prev.juiceSale, imageUrl: url } }));
        } else {
            setAppleData(prev => ({ ...prev, appleImageUrl: url }));
        }
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
        if (templateId === 'basic' && formData.imageUrls.length === 0) {
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

            const thumbnailUrl = templateId === 'apple'
                ? (appleData.juiceSale.imageUrl || appleData.appleImageUrl || null)
                : (formData.imageUrls[0] || null);

            // Prepare Form Data for JSONB
            const dbFormData = templateId === 'apple' ? appleData : {
                title: formData.title,
                description: formData.description,
                imageUrls: formData.imageUrls,
            };

            const flyerPayload = {
                title: formData.title,
                description: formData.description,
                image_url: thumbnailUrl,
                template_id: templateId,
                form_data: dbFormData,
                user_id: user.id,
            };

            if (mode === 'create') {
                const { error: insertError } = await supabase
                    .from('flyers')
                    .insert(flyerPayload);

                if (insertError) throw insertError;

                showToast('success', '전단지가 성공적으로 생성되었습니다!');
                router.push('/flyers');
                router.refresh();
            } else {
                if (!flyerId) throw new Error('수정할 전단지 ID가 없습니다.');

                const { error: updateError } = await supabase
                    .from('flyers')
                    .update(flyerPayload)
                    .eq('uuid', flyerId);

                if (updateError) throw updateError;

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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Template Selection */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <label className="block text-sm font-semibold text-gray-700">템플릿 선택</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setTemplateId('basic')}
                        className={`p-4 rounded-lg border-2 text-left transition ${templateId === 'basic' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="font-bold mb-1">기본 템플릿</div>
                        <div className="text-xs text-gray-500">이미지와 텍스트 중심의 심플한 디자인</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTemplateId('apple')}
                        className={`p-4 rounded-lg border-2 text-left transition ${templateId === 'apple' ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        <div className="font-bold mb-1 text-red-600">🍎 농산물 판매 (사과)</div>
                        <div className="text-xs text-gray-500">가격표, 계좌번호 등 판매에 최적화된 구성</div>
                    </button>
                </div>
            </div>

            {/* Basic Info (Common) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        전단지 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="예: [특가] 꿀사과 5kg/10kg 산지직송 판매"
                        maxLength={100}
                    />
                </div>

                {templateId === 'basic' && (
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            placeholder="전단지 본문 내용을 입력하세요"
                        />
                    </div>
                )}
            </div>

            {templateId === 'basic' ? (
                /* Basic Template Image Upload */
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <label className="block text-sm font-medium text-gray-700">이미지 업로드 <span className="text-red-500">*</span></label>
                    <ImageUpload onUploadComplete={handleImageUpload} disabled={isSubmitting} />
                    {formData.imageUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {formData.imageUrls.map((url, idx) => (
                                <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <Image src={url} alt="flyer" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleImageRemove(url)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Apple Template Fields */
                <div className="space-y-8">
                    {/* 사과 이미지 업로드 섹션 (기존 사과즙 판매 위치) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                            <span className="bg-red-100 text-red-600 p-1 rounded">🍎</span> 사과 이미지
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">전단지 상단에 노출될 사과 이미지</label>
                                <ImageUpload onUploadComplete={(url) => handleAppleImageUpload(url, 'apple')} disabled={isSubmitting} />
                                {appleData.appleImageUrl && (
                                    <div className="relative w-full aspect-video mt-2 border rounded-lg overflow-hidden group">
                                        <Image src={appleData.appleImageUrl} alt="apple" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setAppleData({ ...appleData, appleImageUrl: '' })}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 가격표 테이블 (5KG) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-red-600">
                            📊 과수(5KG) 가격표
                        </h3>
                        <div className="space-y-2">
                            {appleData.table5kg.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2">
                                    <input
                                        placeholder="과수 (예: 12~13과)"
                                        value={row.range}
                                        onChange={(e) => {
                                            const newTable = [...appleData.table5kg];
                                            newTable[idx].range = e.target.value;
                                            setAppleData({ ...appleData, table5kg: newTable });
                                        }}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                        placeholder="가격 (예: 75,000)"
                                        value={row.price}
                                        onChange={(e) => {
                                            const newTable = [...appleData.table5kg];
                                            newTable[idx].price = e.target.value;
                                            setAppleData({ ...appleData, table5kg: newTable });
                                        }}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="갯수 (예: 12~13)"
                                            value={row.quantity}
                                            onChange={(e) => {
                                                const newTable = [...appleData.table5kg];
                                                newTable[idx].quantity = e.target.value;
                                                setAppleData({ ...appleData, table5kg: newTable });
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAppleData({ ...appleData, table5kg: appleData.table5kg.filter((_, i) => i !== idx) });
                                            }}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setAppleData({ ...appleData, table5kg: [...appleData.table5kg, { range: '', price: '', quantity: '' }] })}
                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50"
                            >
                                + 행 추가
                            </button>
                        </div>
                    </div>

                    {/* 연락처 및 안내 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2">📞 연락처</h3>
                            {appleData.contacts.map((c, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        placeholder="이름"
                                        value={c.name}
                                        onChange={(e) => {
                                            const newContacts = [...appleData.contacts];
                                            newContacts[idx].name = e.target.value;
                                            setAppleData({ ...appleData, contacts: newContacts });
                                        }}
                                        className="w-24 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                        placeholder="전화번호"
                                        value={c.phone}
                                        onChange={(e) => {
                                            const newContacts = [...appleData.contacts];
                                            newContacts[idx].phone = e.target.value;
                                            setAppleData({ ...appleData, contacts: newContacts });
                                        }}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    {appleData.contacts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setAppleData({ ...appleData, contacts: appleData.contacts.filter((_, i) => i !== idx) })}
                                            className="text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {appleData.contacts.length < 2 && (
                                <button
                                    type="button"
                                    onClick={() => setAppleData({ ...appleData, contacts: [...appleData.contacts, { name: '', phone: '' }] })}
                                    className="text-sm text-brand-600 font-semibold"
                                >
                                    + 연락처 추가
                                </button>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2">💰 계좌 정보</h3>
                            <div className="space-y-2">
                                <input
                                    placeholder="은행명"
                                    value={appleData.account.bank}
                                    onChange={(e) => setAppleData({ ...appleData, account: { ...appleData.account, bank: e.target.value } })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    placeholder="계좌번호"
                                    value={appleData.account.number}
                                    onChange={(e) => setAppleData({ ...appleData, account: { ...appleData.account, number: e.target.value } })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                                <input
                                    placeholder="예금주"
                                    value={appleData.account.owner}
                                    onChange={(e) => setAppleData({ ...appleData, account: { ...appleData.account, owner: e.target.value } })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 가격표 테이블 (10KG) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-green-600">
                            📊 과수(10KG) 가격표
                        </h3>
                        <div className="space-y-2">
                            {appleData.table10kg.map((row, idx) => (
                                <div key={idx} className="grid grid-cols-3 gap-2">
                                    <input
                                        placeholder="과수 (예: 12~13과)"
                                        value={row.range}
                                        onChange={(e) => {
                                            const newTable = [...appleData.table10kg];
                                            newTable[idx].range = e.target.value;
                                            setAppleData({ ...appleData, table10kg: newTable });
                                        }}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <input
                                        placeholder="가격 (예: 140,000)"
                                        value={row.price}
                                        onChange={(e) => {
                                            const newTable = [...appleData.table10kg];
                                            newTable[idx].price = e.target.value;
                                            setAppleData({ ...appleData, table10kg: newTable });
                                        }}
                                        className="px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="갯수 (예: 24~26)"
                                            value={row.quantity}
                                            onChange={(e) => {
                                                const newTable = [...appleData.table10kg];
                                                newTable[idx].quantity = e.target.value;
                                                setAppleData({ ...appleData, table10kg: newTable });
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAppleData({ ...appleData, table10kg: appleData.table10kg.filter((_, i) => i !== idx) });
                                            }}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setAppleData({ ...appleData, table10kg: [...appleData.table10kg, { range: '', price: '', quantity: '' }] })}
                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50"
                            >
                                + 행 추가
                            </button>
                        </div>
                    </div>

                    {/* 기타 안내 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold border-b pb-2">📝 기타 안내 문구</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">품종 안내</label>
                                <input
                                    type="text"
                                    value={appleData.varieties}
                                    onChange={(e) => setAppleData({ ...appleData, varieties: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">택배비 강조 문구</label>
                                <input
                                    type="text"
                                    value={appleData.shippingFee}
                                    onChange={(e) => setAppleData({ ...appleData, shippingFee: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
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
