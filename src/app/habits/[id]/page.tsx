'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHabits } from '@/lib/hooks/useHabits';
import HabitForm, { HabitFormData } from '@/components/habits/HabitForm';
import { ChevronLeft, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditHabitPage() {
    const { habits, updateHabit, deleteHabit, loading: hookLoading } = useHabits();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const habit = habits.find((h) => h.id === id);

    useEffect(() => {
        if (!hookLoading && !habit) {
            router.push('/habits');
        }
    }, [habit, hookLoading, router]);

    const handleSubmit = async (data: HabitFormData) => {
        setIsSubmitting(true);
        try {
            await updateHabit(id, data);
            router.push('/habits');
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 이 습관을 삭제하시겠습니까? 관련 기록이 모두 삭제됩니다.')) return;

        setIsDeleting(true);
        try {
            await deleteHabit(id);
            router.push('/habits');
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
        }
    };

    if (hookLoading || !habit) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link
                        href="/habits"
                        className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">돌아가기</span>
                    </Link>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="inline-flex items-center px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        삭제하기
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 font-display mb-2">습관 수정하기</h1>
                        <p className="text-slate-500">습관의 내용을 변경하거나 난이도를 조정해보세요.</p>
                    </div>

                    <HabitForm
                        initialData={habit}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
}
