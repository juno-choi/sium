'use client';

interface DaySelectProps {
    days: {
        mon: boolean;
        tue: boolean;
        wed: boolean;
        thu: boolean;
        fri: boolean;
        sat: boolean;
        sun: boolean;
    };
    onChange: (days: any) => void;
}

const daysList = [
    { key: 'mon', label: '월' },
    { key: 'tue', label: '화' },
    { key: 'wed', label: '수' },
    { key: 'thu', label: '목' },
    { key: 'fri', label: '금' },
    { key: 'sat', label: '토' },
    { key: 'sun', label: '일' },
];

export default function DaySelect({ days, onChange }: DaySelectProps) {
    const toggleDay = (key: string) => {
        onChange({
            ...days,
            [key]: !days[key as keyof typeof days],
        });
    };

    return (
        <div className="flex justify-between gap-1">
            {daysList.map((day) => {
                const isSelected = days[day.key as keyof typeof days];
                return (
                    <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`flex-1 aspect-square rounded-xl text-sm font-bold transition-all border-2 ${isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                    >
                        {day.label}
                    </button>
                );
            })}
        </div>
    );
}
