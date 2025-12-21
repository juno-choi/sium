export interface Flyer {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    image_url: string | null;  // 썸네일
    html_content: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    users?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export interface FlyerFormData {
    title: string;
    description: string;
    imageUrls: string[];  // 업로드된 이미지 URL 배열
}

export interface CreateFlyerData {
    title: string;
    description: string;
    image_url: string | null;
    html_content: string;
    user_id: string;
}

export interface UpdateFlyerData {
    title: string;
    description: string;
    image_url: string | null;
    html_content: string;
}
