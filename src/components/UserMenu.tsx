'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserMenuProps {
    user: any; // Using any for simplicity here, but should be typed properly
}

export default function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    };

    if (!user) {
        return (
            <a
                href="/login"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Sign in
            </a>
        );
    }

    return (
        <div className="relative ml-3">
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-zinc-800"
                >
                    <span className="sr-only">Open user menu</span>
                    {user.user_metadata.avatar_url ? (
                        <img
                            className="h-8 w-8 rounded-full"
                            src={user.user_metadata.avatar_url}
                            alt=""
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300" />
                    )}
                </button>
            </div>
            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-800">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {user.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-700"
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
