import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string; // e.g., '/flyers'
}

export function Pagination({
    currentPage,
    totalPages,
    basePath = '/flyers',
}: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const displayPages = pages.length <= 7
        ? pages
        : pages.filter(p => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2));

    if (totalPages <= 1) return null;

    const getPageUrl = (page: number) => {
        // Check if basePath already has query params
        const separator = basePath.includes('?') ? '&' : '?';
        return `${basePath}${separator}page=${page}`;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-12 mb-4">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-gray-100 text-gray-300">
                    <ChevronLeft className="w-5 h-5" />
                </span>
            )}

            {/* Pages */}
            {displayPages.map((page, index) => {
                const isGap = index > 0 && page - displayPages[index - 1] > 1;

                return (
                    <div key={page} className="flex items-center">
                        {isGap && <span className="mx-1 text-gray-400">...</span>}
                        <Link
                            href={getPageUrl(page)}
                            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium flex items-center justify-center transition ${currentPage === page
                                    ? 'bg-brand-600 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </Link>
                    </div>
                );
            })}

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={getPageUrl(currentPage + 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            ) : (
                <span className="p-2 rounded-lg border border-gray-100 text-gray-300">
                    <ChevronRight className="w-5 h-5" />
                </span>
            )}
        </div>
    );
}
