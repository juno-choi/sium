'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    User, LogOut, Menu, X, Sword, PlusCircle, BookPlus,
    ShoppingBag, Palette, Coins
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useCharacter } from '@/lib/hooks/useCharacter';

interface HeaderProps {
    user: SupabaseUser | null;
}

export default function Header({ user }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { character } = useCharacter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navItems = [
        { name: '모험하기', href: '/dashboard', icon: Sword },
        { name: '퀘스트 관리', href: '/habits', icon: BookPlus },
        { name: '상점', href: '/shop', icon: ShoppingBag },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100">
                            <span className="text-white font-black text-xl leading-none">S</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 font-display">
                            Sium
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {user ? (
                            <>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${isActive
                                                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}

                                <div className="w-px h-6 bg-slate-200 mx-2" />

                                {/* Gold Display in Header */}
                                {character && (
                                    <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 mr-2">
                                        <Coins className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-black text-amber-700 font-display">
                                            {character.gold.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
                                    >
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 hidden lg:block">
                                            {user.email?.split('@')[0]}
                                        </span>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/character"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <Palette className="w-4 h-4" />
                                                <span>캐릭터 꾸미기</span>
                                            </Link>
                                            <Link
                                                href="/habits/new"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <PlusCircle className="w-4 h-4" />
                                                <span>새 퀘스트 추가</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
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
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-bold"
                            >
                                시작하기
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:text-indigo-600 transition"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 py-4 pb-6 space-y-4">
                        {user ? (
                            <>
                                {character && (
                                    <div className="flex items-center justify-between px-4 py-2 bg-amber-50 mx-4 rounded-2xl border border-amber-100">
                                        <div className="flex items-center space-x-2">
                                            <Coins className="w-5 h-5 text-amber-500" />
                                            <span className="text-sm font-bold text-amber-900">내 골드</span>
                                        </div>
                                        <span className="text-lg font-black text-amber-700 font-display">
                                            {character.gold.toLocaleString()} G
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-2 px-4">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition ${isActive
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                        : 'bg-slate-50 text-slate-600 border border-transparent'
                                                    }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Icon className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] font-bold">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                                <div className="px-4 space-y-2">
                                    <Link
                                        href="/character"
                                        className="flex items-center justify-center space-x-2 w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Palette className="w-5 h-5 text-indigo-500" />
                                        <span>캐릭터 꾸미기</span>
                                    </Link>
                                    <Link
                                        href="/habits/new"
                                        className="flex items-center justify-center space-x-2 w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        <span>새 퀘스트 추가</span>
                                    </Link>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex items-center justify-between px-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 truncate max-w-[150px]">
                                            {user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-4">
                                <Link
                                    href="/login"
                                    className="block w-full py-4 bg-indigo-600 text-white rounded-2xl text-center font-bold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    로그인하고 시작하기
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
