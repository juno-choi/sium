# 5단계: 전단지 CRUD 기능 구현 계획

## [목표 설명]
사용자는 전단지를 생성(이미지 업로드 포함), 조회, 수정, 삭제할 수 있어야 합니다.
이전 단계에서 구현한 **이미지 업로드** 및 **유저 동기화** 기능을 바탕으로 실제 서비스 로직을 완성합니다.

**핵심 기능**:
- 전단지 작성: 제목, 설명, 여러 이미지 업로드 → HTML 생성 → DB 저장
- 전단지 목록: 썸네일과 제목으로 그리드 레이아웃 표시
- 전단지 상세: HTML 콘텐츠 렌더링
- 전단지 수정/삭제: 작성자 본인만 가능 (RLS 정책)

## 사전 요구사항

> [!IMPORTANT]
> 5단계 진행 전 반드시 완료되어야 할 사항:
> 1. **4단계 완료**: ImageUpload 컴포넌트 구현 및 테스트
> 2. **auth-user-sync 완료**: 트리거 설정 및 기존 사용자 마이그레이션
> 3. **schema.sql 적용**: `html_content` 필드 포함
> 4. **로그인 상태**: 테스트를 위해 로그인된 사용자 필요

## 변경 제안

### 1. 타입 정의

#### [신규] `src/types/flyer.ts`

```typescript
export interface Flyer {
  id: number;
  uuid: string;
  title: string;
  description: string | null;
  image_url: string | null;  // 썸네일
  html_content: string;
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
}

export interface CreateFlyerData {
  title: string;
  description: string;
  image_url: string | null;
  html_content: string;
  user_id: string;
}

export interface UpdateFlyerData {
  title: string;
  description: string;
  image_url: string | null;
  html_content: string;
}
```

---

### 2. 파일 구조 (Routing)

Next.js App Router 구조를 따릅니다.

```
src/app/
├── page.tsx                          [수정] 메인 페이지 (전단지 목록)
├── flyers/
│   ├── new/
│   │   └── page.tsx                  [신규] 전단지 작성 페이지 (인증 필요)
│   └── [id]/
│       ├── page.tsx                  [신규] 전단지 상세 페이지
│       └── edit/
│           └── page.tsx              [신규] 전단지 수정 페이지 (작성자만)
```

---

### 3. HTML 생성 템플릿

#### HTML 생성 유틸리티 함수

**[신규] `src/lib/flyer-template.ts`**

```typescript
export interface GenerateHTMLParams {
  title: string;
  description: string;
  imageUrls: string[];
}

export function generateFlyerHTML(params: GenerateHTMLParams): string {
  const { title, description, imageUrls } = params;

  return `
    <div class="flyer-container">
      <header class="flyer-header">
        <h1>${escapeHtml(title)}</h1>
      </header>

      ${imageUrls.length > 0 ? `
        <div class="flyer-images">
          ${imageUrls.map((url, index) => `
            <img
              src="${escapeHtml(url)}"
              alt="${escapeHtml(title)} - 이미지 ${index + 1}"
              class="flyer-image"
            />
          `).join('')}
        </div>
      ` : ''}

      ${description ? `
        <div class="flyer-description">
          <p>${escapeHtml(description)}</p>
        </div>
      ` : ''}
    </div>
  `.trim();
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// HTML에서 이미지 URL 추출 (수정 시 사용)
export function extractImageUrls(html: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}
```

**보안 고려사항**:
- `escapeHtml`: XSS 공격 방지
- 사용자 입력을 HTML에 삽입하기 전 반드시 이스케이프
- `dangerouslySetInnerHTML` 사용 시 신뢰할 수 있는 콘텐츠만 렌더링

---

### 4. 주요 컴포넌트

#### A. `FlyerForm.tsx` (신규)

**경로**: `src/components/flyers/FlyerForm.tsx`

