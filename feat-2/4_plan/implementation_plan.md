# 장비 시스템 제거 및 레벨업 이미지 시스템 도입

## 목표
1. 기존 장비 시스템(모자, 상의, 하의, 신발, 장갑, 무기) 완전 삭제
2. 캐릭터 레벨에 따른 외형 변화 시스템 도입 (1레벨, 10레벨, 20레벨 등)

---

## 배경
현재 장비 시스템은 복잡한 에셋 관리와 경로 문제로 인해 유지보수가 어렵습니다. 이를 단순화하고, 레벨업에 따른 시각적 보상을 명확하게 제공하기 위해 **레벨별 캐릭터 이미지 변경 시스템**으로 전환합니다.

---

## 주요 변경사항

### 1. 삭제 대상 (장비 시스템)

#### 데이터베이스 (SQL)
- `equipment_items` 테이블 DROP
- `user_equipment` 테이블 DROP
- 관련 RLS 정책 삭제

#### 코드
- `src/types/equipment.ts` 삭제
- `src/lib/hooks/useEquipment.ts` 삭제
- `src/lib/hooks/useShop.ts` 삭제
- `src/app/shop/page.tsx` 삭제 또는 비활성화
- `src/app/character/page.tsx` 장비 관련 UI 제거
- `src/components/Header.tsx` 상점 링크 제거 (필요 시)
- 관련 에셋 폴더 정리 (`public/assets/warrior/novice/...` 등 장비 에셋)

### 2. 추가/수정 대상 (레벨업 이미지 시스템)

#### 데이터베이스
- `characters` 테이블에 `level_images` 컬럼 추가 (JSONB)
  - 예: `{"1": "warrior_lv1.png", "10": "warrior_lv10.png", "20": "warrior_lv20.png"}`
- 또는 별도 `character_level_images` 테이블 생성

#### 코드
- `src/types/character.ts` 수정 (레벨 이미지 타입 추가)
- `src/lib/utils/getLevelImage.ts` 유틸 함수 생성
  - 입력: `level`, `levelImages` 객체
  - 출력: 해당 레벨에 맞는 이미지 경로
- `CharacterStatus.tsx` 수정 (레벨에 따른 이미지 동적 로딩)
- `CharacterPage.tsx` 수정 (레벨 이미지 표시)

#### 에셋
- 레벨별 캐릭터 이미지 준비 (예: `warrior_lv1.png`, `warrior_lv10.png`, `warrior_lv20.png`)

---

## 검증 계획

### 자동화 테스트
- 빌드 성공 확인 (`npm run build`)
- 타입 에러 없음 확인

### 수동 테스트
1. 대시보드: 레벨에 따른 캐릭터 이미지 정상 표시
2. 캐릭터 페이지: 레벨 이미지 정상 표시
3. 상점 페이지: 삭제 또는 접근 불가 확인
4. 레벨업 시 이미지 변경 확인

---

## 단계별 작업 순서

1. **[SQL] 장비 테이블 삭제 스크립트 작성**
2. **[SQL] 레벨 이미지 컬럼/테이블 추가**
3. **[Code] 장비 관련 코드 삭제**
4. **[Code] 레벨 이미지 유틸 함수 생성**
5. **[Code] UI 컴포넌트 수정**
6. **[Asset] 레벨별 이미지 배치**
7. **[Test] 빌드 및 기능 테스트**

---

## 질문/확인 사항

> [!IMPORTANT]
> 1. 레벨 구간을 어떻게 나눌까요? (예: 1, 10, 20, 30, 50?)
> 2. 상점(`/shop`) 페이지를 완전히 삭제할까요, 아니면 나중을 위해 비활성화만 할까요?
> 3. 골드 시스템은 유지할까요? (퀘스트 완료 시 골드 획득 등)
