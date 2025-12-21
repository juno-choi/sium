import { createClient } from '@/lib/supabase/client';

interface UploadHTMLParams {
    flyerUuid: string;
    htmlContent: string;
}

interface UploadHTMLResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * HTML 콘텐츠를 Storage에 파일로 업로드
 */
export async function uploadHTMLToStorage({
    flyerUuid,
    htmlContent,
}: UploadHTMLParams): Promise<UploadHTMLResult> {
    try {
        const supabase = createClient();

        // HTML을 Blob으로 변환
        const blob = new Blob([htmlContent], {
            type: 'text/html; charset=utf-8'
        });

        // 파일 경로
        const filePath = `html/${flyerUuid}.html`;

        // Storage에 업로드
        const { error: uploadError } = await supabase.storage
            .from('flyers')
            .upload(filePath, blob, {
                contentType: 'text/html',
                upsert: true, // 덮어쓰기 허용 (재생성 시)
                cacheControl: '3600', // 1시간 캐시
            });

        if (uploadError) throw uploadError;

        // Public URL 생성
        const { data: { publicUrl } } = supabase.storage
            .from('flyers')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('HTML upload failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Storage에서 HTML 파일 조회
 */
export async function fetchHTMLFromStorage(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            cache: 'force-cache', // 캐싱 활용
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error('HTML fetch failed:', error);
        return null;
    }
}

/**
 * Storage에서 HTML 파일 삭제
 */
export async function deleteHTMLFromStorage(flyerUuid: string): Promise<boolean> {
    try {
        const supabase = createClient();
        const filePath = `html/${flyerUuid}.html`;

        const { error } = await supabase.storage
            .from('flyers')
            .remove([filePath]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('HTML delete failed:', error);
        return false;
    }
}