**기능**:
- 생성과 수정에서 공통으로 사용
- 제목, 설명 입력
- 여러 이미지 업로드 (ImageUpload 통합)
- 폼 검증
- 로딩/에러 상태 관리

**Props**:
```typescript
interface FlyerFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    description: string;
    imageUrls: string[];
  };
  flyerId?: string;  // 수정 시 사용
  onSuccess?: () => void;
}
```

**구현 요구사항**:

1. **상태 관리**:
```typescript
const [formData, setFormData] = useState<FlyerFormData>({
  title: initialData?.title || '',
  description: initialData?.description || '',
  imageUrls: initialData?.imageUrls || []
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

2. **폼 검증**:
```typescript
const validate = (): boolean => {
  if (!formData.title.trim()) {
    setError('제목을 입력해주세요.');
    return false;
  }
  if (formData.imageUrls.length === 0) {
    setError('최소 1개의 이미지를 업로드해주세요.');
    return false;
  }
  return true;
};
```

3. **제출 처리**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  setIsSubmitting(true);
  setError(null);

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    // HTML 생성
    const htmlContent = generateFlyerHTML({
      title: formData.title,
      description: formData.description,
      imageUrls: formData.imageUrls
    });

    const thumbnailUrl = formData.imageUrls[0] || null;

    if (mode === 'create') {
      // 생성
      const { error } = await supabase.from('flyers').insert({
        title: formData.title,
        description: formData.description,
        image_url: thumbnailUrl,
        html_content: htmlContent,
        user_id: user.id
      });

      if (error) throw error;

      // 성공 처리
      router.push('/');
      router.refresh();
    } else {
      // 수정
      const { error } = await supabase
        .from('flyers')
        .update({
          title: formData.title,
          description: formData.description,
          image_url: thumbnailUrl,
          html_content: htmlContent
        })
        .eq('uuid', flyerId);

      if (error) throw error;

      // 성공 처리
      onSuccess?.();
      router.push(`/flyers/${flyerId}`);
      router.refresh();
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
  } finally {
    setIsSubmitting(false);
  }
};
```

4. **이미지 관리**:
```typescript
const handleImageUpload = (url: string) => {
  setFormData(prev => ({
    ...prev,
    imageUrls: [...prev.imageUrls, url]
  }));
};

const handleImageRemove = (url: string) => {
  setFormData(prev => ({
    ...prev,
    imageUrls: prev.imageUrls.filter(u => u !== url)
  }));
};
```

---

#### B. `FlyerCard.tsx` (신규)

**경로**: `src/components/flyers/FlyerCard.tsx`

**기능**:
- 전단지 썸네일, 제목, 작성자 표시
- 클릭 시 상세 페이지로 이동

**Props**:
```typescript
interface FlyerCardProps {
  flyer: Flyer;
}
```

