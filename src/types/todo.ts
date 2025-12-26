import { Habit } from './habit';

export interface TodoItem extends Habit {
    is_completed: boolean;
    completed_at?: string;
    xp_earned?: number;
}
