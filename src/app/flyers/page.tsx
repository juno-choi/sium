import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FlyerList } from '@/components/flyers/FlyerList';
import { Flyer } from '@/types/flyer';
import { redirect } from 'next/navigation';

export default async function FlyersPage() {
    const supabase = await createClient();

    // 로그인 상태 확인
    const { data: { user } } = await supabase.auth.getUser();

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!user) {
        redirect('/login');
    }

    // 전단지 목록 조회
    const { data: flyers, error } = await supabase
        .from('flyers')
        .select(`
      *,
      users (
        full_name,
        avatar_url
      )
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch flyers:', error);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">전단지 목록</h1>
                <div>
                    <Link href="/flyers/new">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                            새 전단지 작성
                        </button>
                    </Link>
                </div>
            </header>

            {flyers && flyers.length > 0 ? (
                <FlyerList flyers={flyers as Flyer[]} />
            ) : (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">아직 등록된 전단지가 없습니다.</p>
                    <p className="mt-2">첫 번째 전단지를 작성해보세요!</p>
                </div>
            )}
        </div>
    );
}
