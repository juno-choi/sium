import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteFlyerButton } from '@/components/flyers/DeleteFlyerButton';
import { ShareButton } from '@/components/flyers/ShareButton';
import { User, Calendar, Edit, ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchHTMLFromStorage } from '@/lib/storage/html-storage';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function FlyerDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const supabase = await createClient();

    const { data: flyer, error } = await supabase
        .from('flyers')
        .select(`
      *,
      users (
        full_name,
        avatar_url
      )
    `)
        .eq('uuid', resolvedParams.id)
        .single();

    if (error || !flyer) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === flyer.user_id;

    // HTML 내용 가져오기 (Storage 우선, DB 폴백)
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <article className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Navigation */}
                <div className="max-w-4xl mx-auto mb-6">
                    <Link href="/flyers" className="inline-flex items-center text-gray-500 hover:text-brand-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        목록으로 돌아가기
                    </Link>
                </div>

                {/* Header Card */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    {flyer.title}
                                </h1>
                                {flyer.template_id !== 'basic' && (
                                    <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-semibold rounded-full border border-brand-100 uppercase">
                                        {flyer.template_id}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                    <User className="w-4 h-4 mr-2 text-brand-500" />
                                    <span className="font-medium text-gray-700">{flyer.users?.full_name || '익명'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <time dateTime={flyer.created_at}>{formattedDate}</time>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <Link href={`/${flyer.user_id}/${flyer.uuid}`} target="_blank">
                                <button className="flex items-center space-x-2 px-4 py-2 bg-brand-50 text-brand-600 border border-brand-100 rounded-lg hover:bg-brand-100 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>공유 페이지 보기</span>
                                </button>
                            </Link>
                            <ShareButton
                                title={flyer.title}
                                userUuid={flyer.user_id}
                                flyerUuid={flyer.uuid}
                            />
                            {isOwner && (
                                <>
                                    <Link href={`/flyers/${resolvedParams.id}/edit`}>
                                        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                                            <Edit className="w-4 h-4" />
                                            <span>수정</span>
                                        </button>
                                    </Link>
                                    <DeleteFlyerButton flyerId={resolvedParams.id} />
                                </>
                            )}
                        </div>
                    </div>

                    {flyer.description && (
                        <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed border border-gray-100">
                            {flyer.description}
                        </div>
                    )}
                </div>

                {/* Content Body */}
                <div
                    className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-xl prose-img:shadow-md max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </article>
    );
}
