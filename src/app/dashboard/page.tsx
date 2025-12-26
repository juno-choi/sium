'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import CharacterStatus from '@/components/character/CharacterStatus';
import TodoList from '@/components/todo/TodoList';
import LevelUpModal from '@/components/character/LevelUpModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loader2, Plus, Sword } from 'lucide-react';
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
        <div className="min-h-screen bg-[#f8fafc] px-4 py-8 md:py-16">
            {showLevelUp && (
                <LevelUpModal
                    level={character.current_level}
                    onClose={() => setShowLevelUp(false)}
                />
            )}
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sword className="w-5 h-5 text-indigo-600" />
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Adventure Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 font-display mb-1">모험 일지</h1>
                        <p className="text-slate-500 font-medium">환영합니다, 모험가님! 오늘의 퀘스트를 수행해보세요.</p>
                    </div>
                    <Link
                        href="/habits/new"
                        className="group flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 hover:-translate-y-1 transition-all"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span>새 퀘스트 수락</span>
                    </Link>
                </div>

                {/* Character Progress Section */}
                <section>
                    <CharacterStatus userCharacter={character} />
                </section>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Daily Tasks Section */}
                    <section className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/20">
                        <TodoList />
                    </section>

                    {/* Sidebar Info/Tips */}
                    <section className="space-y-6">
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-display">
                                <Plus className="w-5 h-5 text-indigo-400" />
                                오늘의 팁
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                퀘스트를 완료하고 얻은 골드로 상점에서 멋진 옷을 사보세요. 더 높은 레벨은 더 희귀한 아이템의 시작입니다!
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                            >
                                상점 구경하기 →
                            </Link>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">최근 성적</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">완료한 퀘스트</span>
                                    <span className="font-bold text-slate-900">12개</span>
                                </div>
                                <div className="w-full h-px bg-slate-50" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">누적 골드</span>
                                    <span className="font-bold text-amber-600">4,500 G</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Mobile New Habit Button - Hidden on large screens, shown as FAB on mobile if not in mobile menu */}
                <div className="md:hidden fixed bottom-6 right-6 z-40">
                    <Link
                        href="/habits/new"
                        className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-8 h-8" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
