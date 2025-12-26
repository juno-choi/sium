export interface Character {
    id: number;
    name: string;
    description: string;
    base_image_url: string;
    created_at: string;
    evolutions?: CharacterEvolution[];
}

export interface CharacterEvolution {
    id: number;
    character_id: number;
    level_required: number;
    image_url: string;
    evolution_name: string;
}

export interface UserCharacter {
    id: string;
    user_id: string;
    character_id: number;
    current_xp: number;
    current_level: number;
    created_at: string;
    updated_at: string;

    // Joined fields
    character?: Character;
}