**구현 예시**:
```typescript
export function FlyerCard({ flyer }: FlyerCardProps) {
  return (
    <Link href={`/flyers/${flyer.uuid}`}>
      <div className="flyer-card">
        {flyer.image_url && (
          <img
            src={flyer.image_url}
            alt={flyer.title}
            className="flyer-card-image"
          />
        )}
        <div className="flyer-card-content">
          <h3>{flyer.title}</h3>
          {flyer.users?.full_name && (
            <p className="text-sm text-gray-500">
              by {flyer.users.full_name}
            </p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(flyer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

---

#### C. `FlyerList.tsx` (신규)

**경로**: `src/components/flyers/FlyerList.tsx`

**기능**:
- 전단지 배열을 받아 그리드로 표시
- 로딩 스켈레톤
- 빈 상태 처리

**Props**:
```typescript
interface FlyerListProps {
  flyers: Flyer[];
  isLoading?: boolean;
}
```

---

### 5. 페이지 구현

#### A. 메인 페이지 (목록)

**[수정] `src/app/page.tsx`**

**기능**:
- 전단지 목록 조회 (최신순)
- 그리드 레이아웃
- 작성 버튼 (로그인 사용자만)

**구현**:
```typescript
export default async function HomePage() {
  const supabase = createClient();

  // 전단지 목록 조회 (작성자 정보 포함)
  const { data: flyers, error } = await supabase
    .from('flyers')
    .select(`
      *,
      users (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch flyers:', error);
  }

  // 로그인 상태 확인
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <header>
        <h1>전단지 목록</h1>
        {user && (
          <Link href="/flyers/new">
            <button>새 전단지 작성</button>
          </Link>
        )}
      </header>

      {flyers && flyers.length > 0 ? (
        <FlyerList flyers={flyers} />
      ) : (
        <div>아직 전단지가 없습니다.</div>
      )}
    </div>
  );
}
```

---

#### B. 전단지 작성 페이지

**[신규] `src/app/flyers/new/page.tsx`**

**기능**:
- 로그인 확인 (미들웨어 또는 페이지 내)
- FlyerForm 렌더링

**구현**:
```typescript
export default async function NewFlyerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>새 전단지 작성</h1>
      <FlyerForm mode="create" />
    </div>
  );
}
```

---

#### C. 전단지 상세 페이지

**[신규] `src/app/flyers/[id]/page.tsx`**

**기능**:
- HTML 콘텐츠 렌더링
- 작성자 정보 표시
- 본인 글이면 수정/삭제 버튼

**구현**:
```typescript
interface PageProps {
  params: { id: string };
}

export default async function FlyerDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // 전단지 조회
  const { data: flyer, error } = await supabase
    .from('flyers')
    .select(`
      *,
      users (
        full_name,
        avatar_url
      )
    `)
    .eq('uuid', params.id)
    .single();

  if (error || !flyer) {
    notFound();
  }

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === flyer.user_id;

  return (
    <div>
      <header>
        <h1>{flyer.title}</h1>
        {flyer.users?.full_name && (
          <p>작성자: {flyer.users.full_name}</p>
        )}
        <p>작성일: {new Date(flyer.created_at).toLocaleString()}</p>
      </header>

      {isOwner && (
        <div>
          <Link href={`/flyers/${params.id}/edit`}>
            <button>수정</button>
          </Link>
          <DeleteFlyerButton flyerId={params.id} />
        </div>
      )}

      {/* HTML 콘텐츠 렌더링 */}
      <div
        className="flyer-content"
        dangerouslySetInnerHTML={{ __html: flyer.html_content }}
      />
    </div>
  );
}
```

**보안 주의사항**:
- `dangerouslySetInnerHTML`은 XSS 위험이 있음
- 하지만 `generateFlyerHTML`에서 이미 `escapeHtml`로 처리했으므로 안전
- 외부에서 직접 HTML을 입력받지 않으므로 상대적으로 안전

---

#### D. 전단지 수정 페이지

**[신규] `src/app/flyers/[id]/edit/page.tsx`**

**기능**:
- 기존 전단지 데이터 로드
- HTML에서 이미지 URL 추출
- FlyerForm에 초기 데이터 전달

**구현**:
```typescript
interface PageProps {
  params: { id: string };
}

export default async function EditFlyerPage({ params }: PageProps) {
  const supabase = createClient();

  // 전단지 조회
  const { data: flyer, error } = await supabase
    .from('flyers')
    .select('*')
    .eq('uuid', params.id)
    .single();

  if (error || !flyer) {
    notFound();
  }

  // 권한 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== flyer.user_id) {
    redirect('/');
  }

  // HTML에서 이미지 URL 추출
  const imageUrls = extractImageUrls(flyer.html_content);

  return (
    <div>
      <h1>전단지 수정</h1>
      <FlyerForm
        mode="edit"
        flyerId={params.id}
        initialData={{
          title: flyer.title,
          description: flyer.description || '',
          imageUrls
        }}
      />
    </div>
  );
}
```

---

### 6. 삭제 기능

#### [신규] `src/components/flyers/DeleteFlyerButton.tsx`

**Client Component** (삭제는 클라이언트 액션)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DeleteFlyerButtonProps {
  flyerId: string;
}

export function DeleteFlyerButton({ flyerId }: DeleteFlyerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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

      // 성공 시 메인 페이지로 이동
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="delete-button"
    >
      {isDeleting ? '삭제 중...' : '삭제'}
    </button>
  );
}
```

**Storage 이미지 삭제**:
- 현재 단계에서는 Storage 이미지를 수동 삭제하지 않음
- 6단계 이후 또는 별도 cleanup 작업으로 처리
- RLS 정책에 의해 본인이 업로드한 이미지는 삭제 가능하므로, 필요 시 추후 구현

---

### 7. 스타일링 (CSS)

#### [신규] `src/styles/flyer.css` (또는 Tailwind 사용)

**기본 스타일 가이드**:

```css
/* 전단지 그리드 레이아웃 */
.flyer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

/* 전단지 카드 */
.flyer-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}

