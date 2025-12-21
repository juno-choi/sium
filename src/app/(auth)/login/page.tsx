'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md dark:bg-zinc-900">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Sign in to your account
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus-visible:outline-offset-0 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
                    >
                        {loading ? (
                            'Redirecting...'
                        ) : (
                            <>
                                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path
                                        d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.5833-.05-1.15-.15-1.7H12.0003v3.2h4.8334c-.2084 1.125-1.2084 3.25-4.8334 3.25-2.9084 0-5.275-2.3667-5.275-5.275s2.3666-5.275 5.275-5.275c1.3416 0 2.5083.5083 3.4416 1.4166l2.55-2.55C16.4837 3.6333 14.4003 2.75 12.0003 2.75 6.9087 2.75 2.7503 6.9083 2.7503 12s4.1584 9.25 9.25 9.25z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M20.4503 10.3c.1.55.15 1.1167.15 1.7 0 4.6667-3.7833 8.45-8.45 8.45V20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-.5833-.05-1.15-.15-1.7h-1.7z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12.0003 20.45v1.7c4.6667 0 8.45-3.7833 8.45-8.45h-1.7c0 3.7333-3.0334 6.75-6.75 6.75v-1.7z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M2.7503 12c0-2.45.95-4.7 2.5084-6.3917l2.125 1.7C6.1837 8.3583 5.4837 10.0833 5.4837 12c0 1.9167.7 3.6417 1.9083 4.6917l-2.125 1.7C3.7003 16.7 2.7503 14.45 2.7503 12z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12.0003 2.75c2.4 0 4.4834.8833 5.9917 2.3333l-2.55 2.55C14.5087 6.725 13.342 6.2167 12.0003 6.2167c-2.9084 0-5.275 2.3666-5.275 5.275H3.9753l-2.125-1.7C3.392 6.55 7.3753 2.75 12.0003 2.75z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
