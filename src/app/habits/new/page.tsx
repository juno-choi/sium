'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHabits } from '@/lib/hooks/useHabits';
import HabitForm from '@/components/habits/HabitForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHabitPage() {
    const { addHabit } = useHabits();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [formKey, setFormKey] = useState(0);
    const router = useRouter();

    const samples = [
        {
            id: 'exercise',
            label: '🏃 운동하기',
            data: {
                title: '운동하기',
                description: '30분간 전신 운동을 완료하고 체력을 단련합니다.',
                difficulty: 'normal',
                mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true
            }
        },
        {
            id: 'study',
            label: '📚 공부하기',
            data: {
                title: '공부하기',
                description: '1시간 동안 집중해서 공부하고 지력을 높입니다.',
                difficulty: 'hard',
                mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false
            }
        }
    ];

    const handleSampleClick = (sampleData: any) => {
        setInitialData(sampleData);
        setFormKey(prev => prev + 1);
    };

    const handleSubmit = async (data: any) => {
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

                    {/* Samples Section */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3 px-1">
                            초보 모험가를 위한 추천 퀘스트
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {samples.map((sample) => (
                                <button
                                    key={sample.id}
                                    type="button"
                                    onClick={() => handleSampleClick(sample.data)}
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
                                >
                                    {sample.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <HabitForm key={formKey} initialData={initialData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                </div>
            </div>
        </div>
    );
}
