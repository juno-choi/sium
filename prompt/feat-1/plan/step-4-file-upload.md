# [목표 설명]
[feat-1-1.md](file:///c:/project/personal/2025/sium/prompt/feat-1/tasks/feat-1-1.md)의 **4단계: 파일 업로드 기능**을 구현합니다.

Supabase Storage를 사용하여 **전단지에 포함될 여러 이미지**를 업로드하고 관리하는 기능을 추가합니다.

**핵심 사항**:
- 전단지 하나당 **여러 이미지 업로드 가능**
- 업로드된 이미지 URL들은 **5단계에서 HTML 생성 시 사용**
- `flyers.image_url`은 **썸네일**(대표 이미지)로 사용
- 여러 이미지는 HTML 내부에 `<img>` 태그로 포함 (별도 테이블 생성 없음)

> [!NOTE]
> 앞서 논의된 `public.users` 동기화 이슈(Auth Trigger)는 5단계(전단지 CRUD) 진행 전 필수 사항이므로, 4단계 완료 후 별도로 진행하는 것을 권장합니다.

## 사용자 검토 필요 사항
> [!IMPORTANT]
> 1. Supabase 프로젝트 대시보드에서 `flyers`라는 이름의 **Public Bucket**을 생성해야 합니다. (SQL로도 가능 - 아래 schema.sql 참고)
> 2. **이미지 관리 방식**: 여러 이미지 URL을 프론트엔드 상태로 관리하고, 5단계에서 HTML 생성 시 포함합니다. (별도 테이블 생성 없음)

## 변경 제안

### Supabase Storage
#### [수정] [schema.sql](file:///c:/project/personal/2025/sium/supabase/schema.sql)

**1. flyers 테이블에 html_content 필드 추가**

전단지는 HTML로 생성되어 저장되므로, HTML을 저장할 필드가 필요합니다.

```sql
-- 기존 flyers 테이블에 추가
alter table public.flyers
  add column if not exists html_content text;
-- 5단계에서 폼 제출 시 생성된 HTML을 저장
```

**필드 설명**:
- `flyers.image_url`: 썸네일(대표 이미지) URL 저장
- `flyers.html_content`: 전단지 전체 HTML 저장 (이미지 URL들 포함)
- 이미지 여러 개는 HTML 내부에 `<img src="..." />` 태그로 포함

**2. Storage Bucket 및 정책 추가**

```sql
-- Bucket 생성 (대시보드 대신 SQL로도 가능)
insert into storage.buckets (id, name, public)
values ('flyers', 'flyers', true)
on conflict (id) do nothing;

-- 업로드 정책: 로그인한 사용자만
create policy "Authenticated users can upload flyer images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'flyers' );

-- 조회 정책: 누구나
create policy "Anyone can view flyer images"
on storage.objects for select
using ( bucket_id = 'flyers' );

-- 삭제 정책: 본인이 업로드한 파일만
create policy "Users can delete own flyer images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'flyers' AND
  owner = auth.uid()
);
```

### UI 컴포넌트
#### [신규] [ImageUpload.tsx](file:///c:/project/personal/2025/sium/src/components/ImageUpload.tsx)

**기능**:
- **여러 파일 선택** 가능 (단일 업로드를 여러 번 사용하는 방식)
- 선택한 파일의 **미리보기** 표시
- Supabase Storage `flyers` 버킷에 업로드
- 업로드 중 **로딩 상태** 및 **진행률** 표시
- 업로드 완료 후 **이미지 URL 반환** (콜백)
- 업로드된 이미지 **삭제 기능**

**Props 인터페이스**:
```typescript
interface ImageUploadProps {
  onUploadComplete: (url: string) => void;  // 업로드 완료 시 호출
  onRemove?: (url: string) => void;         // 이미지 삭제 시 호출 (선택)
  maxSizeInMB?: number;                     // 최대 파일 크기 (기본: 5MB)
  disabled?: boolean;                       // 비활성화 상태
}
```

**구현 요구사항**:

**1. 파일 검증**:
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB (Props로 변경 가능)

// 파일 타입 검증
if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)');
}

// 파일 크기 검증
if (file.size > MAX_SIZE) {
  throw new Error(`파일 크기는 ${maxSizeInMB}MB 이하여야 합니다.`);
}
```

**2. 파일명 중복 방지**:
```typescript
// 파일명 생성 전략 (userId 폴더 구조 사용)
const user = await supabase.auth.getUser();
const fileExt = file.name.split('.').pop();
const fileName = `${user.data.user?.id}/${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
```

**3. 업로드 처리**:
```typescript
const { data, error } = await supabase.storage
  .from('flyers')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) throw error;

// Public URL 생성
const { data: { publicUrl } } = supabase.storage
  .from('flyers')
  .getPublicUrl(fileName);

onUploadComplete(publicUrl);
```

**4. 에러 처리**:

다음 에러 케이스를 처리해야 합니다:
- 파일 크기 초과
- 잘못된 파일 타입
- 네트워크 에러
- Storage 권한 에러 (미로그인 등)

```typescript
try {
  // 업로드 로직
} catch (error) {
  if (error instanceof Error) {
    // 사용자에게 친화적인 에러 메시지 표시
    console.error('업로드 실패:', error.message);
  }
}
```

**5. UI 상태**:
- 파일 선택 전: 업로드 버튼 표시
- 업로드 중: 로딩 스피너 + 진행 상태 표시
- 업로드 완료: 미리보기 이미지 + 삭제 버튼
- 에러 발생: 에러 메시지 표시

## 5단계와의 연결

4단계에서 구현한 `ImageUpload` 컴포넌트는 5단계 전단지 작성 폼에서 다음과 같이 사용됩니다.

### 프론트엔드 상태 관리 예시

