import { Flyer } from '@/types/flyer';
import { FlyerCard } from './FlyerCard';

interface FlyerListProps {
    flyers: Flyer[];
    isLoading?: boolean;
}

export function FlyerList({ flyers, isLoading }: FlyerListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-lg h-72 bg-gray-100"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {flyers.map((flyer) => (
                <FlyerCard key={flyer.id} flyer={flyer} />
            ))}
        </div>
    );
}
