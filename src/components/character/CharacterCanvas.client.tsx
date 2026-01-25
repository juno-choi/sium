'use client';

import { useEffect, useRef } from 'react';
import { useSpineAssets } from '@/lib/hooks/useSpineAssets';
import { PixiSpineCharacter } from '@/lib/pixi/PixiSpineCharacter';
import { CharacterCanvasProps } from './CharacterCanvas.types';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';

export default function CharacterCanvasClient({
  characterId,
  width = 400,
  height = 500,
  animationName = 'idle',
  loop = true,
  skinName,
  className = '',
}: CharacterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixiCharacterRef = useRef<PixiSpineCharacter | null>(null);
  const isInitializing = useRef(false);
  const { urls, loading, error, refetch } = useSpineAssets(characterId);

  useEffect(() => {
    // URLs가 없거나 로딩 중이거나 에러가 있으면 생성 안 함
    if (!urls || loading || error || !containerRef.current) return;

    // 이미 초기화 중이거나 인스턴스가 있으면 중복 생성 방지
    if (isInitializing.current || pixiCharacterRef.current) return;

    console.log('[CharacterCanvas] PixiJS 캐릭터 생성 시도');
    isInitializing.current = true;

    // PixiJS Spine 캐릭터 생성
    const instance = new PixiSpineCharacter(containerRef.current, {
      jsonUrl: urls.json,
      atlasUrl: urls.atlas,
      pngUrl: urls.png,
      animationName,
      skinName,
      width,
      height,
    });

    pixiCharacterRef.current = instance;

    return () => {
      console.log('[CharacterCanvas] Cleanup 실행');
      if (pixiCharacterRef.current) {
        pixiCharacterRef.current.destroy();
        pixiCharacterRef.current = null;
      }
      isInitializing.current = false;
    };
  }, [urls, loading, error, width, height]);

  // 애니메이션 변경
  useEffect(() => {
    if (pixiCharacterRef.current && animationName) {
      pixiCharacterRef.current.setAnimation(animationName, loop);
    }
  }, [animationName, loop]);

  // 스킨 변경
  useEffect(() => {
    if (pixiCharacterRef.current && skinName) {
      pixiCharacterRef.current.setSkin(skinName);
    }
  }, [skinName]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 p-6 bg-red-50 border-2 border-red-200 rounded-xl ${className}`}>
        <AlertCircle className="w-8 h-8 text-red-500" />
        <div className="text-center">
          <p className="text-sm font-semibold text-red-900">캐릭터를 불러올 수 없습니다</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-3 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl ${className}`}>
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        <span className="text-sm font-medium text-indigo-700">캐릭터를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}
