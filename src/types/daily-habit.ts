import { HabitDifficulty } from './habit';

export interface DailyHabit {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    difficulty: HabitDifficulty;
    quest_date: string;
    is_active: boolean;
    created_at: string;
}

export interface DailyHabitWithCompletion extends DailyHabit {
    is_completed: boolean;
}