.flyer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flyer-card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* 전단지 콘텐츠 렌더링 */
.flyer-content img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 4px;
}
```

---

## 검증 계획

### 1. 전단지 생성 테스트

**시나리오**:
1. 로그인 후 "새 전단지 작성" 버튼 클릭
2. 제목 입력: "테스트 전단지"
3. 설명 입력: "테스트용 전단지입니다."
4. ImageUpload로 이미지 3장 업로드
5. "저장" 버튼 클릭

**검증**:
```sql
-- DB에서 확인
select
  uuid,
  title,
  description,
  image_url,
  length(html_content) as html_length,
  user_id
from flyers
order by created_at desc
limit 1;

-- html_content 내용 확인
select html_content from flyers order by created_at desc limit 1;
```

**예상 결과**:
- `image_url`에 첫 번째 이미지 URL 저장됨
- `html_content`에 3개의 `<img>` 태그가 포함된 HTML
- XSS 방지를 위해 특수문자가 이스케이프됨

---

### 2. 전단지 목록 조회 테스트

**시나리오**:
1. 메인 페이지(`/`) 접속
2. 전단지 카드가 그리드로 표시됨
3. 썸네일, 제목, 작성자 이름 확인

**검증**:
- 최신순으로 정렬되는지 확인
- 반응형 그리드 동작 확인 (모바일/태블릿/데스크탑)
- 이미지 로딩 확인

---

### 3. 전단지 상세 조회 테스트

**시나리오**:
1. 목록에서 전단지 클릭
2. 상세 페이지로 이동
3. HTML 콘텐츠 렌더링 확인

**검증**:
- 모든 이미지가 정상적으로 표시되는지
- 제목, 설명이 올바르게 표시되는지
- 작성자 정보 표시 확인
- 본인 글인 경우 수정/삭제 버튼 표시 확인

**XSS 테스트**:
```typescript
// 제목에 스크립트 태그 입력 시도
title: "<script>alert('XSS')</script>"

// 결과: escapeHtml에 의해 이스케이프되어 실행되지 않음
// 렌더링: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

---

### 4. 전단지 수정 테스트

**시나리오**:
1. 본인이 작성한 전단지 상세 페이지에서 "수정" 클릭
2. 기존 데이터가 폼에 로드됨 확인
3. 제목 변경: "수정된 제목"
4. 이미지 1개 추가 (총 4개)
5. "저장" 클릭

**검증**:
```sql
-- 업데이트 확인
select title, image_url, html_content
from flyers
where uuid = '<전단지-uuid>';
```

**예상 결과**:
- 제목이 "수정된 제목"으로 변경됨
- `html_content`에 4개의 `<img>` 태그
- `updated_at` 타임스탬프 갱신됨

---

### 5. 전단지 삭제 테스트

