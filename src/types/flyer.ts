export interface Flyer {
    id: number;
    uuid: string;
    title: string;
    description: string | null;
    image_url: string | null;  // 썸네일

    // 신규 필드
    template_id: string;
    form_data: any; // JSONB
    html_url: string | null;
    html_content: string | null; // 백업용 (null 가능으로 변경)

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
    // 향후 템플릿별 추가 데이터가 들어올 수 있음
    [key: string]: any;
}

export interface CreateFlyerData {
    title: string;
    description: string;
    image_url: string | null;
    template_id: string;
    form_data: any;
    html_url?: string;
    html_content?: string;
    user_id: string;
}

export interface UpdateFlyerData {
    title: string;
    description: string;
    image_url: string | null;
    template_id?: string;
    form_data?: any;
    html_url?: string;
    html_content?: string;
}
