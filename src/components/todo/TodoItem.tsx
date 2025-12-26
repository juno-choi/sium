'use client';

import { TodoItem as TodoType } from '@/types/todo';
import { CheckCircle2, Circle, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface TodoItemProps {
    todo: TodoType;
    onClear: (id: string, difficulty: string) => Promise<any>;
}

const difficultyStyles = {
    easy: { color: 'text-emerald-500', bg: 'bg-emerald-50' },
    normal: { color: 'text-indigo-500', bg: 'bg-indigo-50' },
    hard: { color: 'text-rose-500', bg: 'bg-rose-50' },
};

export default function TodoItem({ todo, onClear }: TodoItemProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [showXP, setShowXP] = useState(false);
    const styles = difficultyStyles[todo.difficulty];

    const handleClear = async () => {
        if (todo.is_completed || isClearing) return;

        setIsClearing(true);
        try {
            await onClear(todo.id, todo.difficulty);
            setShowXP(true);
            setTimeout(() => setShowXP(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div
            className={`relative group bg-white rounded-2xl p-5 border transition-all ${todo.is_completed
                    ? 'border-slate-100 opacity-75'
                    : 'border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100'
                }`}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleClear}
                    disabled={todo.is_completed || isClearing}
                    className={`flex-shrink-0 transition-all ${todo.is_completed ? 'text-emerald-500 scale-110' : 'text-slate-300 hover:text-indigo-400'
                        }`}
                >
                    {isClearing ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : todo.is_completed ? (
                        <CheckCircle2 className="w-8 h-8" />
                    ) : (
                        <Circle className="w-8 h-8" />
                    )}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`font-bold truncate ${todo.is_completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {todo.title}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${styles.bg} ${styles.color}`}>
                            {todo.difficulty}
                        </span>
                    </div>
                    {todo.description && (
                        <p className="text-sm text-slate-500 truncate leading-relaxed">
                            {todo.description}
                        </p>
                    )}
                </div>

                {todo.is_completed && !showXP && (
                    <div className="text-emerald-500 font-bold text-sm">Clear!</div>
                )}
            </div>

            {/* Floating XP effect */}
            {showXP && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[slideUp_1s_ease-out_forwards] pointer-events-none">
                    <div className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-black text-sm">+{todo.difficulty === 'hard' ? 35 : todo.difficulty === 'normal' ? 20 : 10} XP</span>
                    </div>
                </div>
            )}
        </div>
    );
}
