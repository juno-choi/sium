# 단계 11: 전단지 동적 렌더링 전환 (Refactor)

> [!IMPORTANT]
> **문제 사항**: 현재 전단지는 생성/수정 시 HTML을 정적으로 생성하여 DB(`html_content`) 또는 Storage(`html_url`)에 저장합니다. 이로 인해 `form_data`를 수정하더라도 실제 전단지 화면(HTML)에는 즉시 반영되지 않는 동기화 문제가 발생하고 있습니다.
> **해결 방안**: 전단지 조회 시 저장된 `form_data`를 사용하여 실시간으로 HTML을 생성하는 **동적 렌더링(Dynamic Rendering)** 방식으로 전환합니다.

## [목표]

1. **실시간 동기화**: 전단지 수정 시 별도의 HTML 업데이트 과정 없이 즉시 반영
2. **데이터 일관성**: 원본 데이터(`form_data`)와 보여지는 화면 간의 일치 보장
3. **구조 간소화**: 불필요한 HTML 생성 및 파일 업로드 로직 제거로 성능 및 유지보수성 향상
4. **하위 호환성 유지**: 기존 전단지도 정상 작동하도록 점진적 전환

---

## 주요 변경 사항

### 1. 전단지 렌더링 로직 (조회 페이지)

- **공개 뷰어**: `src/app/[userUuid]/[flyerUuid]/page.tsx`
- **관리 상세**: `src/app/flyers/[id]/page.tsx`

**변경 전**:
```typescript
// Storage 또는 DB에서 미리 생성된 HTML 로드
let htmlContent = '';
if (flyer.html_url) {
    htmlContent = await fetchHTMLFromStorage(flyer.html_url) || '';
}
if (!htmlContent && flyer.html_content) {
    htmlContent = flyer.html_content;
}
```

**변경 후**:
```typescript
// 저장된 form_data를 사용하여 실시간 HTML 생성 (하위 호환성 유지)
let htmlContent = '';
if (flyer.form_data) {
    // 우선: form_data로 동적 생성
    htmlContent = generateFlyerHTML(flyer.template_id, flyer.form_data);
} else if (flyer.html_url) {
    // 폴백 1: Storage에서 로드 (기존 전단지)
    htmlContent = await fetchHTMLFromStorage(flyer.html_url) || '';
} else if (flyer.html_content) {
    // 폴백 2: DB에서 로드 (기존 전단지)
    htmlContent = flyer.html_content;
}
```

> **참고**: Next.js Server Component는 기본적으로 캐싱되므로 매 요청마다 HTML을 생성하지 않습니다.

### 2. 전단지 저장 로직 (FlyerForm)

- **파일**: `src/components/flyers/FlyerForm.tsx`

**제거될 작업**:
- 136-143번 라인: `generateFlyerHTML` 호출 (저장 시점) 제거
- 12번 라인: `uploadHTMLToStorage` import 제거
- 175-185번 라인: 생성 시 `uploadHTMLToStorage` 및 `html_url` 업데이트 제거
- 207-217번 라인: 수정 시 `uploadHTMLToStorage` 및 `html_url` 업데이트 제거
- 160번 라인: `html_content` 필드 저장 제거
- 199번 라인: 수정 시 `html_content` 필드 업데이트 제거

**유지될 작업**:
- `form_data` (JSONB) 저장
- 썸네일용 `image_url` 추출 및 저장 (145-147번 라인)

**변경 후 저장 로직**:
```typescript
const flyerPayload = {
    title: formData.title,
    description: formData.description,
    image_url: thumbnailUrl,
    template_id: templateId,
    form_data: dbFormData,
    user_id: user.id,
};
```

### 3. 데이터 구조 (Types)

- **파일**: `src/types/flyer.ts`
- `html_url`, `html_content` 필드는 이미 nullable로 정의되어 있음 (11-12번 라인)
- 향후 완전히 제거 가능하지만, 현재는 하위 호환성을 위해 유지

### 4. 삭제 로직 (DeleteFlyerButton)

- **파일**: `src/components/flyers/DeleteFlyerButton.tsx`

