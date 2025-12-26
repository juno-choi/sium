# 🚀 구현 단계별 계획

## Phase 1: 기반 정리 및 DB 설정 (1-2일)

### 1.1 기존 코드 정리

- [ ] 전단지 관련 파일 삭제
  - `src/app/flyers/`
  - `src/app/[userUuid]/`
  - `src/app/test/`
  - `src/components/flyers/`
  - `src/components/ImageUpload.tsx`
  - `src/lib/flyer-template.ts`
  - `src/lib/storage/`
  - `src/types/flyer.ts`
- [ ] 기존 Supabase 테이블 정리 (flyers 테이블 삭제)
- [ ] Header 컴포넌트 수정 (메뉴 변경)

### 1.2 새로운 DB 스키마 적용

- [ ] `supabase/schema.sql` 업데이트
  - characters 테이블
  - character_evolutions 테이블
  - user_characters 테이블
  - habits 테이블
  - habit_logs 테이블
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 초기 캐릭터 데이터 시드

### 1.3 타입 정의

- [ ] `src/types/character.ts` 생성
- [ ] `src/types/habit.ts` 생성
- [ ] `src/types/todo.ts` 생성

---

## Phase 2: 캐릭터 시스템 (2-3일)

### 2.1 캐릭터 선택 페이지

- [ ] `src/app/character-select/page.tsx`
- [ ] 캐릭터 카드 컴포넌트
- [ ] 선택 UI 및 애니메이션
- [ ] Supabase 저장 연동

### 2.2 캐릭터 상태 관리

- [ ] `src/lib/hooks/useCharacter.ts`
- [ ] 경험치/레벨 계산 유틸리티
- [ ] CharacterStatus 컴포넌트
- [ ] LevelProgress (경험치 바) 컴포넌트

### 2.3 캐릭터 이미지

- [ ] 3가지 기본 캐릭터 이미지 준비 (또는 이모지/SVG)
- [ ] 각 캐릭터별 3단계 진화 이미지

---

## Phase 3: 습관 관리 시스템 (2-3일)

### 3.1 습관 CRUD

- [ ] `src/app/habits/page.tsx` - 목록
- [ ] `src/app/habits/new/page.tsx` - 추가
- [ ] `src/app/habits/[id]/page.tsx` - 상세/수정
- [ ] `src/lib/hooks/useHabits.ts`

### 3.2 습관 폼 컴포넌트

- [ ] HabitForm 컴포넌트
- [ ] DifficultySelect 컴포넌트
- [ ] DaySelect 컴포넌트
- [ ] 폼 유효성 검사

### 3.3 습관 목록 컴포넌트

- [ ] HabitCard 컴포넌트
- [ ] HabitList 컴포넌트
- [ ] 수정/삭제 기능

---

## Phase 4: Todo 리스트 시스템 (2-3일)

### 4.1 대시보드 페이지

- [ ] `src/app/dashboard/page.tsx`
- [ ] 오늘 날짜 기반 필터링 로직
- [ ] `src/lib/hooks/useTodoList.ts`

### 4.2 Todo 컴포넌트

- [ ] TodoItem 컴포넌트
- [ ] TodoList 컴포넌트
- [ ] ClearButton 컴포넌트

### 4.3 Clear 처리

- [ ] 완료 시 habit_logs 기록
- [ ] 경험치 지급 로직
- [ ] 레벨업 체크 및 처리
- [ ] 경험치 획득 애니메이션

---

## Phase 5: 레벨업 & 진화 시스템 (1-2일)

### 5.1 레벨업 로직

- [ ] 경험치 → 레벨 계산 함수
- [ ] 레벨업 감지 로직

### 5.2 레벨업 UI

- [ ] 레벨업 모달/알림
- [ ] 축하 애니메이션
- [ ] 진화 시 외형 변경 연출

---

## Phase 6: 마무리 & 폴리싱 (1-2일)

### 6.1 UI 개선

- [ ] 전체 반응형 테스트
- [ ] 애니메이션 튜닝
- [ ] 다크모드 지원 (선택)

### 6.2 UX 개선

- [ ] 로딩 상태 처리
- [ ] 에러 핸들링
- [ ] 빈 상태 UI (습관 없을 때)

### 6.3 인증 플로우

- [ ] 미로그인 시 리다이렉트
- [ ] 캐릭터 미선택 시 선택 페이지로 리다이렉트

---

## 우선순위 정리

| 순위 | 기능 | 중요도 |
|------|------|--------|
| 1 | DB 스키마 & 기존 코드 정리 | 🔴 필수 |
| 2 | 캐릭터 선택 | 🔴 필수 |
| 3 | 습관 추가/관리 | 🔴 필수 |
| 4 | 오늘의 Todo & Clear | 🔴 필수 |
| 5 | 경험치 & 레벨업 | 🔴 필수 |
| 6 | 캐릭터 진화 연출 | 🟡 권장 |
| 7 | 애니메이션 | 🟡 권장 |
| 8 | 다크모드 | 🟢 선택 |

---

## 예상 일정

| Phase | 예상 소요 |
|-------|----------|
| Phase 1 | 1-2일 |
| Phase 2 | 2-3일 |
| Phase 3 | 2-3일 |
| Phase 4 | 2-3일 |
| Phase 5 | 1-2일 |
| Phase 6 | 1-2일 |
| **총합** | **9-15일** |
