export interface Character {
    id: number;
    name: string;
    description: string;
    base_image_url: string;
    created_at: string;
}

export interface UserCharacter {
    id: string;
    user_id: string;
    character_id: number;
    current_xp: number;
    current_level: number;
    gold: number;

    // Customization
    hair_style: string;
    face_shape: string;
    skin_color: string;

    created_at: string;
    updated_at: string;

    // Joined fields
    character?: Character;
}

export interface CustomizationOption {
    id: number;
    category: 'hair' | 'face' | 'skin';
    name: string;
    value: string;
    price: number;
    is_default: boolean;
}
