import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { fetchHTMLFromStorage } from '@/lib/storage/html-storage';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ userUuid: string; flyerUuid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { userUuid, flyerUuid } = await params;
    const supabase = await createClient();

    const { data: flyer } = await supabase
        .from('flyers')
        .select('title, description, image_url')
        .eq('uuid', flyerUuid)
        .eq('user_id', userUuid)
        .single();

    if (!flyer) return { title: '전단지를 찾을 수 없습니다' };

    return {
        title: `${flyer.title} | Sium`,
        description: flyer.description || '전단지 상세 내용',
        openGraph: {
            title: flyer.title,
            description: flyer.description || undefined,
            images: flyer.image_url ? [{ url: flyer.image_url }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: flyer.title,
            description: flyer.description || undefined,
            images: flyer.image_url ? [flyer.image_url] : [],
        },
    };
}

export default async function PublicFlyerViewerPage({ params }: PageProps) {
    const { userUuid, flyerUuid } = await params;
    const supabase = await createClient();

    // 1. 전단지 및 작성자 정보 조회 (userUuid 매칭 검증 포함)
    const { data: flyer, error } = await supabase
        .from('flyers')
        .select(`
            *,
            users (
                full_name,
                avatar_url
            )
        `)
        .eq('uuid', flyerUuid)
        .eq('user_id', userUuid)
        .single();

    if (error || !flyer) {
        notFound();
    }

    // 2. HTML 콘텐츠 로딩 (Storage 우선, DB 폴백)
    let htmlContent = '';
    if (flyer.html_url) {
        htmlContent = await fetchHTMLFromStorage(flyer.html_url) || '';
    }

    if (!htmlContent && flyer.html_content) {
        htmlContent = flyer.html_content;
    }

    const formattedDate = new Date(flyer.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <main className="min-h-screen bg-white">
            {/* 전단지 본문 */}
            <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
                <div
                    className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-img:rounded-xl prose-img:shadow-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>

            {/* 푸터 영역 */}
            <footer className="mt-12 py-8 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400">
                    Powered by <span className="font-bold text-gray-600">Sium</span>
                </p>
            </footer>
        </main>
    );
}
