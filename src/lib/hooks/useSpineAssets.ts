import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface SpineAssetUrls {
  json: string;
  atlas: string;
  png: string;
}

interface UseSpineAssetsReturn {
  urls: SpineAssetUrls | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSpineAssets(characterId: string): UseSpineAssetsReturn {
  const [urls, setUrls] = useState<SpineAssetUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignedUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const basePath = 'Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation';

      console.log(`[useSpineAssets] 🔍 스토리지 파일 목록 확인 중... (path: ${basePath})`);

      // 1. 실제로 어떤 파일들이 있는지 목록 조회
      const { data: files, error: listError } = await supabase.storage
        .from('assets')
        .list(basePath);

      if (listError) {
        console.error('❌ 파일 목록 조회 실패:', listError);
      } else {
        console.log('✅ 스토리지 내 실제 파일들:', files?.map(f => f.name));
      }

      // 2. 인증 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('인증 세션이 없습니다. 다시 로그인해 주세요.');
      }

      // 3. 3개 파일 병렬 요청
      // 사용자 요청에 따른 원본 파일명 매핑: 
      // Casual Character.json, Casual Character.atlas.txt, Casual Character.png
      const [jsonResult, atlasResult, pngResult] = await Promise.all([
        supabase.storage
          .from('assets')
          .createSignedUrl(`${basePath}/Casual Character.json`, 3600),
        supabase.storage
          .from('assets')
          .createSignedUrl(`${basePath}/Casual Character.atlas.txt`, 3600),
        supabase.storage
          .from('assets')
          .createSignedUrl(`${basePath}/Casual Character.png`, 3600),
      ]);

      // 에러 체크
      if (jsonResult.error) {
        console.error('❌ JSON Signed URL Error:', jsonResult.error);
        throw new Error(`JSON URL 발급 실패: ${jsonResult.error.message}`);
      }
      if (atlasResult.error) {
        console.error('❌ Atlas Signed URL Error:', atlasResult.error);
        throw new Error(`Atlas URL 발급 실패: ${atlasResult.error.message}`);
      }
      if (pngResult.error) {
        console.error('❌ PNG Signed URL Error:', pngResult.error);
        throw new Error(`PNG URL 발급 실패: ${pngResult.error.message}`);
      }

      // URL 저장
      setUrls({
        json: jsonResult.data?.signedUrl || '',
        atlas: atlasResult.data?.signedUrl || '',
        png: pngResult.data?.signedUrl || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Spine assets 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchSignedUrls();
  }, [fetchSignedUrls]);

  return { urls, loading, error, refetch: fetchSignedUrls };
}
