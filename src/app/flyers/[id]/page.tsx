import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteFlyerButton } from '@/components/flyers/DeleteFlyerButton';

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="mb-8 border-b pb-4">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold">{flyer.title}</h1>
                    <div className="flex gap-2">
                        {isOwner && (
                            <>
                                <Link href={`/flyers/${resolvedParams.id}/edit`}>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm">
                                        수정
                                    </button>
                                </Link>
                                <DeleteFlyerButton flyerId={resolvedParams.id} />
                            </>
                        )}
                        <Link href="/flyers">
                            <button className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
                                목록으로
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                    <span className="font-semibold mr-2">{flyer.users?.full_name || '익명'}</span>
                    <span className="mx-2">|</span>
                    <span>{new Date(flyer.created_at).toLocaleString()}</span>
                </div>
            </header>

            <div
                className="flyer-content prose max-w-none"
                dangerouslySetInnerHTML={{ __html: flyer.html_content }}
            />
        </div>
    );
}
