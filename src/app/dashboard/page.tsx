'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import CharacterStatus from '@/components/character/CharacterStatus';
import TodoList from '@/components/todo/TodoList';
import DailyHabitList from '@/components/daily-habit/DailyHabitList';
import LevelUpModal from '@/components/character/LevelUpModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Loader2, Plus, Sword, Sparkles } from 'lucide-react';
import Link from 'next/link';

const MOTIVATIONAL_QUOTES = [
    "오늘의 한 걸음이 내일의 방향을 만든다",
    "시작했으면 이미 절반은 온 것이다",
    "완벽하지 않아도 괜찮다, 멈추지만 않으면 된다",
    "두려움은 준비가 시작됐다는 신호다",
    "지금이 가장 빠른 시작이다",
    "안 해본 것만이 나를 불안하게 만든다",
    "작게 시작해도 꿈은 크게 가져라",
    "한 번 더 해보는 사람이 결국 이긴다",
    "용기는 자신감이 아니라 행동에서 나온다",
    "오늘의 선택이 미래의 나를 만든다",
    "노력은 배신하지 않는다, 다만 시간을 요구할 뿐이다",
    "꾸준함은 재능을 이긴다",
    "성장통은 성장의 증거다",
    "어제의 나보다 1%만 나아져도 충분하다",
    "반복은 실력을 만든다",
    "포기하지 않는 한 실패는 없다",
    "실수는 데이터다",
    "오늘의 연습이 내일의 실력이다",
    "느려도 멈추지 않으면 된다",
    "결국 남는 건 쌓인 시간이다",
    "통제할 수 있는 것에 집중하라",
    "비교는 동기부여가 아니라 방해물이다",
    "남의 속도는 나의 기준이 아니다",
    "생각이 바뀌면 결과도 바뀐다",
    "불확실함 속에서도 방향은 선택할 수 있다",
    "핑계는 마음을 편하게 하고, 행동은 인생을 바꾼다",
    "문제는 나를 단단하게 만든다",
    "할 수 있다는 태도가 반은 해결한다",
    "지금의 한계는 영원하지 않다",
    "마음이 가는 쪽이 아니라, 성장하는 쪽을 선택하라",
    "준비가 끝나길 기다리면 평생 시작 못 한다",
    "행동은 최고의 자기소개다",
    "도전하지 않으면 아무 일도 일어나지 않는다",
    "불편함은 성장의 입구다",
    "쉬운 길은 나를 키우지 않는다",
    "한 번의 실행이 수백 번의 고민을 이긴다",
    "해보면 생각보다 별거 아닐 수도 있다",
    "도전은 후회를 줄인다",
    "지금의 불안은 미래의 자산이다",
    "선택하지 않는 것도 하나의 선택이다",
    "나는 이미 충분히 잘 해오고 있다",
    "나의 가치는 결과 하나로 결정되지 않는다",
    "스스로를 믿는 연습도 필요하다",
    "나는 배울 수 있는 사람이다",
    "어제보다 나아진 나를 인정하라",
    "남들이 몰라도 나는 안다",
    "나의 속도도 존중받아야 한다",
    "지금의 나는 과정 중에 있다",
    "나 자신을 의심하지 말고 방법을 의심하라",
    "나는 생각보다 강하다",
    "시간이 걸린다는 건 제대로 가고 있다는 뜻이다",
    "빠름보다 중요한 건 방향이다",
    "오늘의 인내가 내일의 자유가 된다",
    "결과는 항상 늦게 온다",
    "지금 버티는 시간이 실력이 된다",
    "조급함은 실수를 부른다",
    "쌓이는 건 하루아침에 무너지지 않는다",
    "지금의 지루함은 미래의 경쟁력이다",
    "기다릴 줄 아는 사람이 멀리 간다",
    "오늘의 루틴이 내일의 실력이다",
    "목표는 나를 움직이게 한다",
    "꿈이 있다는 건 이미 특별하다",
    "목표는 나침반이지 족쇄가 아니다",
    "하고 싶은 이유를 잊지 마라",
    "목표는 수정해도 포기는 하지 마라",
    "꿈은 생각보다 가까울 수 있다",
    "지금 하는 일이 연결될 날이 온다",
    "의미 없는 노력은 없다",
    "내가 가는 길이 곧 길이 된다",
    "목표는 나를 성장시키기 위해 존재한다",
    "오늘 못 하면 내일 해도 된다, 다만 포기하지 마라",
    "쉬어도 된다, 그만두지만 말자",
    "모든 날이 잘 풀릴 필요는 없다",
    "안 되는 날도 과정이다",
    "완벽한 날보다 지속 가능한 날이 중요하다",
    "나만 이런 게 아니다",
    "힘들다는 건 진지하다는 뜻이다",
    "지금 버거우면 제대로 하고 있는 거다",
    "흔들려도 방향만 잃지 마라",
    "오늘의 최선은 충분하다",
    "나는 계속 전진 중이다",
    "지금의 선택을 후회하지 않게 하자",
    "포기하지 않는 내가 자랑스럽다",
    "오늘도 해낸 나를 칭찬하자",
    "내 인생의 책임자는 나다",
    "한 번 더 해보자",
    "끝까지 가보자",
    "지금의 나는 미래의 나를 돕고 있다",
    "나는 성장 중이다",
    "오늘도 잘 버텼다",
    "나는 할 수 있다",
    "지금도 충분히 잘하고 있다",
    "계속 가면 된다",
    "멈추지 않는 한 실패는 아니다",
    "나를 믿고 한 발 더",
    "오늘의 나를 존중하자",
    "내일의 나는 오늘의 나에게 감사할 것이다",
    "지금 이 순간도 의미 있다",
    "결국 해내는 사람이 된다",
    "지금 이 문장을 읽고 있는 당신은 이미 시작했다"
];

export default function DashboardPage() {
    const { character, loading: charLoading } = useCharacter();
    const [showLevelUp, setShowLevelUp] = useState(false);
    const lastLevelRef = useRef<number | null>(null);
    const [quote, setQuote] = useState("");
    const router = useRouter();

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
        setQuote(MOTIVATIONAL_QUOTES[randomIndex]);
    }, []);

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
                        <DailyHabitList />
                    </section>

                    {/* Sidebar Info/Tips */}
                    <section className="space-y-6">
                        {/* Motivation Quote */}
                        <div className="bg-indigo-600 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border border-indigo-400/50">
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-display">
                                <Sparkles className="w-5 h-5 text-indigo-200" />
                                오늘도 힘내세요👊
                            </h3>
                            <p className="text-indigo-50 font-bold text-lg leading-relaxed">
                                "{quote}"
                            </p>
                        </div>

                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-display">
                                <Plus className="w-5 h-5 text-indigo-400" />
                                오늘의 팁
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                퀘스트를 완료하고 얻은 골드로 상점에서 멋진 동료를 구해보세요!
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                            >
                                상점 구경하기 →
                            </Link>
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
