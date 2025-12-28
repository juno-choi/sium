export type EquipmentSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'weapon';

export interface EquipmentItem {
    id: number;
    name: string;
    slot: EquipmentSlot;
    image_url: string;
    price: number;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    created_at: string;
}

export interface UserEquipment {
    id: string;
    user_id: string;
    item_id: number;
    is_equipped: boolean;
    purchased_at: string;

    // Joined field
    item?: EquipmentItem;
}
