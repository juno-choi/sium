'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import CharacterStatus from '@/components/character/CharacterStatus';
import TodoList from '@/components/todo/TodoList';
import LevelUpModal from '@/components/character/LevelUpModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { character, loading: charLoading } = useCharacter();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const lastLevelRef = useRef<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!charLoading && !character) {
            router.push('/character-select');
        }

        if (character) {
            if (lastLevelRef.current !== null && character.current_level > lastLevelRef.current) {
                setShowLevelUp(true);
            }
            lastLevelRef.current = character.current_level;
        }
    }, [character, charLoading, router]);

    if (charLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!character) return null;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:py-12">
            {showLevelUp && (
                <LevelUpModal
                    level={character.current_level}
                    onClose={() => setShowLevelUp(false)}
                />
            )}
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 font-display mb-1">나의 대시보드</h1>
                        <p className="text-slate-500 font-medium">환영합니다! 오늘의 모험을 시작해볼까요?</p>
                    </div>
                    <Link
                        href="/habits/new"
                        className="hidden md:flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>퀘스트 추가</span>
                    </Link>
                </div>

                {/* Character Progress Section */}
                <section>
                    <CharacterStatus userCharacter={character} />
                </section>

                {/* Daily Tasks Section */}
                <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/20">
                    <TodoList />
                </section>

                {/* Mobile New Habit Button */}
                <div className="md:hidden fixed bottom-6 right-6">
                    <Link
                        href="/habits/new"
                        className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-8 h-8" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
