import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
                <FileQuestion className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
                아직 전단지가 없습니다
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm">
                첫 번째 전단지를 만들어보세요! 이미지와 텍스트로 쉽고 빠르게 만들 수 있습니다.
            </p>
            <Link
                href="/flyers/new"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 md:text-lg transition"
            >
                전단지 만들기
            </Link>
        </div>
    );
}
