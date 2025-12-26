export type HabitDifficulty = 'easy' | 'normal' | 'hard';

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    difficulty: HabitDifficulty;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
    sun: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface HabitLog {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string;
    xp_earned: number;
    gold_earned: number;
    created_at: string;
}

