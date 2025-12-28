# 캐릭터 시스템 수정 계획

## 개요

세 가지 문제를 수정합니다:
1. **캐릭터 선택 유지 문제**: 로그인 시 기존 선택한 캐릭터로 자동 진행되지 않음
2. **커스터마이징 기능 삭제**: 헤어, 성형, 피부 기능 모두 제거
3. **장비 슬롯 변경**: 얼굴(face_accessory) 삭제, 무기(weapon) 추가

---

## 문제 분석

### 1. 캐릭터 선택 유지 문제

**현재 동작:**
- `dashboard/page.tsx` (line 18-21)에서 `character`가 없으면 `/character-select`로 리다이렉트
- `CharacterProvider.tsx` (line 76)에서 `is_active`가 true인 캐릭터를 찾아서 active로 설정
- DB에 `is_active`가 저장되어 있어도, 로딩 상태에서 일시적으로 `character`가 null이면 리다이렉트 발생 가능

**원인 추정:**
- `character-select` 페이지에서 이미 캐릭터가 있는지 확인하지 않음
- 로그인 후 `/character-select`로 먼저 이동하는 경우, 기존 캐릭터 체크 없이 화면 표시

---

### 2. 커스터마이징 기능

**현재 구현:**
- `character/page.tsx`의 "커스터마이징" 탭에서 헤어/성형/피부 옵션 제공
- `useCustomization.ts` 훅과 `customization_options` 테이블 사용

---

### 3. 장비 슬롯

**현재 슬롯:**
```typescript
// equipment.ts
type EquipmentSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'face_accessory';
```

**변경 후:**
```typescript
type EquipmentSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'weapon';
```

---

## Proposed Changes

### 1. 캐릭터 선택 유지 수정

#### [MODIFY] [page.tsx](file:///c:/project/personal/2025/sium/src/app/character-select/page.tsx)

```diff
export default function CharacterSelectPage() {
    const { availableCharacters, selectCharacter, loading: hookLoading, character } = useCharacter();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

+   // 이미 캐릭터가 있으면 대시보드로 리다이렉트
+   useEffect(() => {
+       if (!hookLoading && character) {
+           router.push('/dashboard');
+       }
+   }, [hookLoading, character, router]);

    if (hookLoading) { ... }

+   // 캐릭터가 있으면 아무것도 렌더링하지 않음 (리다이렉트 중)
+   if (character) return null;

    return ( ... );
}
```

---

### 2. 커스터마이징 기능 삭제

#### [MODIFY] [page.tsx](file:///c:/project/personal/2025/sium/src/app/character/page.tsx)

**변경 사항:**
1. `useCustomization` 훅 import 제거
2. "커스터마이징" 탭 및 관련 UI 제거
3. 기본 탭을 "보유 장비"로 변경
4. `activeSubTab` 기본값을 장비 슬롯으로 변경

```diff
- import { useCustomization } from '@/lib/hooks/useCustomization';
- const { options, changeOption, loading: customLoading } = useCustomization();
- const [activeMainTab, setActiveMainTab] = useState<'appearance' | 'equipment'>('appearance');
+ const [activeSubTab, setActiveSubTab] = useState<string>('hat');

// 메인 탭 UI 완전 제거, 장비 탭만 남김
```

---

### 3. 장비 슬롯 변경 (얼굴 → 무기)

#### [MODIFY] [equipment.ts](file:///c:/project/personal/2025/sium/src/types/equipment.ts)

```diff
- export type EquipmentSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'face_accessory';
+ export type EquipmentSlot = 'hat' | 'top' | 'bottom' | 'shoes' | 'gloves' | 'weapon';
```

#### [MODIFY] [useEquipment.ts](file:///c:/project/personal/2025/sium/src/lib/hooks/useEquipment.ts)

```diff
const [equippedItems, setEquippedItems] = useState<Record<EquipmentSlot, UserEquipment | null>>({
    hat: null,
    top: null,
    bottom: null,
    shoes: null,
    gloves: null,
-   face_accessory: null,
+   weapon: null,
});

// newEquipped 객체도 동일하게 수정
```

#### [MODIFY] [page.tsx](file:///c:/project/personal/2025/sium/src/app/character/page.tsx)

Sub tabs 슬롯 변경:
```diff
- {['hat', 'top', 'bottom', 'shoes', 'gloves', 'face_accessory'].map(slot => (
+ {['hat', 'top', 'bottom', 'shoes', 'gloves', 'weapon'].map(slot => (
    <button ...>
-     {slot === 'hat' ? '모자' : slot === 'top' ? '상의' : slot === 'bottom' ? '하의' : slot === 'shoes' ? '신발' : slot === 'gloves' ? '장갑' : '얼굴'}
+     {slot === 'hat' ? '모자' : slot === 'top' ? '상의' : slot === 'bottom' ? '하의' : slot === 'shoes' ? '신발' : slot === 'gloves' ? '장갑' : '무기'}
    </button>
))}
```

---

## 파일 변경 요약

| 파일 | 변경 내용 |
|------|-----------|
| `character-select/page.tsx` | 기존 캐릭터 존재 시 대시보드로 리다이렉트 |
| `character/page.tsx` | 커스터마이징 탭 삭제, 장비 탭만 유지, 얼굴→무기 슬롯 변경 |
| `equipment.ts` | `face_accessory` → `weapon` 타입 변경 |
| `useEquipment.ts` | `face_accessory` → `weapon` 슬롯 변경 |

---

## Verification Plan

### Manual Verification

> [!NOTE]
> 프로젝트에 자동화된 테스트가 없으므로 수동 테스트를 수행합니다.

**테스트 방법:**
1. `npm run dev`로 개발 서버 실행
2. 브라우저에서 `http://localhost:3000` 접속

**테스트 시나리오:**

#### 1. 캐릭터 선택 유지 테스트
1. 로그인하여 캐릭터 선택 후 대시보드 진입
2. 브라우저 새로고침 또는 로그아웃 후 재로그인
3. **기대 결과**: 캐릭터 선택 화면을 거치지 않고 바로 대시보드로 이동

#### 2. 커스터마이징 제거 확인
1. `/character` 페이지 접속
2. **기대 결과**: "커스터마이징" 탭이 사라지고 "보유 장비"만 표시됨

#### 3. 장비 슬롯 변경 확인
1. `/character` 페이지에서 장비 탭 확인
2. **기대 결과**: 
   - "얼굴" 슬롯이 사라지고 "무기" 슬롯이 표시됨
   - 슬롯 순서: 모자, 상의, 하의, 신발, 장갑, 무기

---

## 구현 순서

1. `equipment.ts` 타입 변경
2. `useEquipment.ts` 슬롯 변경
3. `character/page.tsx` UI 수정 (커스터마이징 제거 + 슬롯 변경)
4. `character-select/page.tsx` 리다이렉트 로직 추가
5. 수동 테스트 수행
