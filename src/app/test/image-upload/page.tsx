'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function TestImageUploadPage() {
    const [urls, setUrls] = useState<string[]>([]);

    const handleUpload = (url: string) => {
        setUrls(prev => [...prev, url]);
        console.log('업로드 완료:', url);
    };

    const handleRemove = (url: string) => {
        setUrls(prev => prev.filter(u => u !== url));
        console.log('삭제:', url);
    };

    return (
        <div className="mx-auto max-w-4xl p-8">
            <h1 className="mb-6 text-2xl font-bold dark:text-white">이미지 업로드 테스트</h1>

            <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <div className="mb-4">
                    <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">이미지 추가하기</h2>
                    <ImageUpload
                        onUploadComplete={handleUpload}
                        onRemove={handleRemove}
                    />
                </div>

                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        업로드된 이미지 목록 ({urls.length}개)
                    </h2>

                    {urls.length === 0 ? (
                        <p className="text-zinc-500 text-sm">아직 업로드된 이미지가 없습니다.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {urls.map((url, idx) => (
                                <div key={url} className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                                    <div className="aspect-w-16 aspect-h-9 relative h-48 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                                        <img
                                            src={url}
                                            alt={`테스트 ${idx}`}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                이미지 #{idx + 1}
                                            </span>
                                            <button
                                                onClick={() => handleRemove(url)}
                                                className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                        <p className="truncate text-xs text-zinc-400" title={url}>
                                            {url}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <p className="font-semibold">테스트 가이드:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>로그인 상태여야 업로드가 가능합니다. (로그아웃 상태면 에러 발생)</li>
                    <li>5MB 이하의 이미지 파일만 허용됩니다.</li>
                    <li>업로드된 이미지는 Grid 형태로 표시됩니다.</li>
                    <li>URL이 정상적으로 생성되는지 확인하세요.</li>
                </ul>
            </div>
        </div>
    );
}
