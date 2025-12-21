import Image from 'next/image';
import Link from 'next/link';
import { Flyer } from '@/types/flyer';
import { User, Calendar, Image as ImageIcon } from 'lucide-react';

interface FlyerCardProps {
    flyer: Flyer;
}

export function FlyerCard({ flyer }: FlyerCardProps) {
    const formattedDate = new Date(flyer.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Link href={`/flyers/${flyer.uuid}`} aria-label={`${flyer.title} 전단지 보기`}>
            <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {/* 썸네일 */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    {flyer.image_url ? (
                        <Image
                            src={flyer.image_url}
                            alt={flyer.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* 콘텐츠 */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {flyer.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                        {flyer.description || '설명이 없습니다.'}
                    </p>

                    <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                <User className="w-3 h-3" />
                            </div>
                            <span className="font-medium truncate max-w-[100px]">{flyer.users?.full_name || '익명'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <time dateTime={flyer.created_at}>{formattedDate}</time>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
