'use client';

import { DailyHabitWithCompletion } from '@/types/daily-habit';
import { CheckCircle2, Circle, Sparkles, Loader2, Trash2, Coins } from 'lucide-react';
import { useState } from 'react';
import { HabitDifficulty } from '@/types/habit';

interface DailyHabitItemProps {
    habit: DailyHabitWithCompletion;
    onComplete: (id: string, difficulty: HabitDifficulty) => Promise<any>;
    onDelete: (id: string) => Promise<void>;
}

const difficultyStyles = {
    easy: { color: 'text-emerald-500', bg: 'bg-emerald-50', label: '쉬움' },
    normal: { color: 'text-indigo-500', bg: 'bg-indigo-50', label: '보통' },
    hard: { color: 'text-rose-500', bg: 'bg-rose-50', label: '어려움' },
};

const rewardTable = {
    easy: { xp: 10, gold: 100 },
    normal: { xp: 20, gold: 200 },
    hard: { xp: 35, gold: 350 },
};

export default function DailyHabitItem({ habit, onComplete, onDelete }: DailyHabitItemProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const styles = difficultyStyles[habit.difficulty];
    const rewards = rewardTable[habit.difficulty];

    const handleComplete = async () => {
        if (habit.is_completed || isProcessing) return;

        setIsProcessing(true);
        try {
            await onComplete(habit.id, habit.difficulty);
            setShowRewards(true);
            setTimeout(() => setShowRewards(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (habit.is_completed || isDeleting) return;

        setIsDeleting(true);
        try {
            await onDelete(habit.id);
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div
            className={`relative group bg-white rounded-2xl p-5 border transition-all ${habit.is_completed
                ? 'border-slate-100 bg-slate-50/50'
                : 'border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                }`}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleComplete}
                    disabled={habit.is_completed || isProcessing}
                    className={`flex-shrink-0 transition-all ${habit.is_completed ? 'text-emerald-500 scale-110' : 'text-slate-300 hover:text-indigo-400'
                        }`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : habit.is_completed ? (
                        <CheckCircle2 className="w-8 h-8" />
                    ) : (
                        <Circle className="w-8 h-8" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-bold truncate ${habit.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {habit.title}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${styles.bg} ${styles.color}`}>
                            {styles.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                            일일
                        </span>
                    </div>
                    {habit.description && (
                        <p className="text-sm text-slate-400 truncate leading-relaxed">
                            {habit.description}
                        </p>
                    )}
                </div>

                {/* Delete button - only show for incomplete habits */}
                {!habit.is_completed && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                )}
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
