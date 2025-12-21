'use client';

import Link from 'next/link';
import { useState } from 'react';
import { User, LogOut, Menu, X, LayoutGrid } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            Sium
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    href="/flyers"
                                    className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span>전단지 목록</span>
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        aria-label="사용자 메뉴"
                                        aria-expanded={isProfileOpen}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="text-sm">{user.email}</span>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                            <Link
                                                href="/flyers/new"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                새 전단지 작성
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>로그아웃</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                            >
                                로그인
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-brand-600 transition"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4 animate-slide-up">
                        <nav className="flex flex-col space-y-4">
                            {user ? (
                                <>
                                    <Link
                                        href="/flyers"
                                        className="flex items-center space-x-2 px-4 py-2 text-brand-600 font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <LayoutGrid className="w-5 h-5" />
                                        <span>전단지 목록</span>
                                    </Link>
                                    <Link
                                        href="/flyers/new"
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        새 전단지 작성
                                    </Link>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <div className="px-4 py-2 text-sm text-gray-500">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>로그아웃</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block px-4 py-2 bg-brand-500 text-white rounded-lg text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    로그인
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
