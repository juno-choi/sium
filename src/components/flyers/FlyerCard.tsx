import Link from 'next/link';
import { Flyer } from '@/types/flyer';

interface FlyerCardProps {
    flyer: Flyer;
}

export function FlyerCard({ flyer }: FlyerCardProps) {
    return (
        <Link href={`/flyers/${flyer.uuid}`}>
            <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-48">
                    {flyer.image_url ? (
                        <img
                            src={flyer.image_url}
                            alt={flyer.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            이미지 없음
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{flyer.title}</h3>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{flyer.users?.full_name || '익명'}</span>
                        <span>{new Date(flyer.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
