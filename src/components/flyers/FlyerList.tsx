import { Flyer } from '@/types/flyer';
import { FlyerCard } from './FlyerCard';
import { FlyerListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface FlyerListProps {
    flyers: Flyer[];
    isLoading?: boolean;
}

export function FlyerList({ flyers, isLoading }: FlyerListProps) {
    if (isLoading) {
        return <FlyerListSkeleton />;
    }

    if (!flyers || flyers.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {flyers.map((flyer) => (
                <FlyerCard key={flyer.uuid} flyer={flyer} />
            ))}
        </div>
    );
}
