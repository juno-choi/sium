'use client';

import { TodoItem as TodoType } from '@/types/todo';
import { CheckCircle2, Circle, Sparkles, Loader2, RotateCcw, Coins } from 'lucide-react';
import { useState } from 'react';
import { HabitDifficulty } from '@/types/habit';

interface TodoItemProps {
    todo: TodoType;
    onClear: (id: string, difficulty: HabitDifficulty) => Promise<any>;
}

const difficultyStyles = {
    easy: { color: 'text-emerald-500', bg: 'bg-emerald-50' },
    normal: { color: 'text-indigo-500', bg: 'bg-indigo-50' },
    hard: { color: 'text-rose-500', bg: 'bg-rose-50' },
};

const rewardTable = {
    easy: { xp: 10, gold: 100 },
    normal: { xp: 20, gold: 200 },
    hard: { xp: 35, gold: 350 },
};

export default function TodoItem({ todo, onClear }: TodoItemProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const styles = difficultyStyles[todo.difficulty];
    const rewards = rewardTable[todo.difficulty];

    const handleClear = async () => {
        if (todo.is_completed || isProcessing) return;

        setIsProcessing(true);
        try {
            await onClear(todo.id, todo.difficulty);
            setShowRewards(true);
            setTimeout(() => setShowRewards(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };



    return (
        <div
            className={`relative group bg-white rounded-2xl p-5 border transition-all ${todo.is_completed
                ? 'border-slate-100 bg-slate-50/50'
                : 'border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                }`}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleClear}
                    disabled={todo.is_completed || isProcessing}
                    className={`flex-shrink-0 transition-all ${todo.is_completed ? 'text-emerald-500 scale-110' : 'text-slate-300 hover:text-indigo-400'
                        }`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : todo.is_completed ? (
                        <CheckCircle2 className="w-8 h-8" />
                    ) : (
                        <Circle className="w-8 h-8" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-bold truncate ${todo.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {todo.title}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${styles.bg} text-slate-400`}>
                            {todo.difficulty}
                        </span>
                    </div>
                    {todo.description && (
                        <p className="text-sm text-slate-400 truncate leading-relaxed">
                            {todo.description}
                        </p>
                    )}
                </div>


            </div>

            {/* Floating Rewards effect */}
            {showRewards && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[slideUp_1.5s_ease-out_forwards] pointer-events-none z-20">
                    <div className="flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-black text-sm">+{rewards.xp} XP</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                            <Coins className="w-4 h-4" />
                            <span className="font-black text-sm">+{rewards.gold} G</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