**제거될 작업**:
- 6번 라인: `deleteHTMLFromStorage` import 제거
- 38번 라인: Storage HTML 파일 삭제 로직 제거

> **참고**: 기존에 Storage에 저장된 HTML 파일은 남아있지만, 신규 전단지는 더 이상 Storage를 사용하지 않습니다. 필요시 별도 클린업 스크립트로 정리 가능합니다.

---

## 상세 구현 계획

### [MODIFY] [page.tsx (공개 뷰어)](file:///c:/project/personal/2025/sium/src/app/[userUuid]/[flyerUuid]/page.tsx)
- 3번 라인: `fetchHTMLFromStorage` import 유지 (하위 호환성)
- 새로 추가: `generateFlyerHTML` import
- 63-71번 라인: 렌더링 로직을 `form_data` 우선으로 변경

**변경 후 로직**:
```typescript
import { generateFlyerHTML } from '@/lib/flyer-template';
import { fetchHTMLFromStorage } from '@/lib/storage/html-storage';

// 렌더링 로직
let htmlContent = '';
if (flyer.form_data) {
    htmlContent = generateFlyerHTML(flyer.template_id, flyer.form_data);
} else if (flyer.html_url) {
    htmlContent = await fetchHTMLFromStorage(flyer.html_url) || '';
}
if (!htmlContent && flyer.html_content) {
    htmlContent = flyer.html_content;
}
```

### [MODIFY] [page.tsx (관리 상세)](file:///c:/project/personal/2025/sium/src/app/flyers/[id]/page.tsx)
- 7번 라인: `fetchHTMLFromStorage` import 유지 (하위 호환성)
- 새로 추가: `generateFlyerHTML` import
- 36-44번 라인: 공개 뷰어와 동일한 방식 적용

### [MODIFY] [FlyerForm.tsx](file:///c:/project/personal/2025/sium/src/components/flyers/FlyerForm.tsx)
- 8번 라인: `generateFlyerHTML` import 제거
- 12번 라인: `uploadHTMLToStorage` import 제거
- 136-143번 라인: HTML 생성 로직 제거
- 156-164번 라인: `html_content`, `html_url` 필드 제거
- 175-185번 라인: Storage 업로드 로직 완전 제거
- 193-217번 라인: 수정 모드에서도 동일하게 적용

**변경 후 저장 로직**:
```typescript
// 생성 모드
const { data: flyer, error: insertError } = await supabase
    .from('flyers')
    .insert({
        title: formData.title,
        description: formData.description,
        image_url: thumbnailUrl,
        template_id: templateId,
        form_data: dbFormData,
        user_id: user.id,
    })
    .select('uuid')
    .single();

if (insertError) throw insertError;

// Storage 업로드 로직 삭제됨
showToast('success', '전단지가 성공적으로 생성되었습니다!');
router.push('/flyers');
```

### [MODIFY] [DeleteFlyerButton.tsx](file:///c:/project/personal/2025/sium/src/components/flyers/DeleteFlyerButton.tsx)
- 6번 라인: `deleteHTMLFromStorage` import 제거
- 38번 라인: Storage 삭제 호출 제거

**변경 후 삭제 로직**:
```typescript
const handleDelete = async () => {
    if (!confirm('정말로 삭제하시겠습니까?')) {
        return;
    }
    setIsDeleting(true);
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from('flyers')
            .delete()
            .eq('uuid', flyerId);
        if (error) throw error;

        // Storage 삭제 로직 제거됨
        showToast('success', '전단지가 삭제되었습니다.');
        router.push('/flyers');
        router.refresh();
    } catch (err) {
        console.error('삭제 실패:', err);
        showToast('error', '삭제에 실패했습니다.');
    } finally {
        setIsDeleting(false);
    }
};
```

---

## 검증 계획

### 1. 기능 검증
- [ ] **신규 전단지 생성**: 기본/사과 템플릿 각각 생성 후 공개 페이지와 관리 페이지에서 정상 렌더링 확인
- [ ] **전단지 수정**:
  - [ ] 기존 전단지의 form_data 수정 후 저장
  - [ ] 새로고침 없이 즉시 변경사항이 반영되는지 확인 (공개/관리 페이지)
