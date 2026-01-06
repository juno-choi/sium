'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHabits } from '@/lib/hooks/useHabits';
import HabitForm, { HabitFormData } from '@/components/habits/HabitForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHabitPage() {
    const { addHabit } = useHabits();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (data: HabitFormData) => {
        setIsSubmitting(true);
        try {
            await addHabit(data);
            router.push('/habits');
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <Link
                    href="/habits"
                    className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition mb-6 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">돌아가기</span>
                </Link>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 font-display mb-2">새로운 퀘스트 만들기</h1>
                        <p className="text-slate-500">지속하고 싶은 좋은 습관을 정의해보세요.</p>
                    </div>

                    <HabitForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>
            </div>
        </div>
    );
}
