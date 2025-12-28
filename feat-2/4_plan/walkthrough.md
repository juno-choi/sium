# 장비 시스템 제거 및 레벨업 이미지 시스템 구현 완료

## 요약
기존 장비 시스템(모자, 상의, 하의, 신발, 장갑, 무기)을 완전히 제거하고, 캐릭터 레벨(1, 10, 20)에 따른 이미지 변경 시스템을 도입했습니다.

## 변경된 파일

### 삭제된 파일
- `src/types/equipment.ts`
- `src/lib/hooks/useEquipment.ts`

### 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `supabase/schema.sql` | `equipment_items`, `user_equipment` 테이블 삭제. `characters` 테이블에 `level_images` JSONB 컬럼 추가 |
| `src/types/character.ts` | `Character` 인터페이스에 `level_images` 필드 추가 |
| `src/lib/hooks/useShop.ts` | 장비 구매 로직 제거, 캐릭터 구매만 유지 |
| `src/app/character/page.tsx` | 장비 탭/UI 제거, 동료 목록만 표시 |
| `src/app/shop/page.tsx` | 장비 섹션 제거, 캐릭터 구매만 표시 |
| `src/components/character/CharacterStatus.tsx` | 레벨별 이미지 표시 로직 추가 |

### 신규 파일
- `src/lib/utils/getLevelImage.ts` - 레벨에 따른 이미지 파일명 반환 유틸

## 레벨 이미지 시스템

### 구조
```json
// characters.level_images 컬럼 예시
{
  "1": "warrior_lv1.png",
  "10": "warrior_lv10.png",
  "20": "warrior_lv20.png"
}
```

### 이미지 경로
`public/assets/characters/` 폴더에 이미지 파일 배치

### 동작
- 레벨 1~9: `warrior_lv1.png`
- 레벨 10~19: `warrior_lv10.png`
- 레벨 20+: `warrior_lv20.png`

## 검증
- ✅ `npm run build` 성공
- ⏳ 기능 테스트 대기 (레벨별 이미지 변경 확인)

## 다음 단계
1. `public/assets/characters/` 폴더에 레벨별 캐릭터 이미지 배치
2. Supabase DB에 스키마 적용 (마이그레이션 또는 리셋)
3. 화면에서 레벨업 시 이미지 변경 확인
