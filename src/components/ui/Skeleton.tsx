export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-skeleton bg-gray-200 rounded ${className}`}
        />
    );
}

export function FlyerCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between mt-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}

export function FlyerListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <FlyerCardSkeleton key={i} />
            ))}
        </div>
    );
}
