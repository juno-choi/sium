import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 text-center">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          나만의 <span className="text-indigo-600">전단지</span>를<br />
          쉽고 빠르게 만들어보세요
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          이미지만 업로드하면 자동으로 멋진 HTML 전단지가 완성됩니다.
          지금 바로 시작해보세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {user ? (
            <Link href="/flyers">
              <button className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl">
                전단지 목록 보기
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto">
                  시작하기 (로그인)
                </button>
              </Link>
              <Link href="/flyers">
                <button className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg border-2 border-indigo-600 hover:bg-gray-50 transition duration-300 w-full sm:w-auto">
                  전단지 둘러보기
                </button>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