**시나리오**:
1. 본인이 작성한 전단지 상세 페이지에서 "삭제" 클릭
2. 확인 다이얼로그에서 "확인" 클릭
3. 메인 페이지로 리다이렉트

**검증**:
```sql
-- 삭제 확인
select * from flyers where uuid = '<삭제한-전단지-uuid>';
-- 0 rows
```

**RLS 테스트**:
- 다른 사용자의 전단지 삭제 시도 → RLS 정책에 의해 차단됨

---

### 6. 권한 테스트

**시나리오 A: 비로그인 사용자**
- 목록 조회: ✅ 가능
- 상세 조회: ✅ 가능
- 작성: ❌ `/login`으로 리다이렉트
- 수정/삭제: ❌ 버튼 미표시

**시나리오 B: 다른 사용자**
- 타인의 전단지 수정 페이지 직접 접근: ❌ 메인으로 리다이렉트
- 타인의 전단지 삭제 시도: ❌ RLS 정책에 의해 차단

---

### 7. 에러 케이스 테스트

**시나리오**:
1. **존재하지 않는 전단지**: `/flyers/invalid-uuid` 접속 → 404 페이지
2. **제목 미입력**: 폼 검증 에러 메시지
3. **이미지 미업로드**: 폼 검증 에러 메시지
4. **네트워크 에러**: 저장 실패 시 에러 메시지 표시

---

### 8. 성능 테스트

**시나리오**:
- 전단지 50개 생성 후 목록 로딩 속도 확인
- 이미지가 많은 전단지(10장) 상세 페이지 렌더링 속도

**최적화 고려사항** (6단계):
- 이미지 lazy loading
- 페이지네이션 (현재는 전체 로드)
- 썸네일 최적화

---

## 추가 고려사항

### 1. Storage 이미지 정리 (선택사항)

전단지 삭제 시 Storage 이미지도 삭제하려면:

```typescript
// DeleteFlyerButton.tsx에 추가
const handleDelete = async () => {
  // ... (기존 코드)

  // HTML에서 이미지 URL 추출
  const imageUrls = extractImageUrls(flyer.html_content);

  // Storage에서 이미지 삭제
  for (const url of imageUrls) {
    const path = extractStoragePath(url);  // URL에서 경로 추출
    await supabase.storage.from('flyers').remove([path]);
  }

  // 전단지 삭제
  await supabase.from('flyers').delete().eq('uuid', flyerId);
};
```

**참고**: 현재 단계에서는 구현하지 않고, 추후 정리 스크립트로 처리 가능

---

### 2. 페이지네이션 (6단계로 미룸)

현재는 전체 전단지를 로드하지만, 데이터가 많아지면:

```typescript
// 페이지네이션 예시
const { data } = await supabase
  .from('flyers')
  .select('*')
  .range(0, 9)  // 0~9번째 (10개)
  .order('created_at', { ascending: false });
```

---

### 3. 로딩/에러 상태 UI (6단계)

- **로딩**: Skeleton UI
- **에러**: Error Boundary
- **빈 상태**: Empty State 컴포넌트

---

### 4. 토스트 알림 (선택사항)

성공/실패 메시지를 토스트로 표시:
- 라이브러리: `react-hot-toast`, `sonner` 등

---

## 구현 순서 권장사항

1. **타입 정의** → `flyer.ts` 작성
2. **유틸리티** → `flyer-template.ts` 작성 및 테스트
3. **FlyerCard** → 간단한 컴포넌트부터
4. **FlyerList** → FlyerCard 사용
5. **메인 페이지** → 목록 조회 구현
6. **FlyerForm** → 생성 기능 구현
7. **작성 페이지** → FlyerForm 사용
8. **상세 페이지** → HTML 렌더링
9. **수정 페이지** → FlyerForm 재사용
10. **삭제 기능** → DeleteFlyerButton

각 단계마다 테스트를 진행하면서 점진적으로 구현하는 것을 권장합니다.
