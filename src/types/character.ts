export interface Character {
    id: number;
    name: string;
    description: string;
    base_image_url: string;
    level_images?: Record<string, string> | null; // {"1": "img1.png", "10": "img10.png", "20": "img20.png"}
    price: number;
    created_at: string;
}

export interface UserCharacter {
    id: string;
    user_id: string;
    character_id: number;
    current_xp: number;
    current_level: number;
    is_active: boolean;

    created_at: string;
    updated_at: string;

    // Joined fields
    character?: Character;
}

export interface UserProfile {
    id: number;
    uuid: string;
    email: string;
    full_name: string;
    avatar_url: string;
    gold: number;
}
