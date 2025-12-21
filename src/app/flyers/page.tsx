import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FlyerList } from '@/components/flyers/FlyerList';
import { Flyer } from '@/types/flyer';
import { redirect } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 12;

export default async function FlyersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const supabase = await createClient();

    // 로그인 상태 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 전단지 목록 조회
    const { data: flyers, error, count } = await supabase
        .from('flyers')
        .select(`
      *,
      users (
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
        console.error('Failed to fetch flyers:', error);
    }

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <header className="flex flex-row justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">전단지 목록</h1>
                    <p className="text-gray-500 mt-1">내가 만든 전단지를 관리하세요.</p>
                </div>
                <Link href="/flyers/new">
                    <button className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition shadow-sm hover:translate-y-[-1px] transform">
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-semibold">새 전단지</span>
                    </button>
                </Link>
            </header>

            <FlyerList flyers={flyers as Flyer[]} />

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath="/flyers"
                />
            )}
        </div>
    );
}