```typescript
// src/app/flyers/new/page.tsx (5단계에서 생성)
'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function NewFlyerPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrls: [] as string[],  // 4단계 ImageUpload로 업로드한 이미지들
  });

  // 이미지 업로드 완료 시
  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, url]
    }));
  };

  // 이미지 삭제 시
  const handleImageRemove = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(u => u !== url)
    }));
  };

  // 폼 제출 시 HTML 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // HTML 템플릿 생성
    const htmlContent = `
      <div class="flyer">
        <h1>${formData.title}</h1>
        <div class="images">
          ${formData.imageUrls.map(url =>
            `<img src="${url}" alt="${formData.title}" />`
          ).join('')}
        </div>
        <p>${formData.description}</p>
      </div>
    `;

    const thumbnailUrl = formData.imageUrls[0] || null;  // 첫 번째 이미지를 썸네일로

    // DB에 저장
    const { error } = await supabase.from('flyers').insert({
      title: formData.title,
      description: formData.description,
      image_url: thumbnailUrl,      // 썸네일
      html_content: htmlContent,    // 생성된 HTML
      user_id: session.user.id,
    });

    if (error) {
      console.error('전단지 저장 실패:', error);
      return;
    }

    // 성공 처리
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        placeholder="제목"
      />

      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="설명"
      />

      {/* 4단계 ImageUpload 컴포넌트 사용 */}
      <ImageUpload
        onUploadComplete={handleImageUpload}
        onRemove={handleImageRemove}
      />

      {/* 업로드된 이미지 목록 미리보기 */}
      <div>
        {formData.imageUrls.map((url, idx) => (
          <div key={url}>
            <img src={url} alt={`이미지 ${idx + 1}`} style={{maxWidth: 200}} />
            {idx === 0 && <span>(썸네일)</span>}
          </div>
        ))}
      </div>

      <button type="submit">전단지 등록</button>
    </form>
  );
}
```

## 검증 계획

### 수동 검증

**1. 버킷 생성 확인**:
- Supabase 대시보드 → Storage → `flyers` 버킷 존재 확인
- 또는 schema.sql 실행으로 생성

**2. 테스트 페이지 생성**:

`src/app/test/image-upload/page.tsx` 파일 생성:

```typescript
'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';

export default function TestImageUploadPage() {
  const [urls, setUrls] = useState<string[]>([]);

  const handleUpload = (url: string) => {
    setUrls(prev => [...prev, url]);
    console.log('업로드 완료:', url);
  };

  const handleRemove = (url: string) => {
    setUrls(prev => prev.filter(u => u !== url));
    console.log('삭제:', url);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>이미지 업로드 테스트</h1>

      <ImageUpload
        onUploadComplete={handleUpload}
        onRemove={handleRemove}
      />

      <div style={{ marginTop: '2rem' }}>
        <h2>업로드된 이미지들 ({urls.length}개):</h2>
        {urls.map((url, idx) => (
          <div key={url} style={{ marginBottom: '1rem' }}>
            <p>이미지 {idx + 1}:</p>
            <img src={url} alt={`테스트 ${idx}`} style={{maxWidth: 300, border: '1px solid #ccc'}} />
            <p style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{url}</p>
            <button onClick={() => handleRemove(url)}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**3. 업로드 테스트**:
- 브라우저에서 `/test/image-upload` 접속
- 여러 이미지를 순차적으로 업로드
- 콘솔에서 URL 확인
- Supabase Storage 버킷에서 파일 확인

**4. URL 접근 확인**:
- 반환된 URL을 브라우저 새 탭에서 직접 열기
- 이미지가 정상적으로 표시되는지 확인
- 네트워크 탭에서 응답 확인 (200 OK)

**5. 에러 케이스 테스트**:
- **파일 크기 초과**: 5MB 이상 파일 업로드 → 에러 메시지 확인
- **잘못된 파일 타입**: PDF, TXT 등 업로드 → 에러 메시지 확인
- **권한 테스트**: 로그아웃 상태에서 업로드 → 인증 에러 확인
- **네트워크 에러**: 개발자 도구에서 오프라인 모드 → 에러 처리 확인

**6. 다중 이미지 테스트**:
- 3~5개의 이미지를 연속으로 업로드
- 각 이미지의 URL이 올바르게 관리되는지 확인
- 중간에 삭제 후 다시 업로드 테스트

**7. 5단계 진행 전**:
- 테스트 페이지 삭제 또는 프로덕션 빌드에서 제외 (`.env`로 제어 가능)
- ImageUpload 컴포넌트가 5단계에서 사용 가능한 상태인지 확인

## 추가 고려사항

다음 사항들은 4단계 범위를 벗어나므로, **5단계 또는 이후에 검토**합니다:

### 1. 이미지 삭제 전략
- 전단지 삭제 시 Storage 이미지도 삭제할지
- 전단지 수정 시 기존 이미지 처리 방법
- 미사용 이미지 정리 (Cleanup) 전략
- Storage Quota 관리

### 2. 이미지 최적화
- 클라이언트 사이드 이미지 압축 (browser-image-compression 등)
- Supabase Image Transformation 활용
- WebP 자동 변환
- 반응형 이미지 (srcset)

### 3. UX 개선
- 드래그 앤 드롭 업로드
- 이미지 순서 변경 (Drag & Drop)
- 이미지 크롭 기능
- 업로드 진행률 바 (현재는 로딩 상태만)
- 다중 파일 동시 선택

### 4. 보안 강화
- 파일명 Sanitization (악의적인 파일명 필터링)
- Content-Type 검증 (확장자와 실제 MIME 타입 일치 확인)
- 바이러스 스캔 (서드파티 서비스 연동)
- Rate Limiting (업로드 횟수 제한)