- [ ] **템플릿별 검증**:
  - [ ] 기본 템플릿: 이미지와 설명이 올바르게 표시되는지
  - [ ] 사과 템플릿: 가격표, 연락처, 계좌번호 등 모든 필드가 올바르게 표시되는지

### 2. 하위 호환성 확인
- [ ] **기존 전단지 렌더링**:
  - [ ] `form_data`가 있는 기존 전단지가 새로운 로직으로 정상 작동하는지
  - [ ] `form_data`가 없고 `html_url`만 있는 기존 전단지가 폴백으로 정상 작동하는지
  - [ ] `form_data`도 `html_url`도 없고 `html_content`만 있는 전단지가 정상 작동하는지
- [ ] **데이터베이스 조회**: 기존 전단지 몇 개를 샘플로 확인하여 `form_data` 존재 여부 파악

### 3. 성능 검증
- [ ] **렌더링 속도**: 동적 생성 방식으로 변경 후에도 페이지 로딩 속도가 허용 범위 내인지
- [ ] **Next.js 캐싱**: 개발자 도구에서 캐싱이 정상 작동하는지 확인

### 4. 삭제 기능 검증
- [ ] **신규 전단지 삭제**: Storage에 HTML 파일이 생성되지 않았으므로 DB 레코드만 삭제되는지 확인
- [ ] **기존 전단지 삭제**: DB 레코드는 삭제되지만 Storage의 HTML 파일은 남아있는지 확인 (예상 동작)

---

## 추가 고려사항

### 1. Storage 클린업 (선택사항)
기존에 Storage에 저장된 HTML 파일들은 더 이상 사용되지 않지만 남아있습니다. 필요시 다음과 같은 별도 클린업 작업을 수행할 수 있습니다:

```typescript
// cleanup-script.ts (참고용)
const { data: flyers } = await supabase
    .from('flyers')
    .select('uuid, html_url')
    .not('html_url', 'is', null);

for (const flyer of flyers) {
    await deleteHTMLFromStorage(flyer.uuid);
    await supabase
        .from('flyers')
        .update({ html_url: null })
        .eq('uuid', flyer.uuid);
}
```

### 2. `html-storage.ts` 파일 관리
- **현재**: `fetchHTMLFromStorage`는 하위 호환성을 위해 유지
- **향후**: 모든 전단지가 `form_data`를 가지게 되면 해당 파일 삭제 가능
- **판단 기준**: DB에서 `html_url`이 null이 아닌 레코드가 없을 때

### 3. 데이터베이스 마이그레이션 (선택사항)
기존 전단지의 `form_data`가 비어있다면, 필요시 역생성 로직을 만들 수 있습니다:
- `html_content`를 파싱하여 `form_data` 재구성
- 단, HTML 파싱은 복잡하므로 권장하지 않음
- 대안: 사용자가 수정할 때 자동으로 `form_data` 생성되도록 유도

### 4. 성능 최적화 옵션
Next.js는 기본적으로 Server Component를 캐싱하지만, 필요시 추가 최적화 가능:
```typescript
// page.tsx
export const revalidate = 3600; // 1시간마다 재검증
```

---

## 정리 작업 체크리스트

### Phase 1: 동적 렌더링 도입 (현재)
- [ ] 조회 페이지에서 `form_data` 우선 렌더링 로직 추가
- [ ] 저장 로직에서 HTML 생성/업로드 제거
- [ ] 삭제 로직에서 Storage 삭제 제거
- [ ] 모든 기능 검증 완료

### Phase 2: 모니터링 및 점진적 마이그레이션
- [ ] 신규 전단지가 `form_data`로만 작동하는지 확인
- [ ] 기존 전단지 중 `form_data`가 없는 비율 파악
- [ ] 필요시 사용자에게 "전단지 재저장" 유도

### Phase 3: 완전한 전환 (선택적, 미래)
- [ ] 모든 전단지가 `form_data`를 가지는 것 확인
- [ ] `html_url`, `html_content` 컬럼 제거
- [ ] `html-storage.ts` 파일 삭제
- [ ] Storage의 `html/` 폴더 정리
