import { createClient } from '@/lib/supabase/server';
import UserMenu from './UserMenu';
import Link from 'next/link';

export default async function Header() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <header className="bg-white shadow dark:bg-zinc-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <Link href="/" className="flex flex-shrink-0 items-center">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">SIUM</span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <UserMenu user={user} />
                    </div>
                </div>
            </div>
        </header>
    );
}
