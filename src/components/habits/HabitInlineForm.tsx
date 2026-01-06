'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import HabitForm from './HabitForm';

interface HabitInlineFormProps {
    onSubmit: (data: any) => Promise<void>;
}

export default function HabitInlineForm({ onSubmit }: HabitInlineFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            setIsOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <div className="border-t border-slate-50 mt-4 pt-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>반복 퀘스트 추가하기</span>
                </button>
            </div>
        );
    }

    return (
        <div className="border-t border-slate-50 mt-4 pt-4">
            <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 relative border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-lg font-black text-slate-800 font-display">새 반복 퀘스트</h4>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <HabitForm
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
}

