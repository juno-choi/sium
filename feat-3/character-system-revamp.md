# 캐릭터 시스템 개편 계획서

## 1. 개요

### 1.1 현재 시스템
- 캐릭터 선택 시 레벨에 따른 정적 이미지(`level_images`) 표시
- `getLevelImage()` 유틸로 레벨별 이미지 URL 반환
- Next.js `<Image>` 컴포넌트로 단순 렌더링

### 1.2 목표 시스템
- **기본 캐릭터**: 단일 Spine 스켈레톤 기반 캐릭터
- **장비 시스템**: 헤어, 의상, 무기 등을 Gold로 구매하여 장착
- **Spine 애니메이션**: Phaser를 사용하여 Idle 애니메이션 표시
- **에셋 보안**: Supabase Private Storage + Signed URL 방식

---

## 2. 기술 스택 변경

| 영역 | 현재 | 변경 후 |
|------|------|---------|
| 캐릭터 렌더링 | Next.js Image | **Phaser 3 + spine-phaser** |
| 에셋 저장소 | Public 폴더 / 외부 URL | **Supabase Private Storage** |
| 장비 시스템 | 없음 | **Spine Skins 기반 커스터마이징** |

---

## 3. 데이터베이스 스키마 변경

### 3.1 기존 테이블 수정

```sql
-- characters 테이블 수정 (level_images 컬럼 제거)
ALTER TABLE public.characters DROP COLUMN IF EXISTS level_images;

-- 새 컬럼 추가: Spine 파일 경로
ALTER TABLE public.characters 
  ADD COLUMN spine_skeleton_key VARCHAR(100),  -- 'casual-character'
  ADD COLUMN spine_atlas_key VARCHAR(100);     -- 'casual-character-atlas'
```

### 3.2 새 테이블: 장비 마스터

```sql
CREATE TABLE public.equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slot VARCHAR(50) NOT NULL,  -- 'hair', 'top', 'bottom', 'helmet', 'boots', 'gloves', 'gear_right', 'gear_left', 'back'
  skin_name VARCHAR(100) NOT NULL,  -- Spine skin name (예: 'hair/hair_c_1')
  preview_image_url VARCHAR(255),
  price INT DEFAULT 0 NOT NULL,
  rarity VARCHAR(20) DEFAULT 'common',  -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment viewable by all" ON public.equipment FOR SELECT USING (true);
```

### 3.3 새 테이블: 유저 보유 장비

```sql
CREATE TABLE public.user_equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  equipment_id INT REFERENCES public.equipment(id) NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, equipment_id)
);

ALTER TABLE public.user_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own equipment" ON public.user_equipment FOR ALL USING (auth.uid() = user_id);
```

### 3.4 새 테이블: 장착 상태

```sql
CREATE TABLE public.user_equipped (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot VARCHAR(50) NOT NULL,  -- 'hair', 'top', etc.
  equipment_id INT REFERENCES public.equipment(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

ALTER TABLE public.user_equipped ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own equipped items" ON public.user_equipped FOR ALL USING (auth.uid() = user_id);
```

---

## 4. Supabase Storage 구성

### 4.1 버킷 구조

```
assets (Private Bucket)
├── spine/
│   ├── casual-character.json
│   ├── casual-character.atlas
│   ├── casual-character.png
│   ├── chicken.json
│   ├── chicken.atlas
│   └── chicken.png
└── previews/
    ├── hair/
    ├── top/
    └── ...
```

### 4.2 RLS 정책

```sql
-- Storage RLS: 인증된 사용자만 접근
CREATE POLICY "Authenticated users can read assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets');
```

---

## 5. 프론트엔드 구현

### 5.1 폴더 구조 (신규/수정)

```
src/
├── components/
│   ├── character/
│   │   ├── CharacterCanvas.tsx      # Phaser 캔버스 래퍼 (신규)
│   │   ├── CharacterStatus.tsx      # 수정: Image → CharacterCanvas
│   │   └── EquipmentSlot.tsx        # 장비 슬롯 UI (신규)
│   ├── shop/
│   │   ├── EquipmentShop.tsx        # 장비 상점 (신규)
│   │   └── EquipmentCard.tsx        # 장비 카드 (신규)
│   └── providers/
│       └── CharacterProvider.tsx    # 수정: 장비 상태 추가
├── lib/
│   ├── phaser/
│   │   ├── SpineCharacterScene.ts   # Phaser Scene (신규)
│   │   └── useSpineAssets.ts        # Signed URL 로더 (신규)
│   └── hooks/
│       ├── useEquipment.ts          # 장비 관리 훅 (신규)
│       └── useCharacter.ts          # 수정
├── types/
│   └── equipment.ts                 # 장비 타입 (신규)
└── app/
    ├── character/
    │   └── page.tsx                 # 수정: 장비 커스터마이징 UI
    └── shop/
        └── page.tsx                 # 장비 상점 페이지 (신규)
```

### 5.2 핵심 컴포넌트: CharacterCanvas.tsx

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { SpineCharacterScene } from '@/lib/phaser/SpineCharacterScene';

interface CharacterCanvasProps {
  skeletonUrl: string;
  atlasUrl: string;
  animation?: string;
  equippedSkins?: string[];  // ['hair/hair_c_1', 'top/top_c_1', ...]
  width?: number;
  height?: number;
}

export default function CharacterCanvas({
  skeletonUrl,
  atlasUrl,
  animation = 'idle1',
  equippedSkins = [],
  width = 200,
  height = 300
}: CharacterCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width,
      height,
      transparent: true,
      scene: new SpineCharacterScene({
        skeletonUrl,
        atlasUrl,
        animation,
        equippedSkins
      })
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [skeletonUrl, atlasUrl, animation, equippedSkins, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
}
```

### 5.3 Signed URL 로더

```ts
// src/lib/phaser/useSpineAssets.ts
import { createClient } from '@/lib/supabase/client';

export async function getSpineAssetUrls(characterKey: string) {
  const supabase = createClient();
  const expiresIn = 3600; // 1시간

  const [skeleton, atlas, texture] = await Promise.all([
    supabase.storage.from('assets').createSignedUrl(`spine/${characterKey}.json`, expiresIn),
    supabase.storage.from('assets').createSignedUrl(`spine/${characterKey}.atlas`, expiresIn),
    supabase.storage.from('assets').createSignedUrl(`spine/${characterKey}.png`, expiresIn),
  ]);

  return {
    skeletonUrl: skeleton.data?.signedUrl,
    atlasUrl: atlas.data?.signedUrl,
    textureUrl: texture.data?.signedUrl,
  };
}
```

---

## 6. 구현 단계 (Phase)

### Phase 1: 기반 구축 (1-2일)
- [ ] Supabase Storage에 `assets` Private Bucket 생성
- [ ] Spine 런타임 파일 업로드 (json, atlas, png)
- [ ] Storage RLS 정책 설정
- [ ] 패키지 설치: `phaser`, `@esotericsoftware/spine-phaser`

### Phase 2: Phaser 통합 (2-3일)
- [ ] `SpineCharacterScene.ts` 구현
- [ ] `CharacterCanvas.tsx` 컴포넌트 구현
- [ ] `useSpineAssets.ts` (Signed URL 로더) 구현
- [ ] 기존 `CharacterStatus.tsx`에서 Image를 CharacterCanvas로 교체

### Phase 3: DB 스키마 & 장비 시스템 (2-3일)
- [ ] 새 테이블 생성 (equipment, user_equipment, user_equipped)
- [ ] 초기 장비 데이터 시드 (Spine skin 이름 기반)
- [ ] `useEquipment.ts` 훅 구현
- [ ] CharacterProvider에 장비 상태 통합

### Phase 4: 장비 상점 & UI (2-3일)
- [ ] `/shop` 페이지 및 `EquipmentShop.tsx` 구현
- [ ] 장비 구매 로직 (Gold 차감)
- [ ] `/character` 페이지에 장비 장착 UI 추가
- [ ] Spine Skin 변경 로직 연동

### Phase 5: 테스트 & 최적화 (1-2일)
- [ ] 다양한 장비 조합 테스트
- [ ] 애니메이션 전환 테스트 (Idle, Walk 등)
- [ ] 모바일 대응 확인
- [ ] 에셋 로딩 최적화 (캐싱 전략)

---

## 7. Spine Skin 구조 (LAYERLAB 에셋 기준)

에셋의 JSON 파일 분석 결과, 다음과 같은 Skin 슬롯 구조를 사용합니다:

| 슬롯 | Skin 이름 패턴 | 예시 |
|------|----------------|------|
| 헤어 | `hair_short/hair_short_c_N` | `hair_short/hair_short_c_1` |
| 헬멧 | `helmet/helmet_c_N` | `helmet/helmet_c_5` |
| 상의 | `top/top_c_N` | `top/top_c_10` |
| 하의 | `bottom/bottom_c_N` | `bottom/bottom_c_3` |
| 부츠 | `boots/boots_c_N` | `boots/boots_c_7` |
| 장갑 | `gloves/gloves_c_N` | `gloves/gloves_c_2` |
| 무기(우) | `gear_right/gear_right_c_N` | `gear_right/gear_right_c_15` |
| 무기(좌) | `gear_left/gear_left_c_N` | `gear_left/gear_left_c_8` |
| 등장비 | `back/back_c_N` | `back/back_c_12` |

### Skin 적용 예시 (Phaser)

```ts
// SpineCharacterScene.ts 내부
const customSkin = spine.skeleton.data.findSkin('full_skins');
const combinedSkin = new spine.Skin('combined');

// 기본 스킨 복사
combinedSkin.copySkin(customSkin);

// 장착된 스킨들 추가
equippedSkins.forEach(skinName => {
  const skin = spine.skeleton.data.findSkin(skinName);
  if (skin) combinedSkin.addSkin(skin);
});

spine.skeleton.setSkin(combinedSkin);
spine.skeleton.setSlotsToSetupPose();
```

---

## 8. 예상 이슈 및 해결책

| 이슈 | 해결책 |
|------|--------|
| Phaser SSR 오류 | `dynamic import`로 클라이언트 전용 로드 |
| Signed URL 만료 | 게임 시작 직전에 URL 발급, 1시간 유효기간 설정 |
| 에셋 로딩 지연 | 로딩 스피너 표시, 프리로드 전략 |
| Spine 버전 불일치 | spine-phaser 4.2.x 버전 사용 (에셋이 4.2.43으로 제작됨) |

---

## 9. 마일스톤

| 주차 | 목표 |
|------|------|
| 1주차 | Phase 1 + Phase 2 완료 (Phaser 기반 Idle 캐릭터 표시) |
| 2주차 | Phase 3 + Phase 4 완료 (장비 구매/장착 시스템) |
| 3주차 | Phase 5 완료 + 추가 애니메이션 (Walk, Attack 등) |

---

## 10. 참고 자료

- [Phaser 3 공식 문서](https://phaser.io/phaser3)
- [spine-phaser 런타임](https://esotericsoftware.com/spine-phaser)
- [Supabase Storage Signed URLs](https://supabase.com/docs/guides/storage/serving/downloads#signed-urls)
- [LAYERLAB 2D Art Maker 문서](https://layerlab.io/products/2d-art-maker-casual-character)
