# 6단계: UI/UX 개선 및 마무리 계획

## [목표]
현재의 기능 중심 UI를 실제 서비스 가능한 수준의 **세련되고 사용하기 편한 UI**로 업그레이드합니다.

**핵심 개선 사항**:
- 반응형 레이아웃 완성 (모바일/태블릿/데스크탑)
- 로딩/에러 상태 처리
- 페이지네이션 또는 무한스크롤
- 접근성 개선
- 성능 최적화

## 사전 요구사항

> [!IMPORTANT]
> 6단계 진행 전 반드시 완료되어야 할 사항:
> 1. **5단계 완료**: 전단지 CRUD 기능 모두 구현 및 테스트
> 2. **기본 기능 검증**: 생성, 조회, 수정, 삭제가 정상 작동
> 3. **아이콘 라이브러리 설치**: `npm install lucide-react`

---

## 변경 제안

### 1. 디자인 시스템 설정

#### A. Tailwind 설정 확장

**[수정] `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

#### B. 아이콘 시스템

**라이브러리**: `lucide-react` 사용

```bash
npm install lucide-react
```

**사용 예시**:
```typescript
import { Upload, Trash2, Edit, User, LogOut } from 'lucide-react';

<Upload className="w-5 h-5" />
```

---

### 2. 전역 레이아웃 개선

#### A. Header 컴포넌트 개선

**[수정] `src/components/Header.tsx`**

**개선 사항**:
- 브랜드 로고 스타일링
- 프로필 드롭다운 메뉴
- 반응형 모바일 메뉴
- 로딩 상태 처리

**구현 요구사항**:

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { User, LogOut, Menu, X, PlusCircle } from 'lucide-react';

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">
              Flyer<span className="text-brand-500">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/flyers/new"
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>새 전단지</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">{user.email}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                      <Link
                        href="/my-flyers"
                        className="block px-4 py-2 hover:bg-gray-50"
                      >
                        내 전단지
                      </Link>
                      <form action="/auth/signout" method="post">
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>로그아웃</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                로그인
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile menu items */}
          </div>
        )}
      </div>
    </header>
  );
}
```

---

### 3. 랜딩 페이지 개선

#### [수정] `src/app/page.tsx`

**구조**:
1. Hero Section - 강력한 첫인상
2. Features Section - 주요 기능 소개
3. Flyers Grid - 최신 전단지 목록
4. CTA Section - 행동 유도

**Hero Section**:
```typescript
<section className="bg-gradient-to-br from-brand-50 to-brand-100 py-20">
  <div className="container mx-auto px-4 text-center">
    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
      누구나 1분 만에 만드는
      <br />
      <span className="text-brand-500">웹 전단지</span>
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      이미지와 텍스트만으로 멋진 전단지를 만들고,
      링크 하나로 전 세계와 공유하세요.
    </p>
    <Link
      href="/flyers/new"
      className="inline-flex items-center space-x-2 px-8 py-4 bg-brand-500 text-white text-lg rounded-lg hover:bg-brand-600 transition shadow-lg hover:shadow-xl"
    >
      <PlusCircle className="w-6 h-6" />
      <span>지금 시작하기</span>
      <ArrowRight className="w-5 h-5" />
    </Link>
  </div>
</section>
```

**Features Section**:
```typescript
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      왜 FlyerHub인가요?
    </h2>
    <div className="grid md:grid-cols-3 gap-8">
      <FeatureCard
        icon={<Upload className="w-12 h-12 text-brand-500" />}
        title="간편한 이미지 업로드"
        description="드래그 앤 드롭으로 쉽게 이미지를 추가하세요."
      />
      <FeatureCard
        icon={<Layout className="w-12 h-12 text-brand-500" />}
        title="자동 레이아웃"
        description="업로드한 콘텐츠가 자동으로 예쁘게 정렬됩니다."
      />
      <FeatureCard
        icon={<Share2 className="w-12 h-12 text-brand-500" />}
        title="링크 공유"
        description="생성된 링크로 어디서나 전단지를 공유하세요."
      />
    </div>
  </div>
</section>
```

---

### 4. 전단지 목록 개선

#### A. FlyerCard 컴포넌트 고도화

**[수정] `src/components/flyers/FlyerCard.tsx`**

**개선 사항**:
- 이미지 없을 때 Placeholder
- 호버 효과 강화
- 타이포그래피 개선
- 날짜 포맷팅

```typescript
export function FlyerCard({ flyer }: FlyerCardProps) {
  return (
    <Link href={`/flyers/${flyer.uuid}`}>
      <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        {/* 썸네일 */}
        <div className="aspect-video bg-gray-100 overflow-hidden">
          {flyer.image_url ? (
            <img
              src={flyer.image_url}
              alt={flyer.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-500 transition">
            {flyer.title}
          </h3>

          {flyer.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {flyer.description}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span>{flyer.users?.full_name || '익명'}</span>
            </div>
            <time dateTime={flyer.created_at}>
              {formatDate(flyer.created_at)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}

// 날짜 포맷팅 유틸리티
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR');
}
```

#### B. 그리드 레이아웃

**[수정] `src/components/flyers/FlyerList.tsx`**

```typescript
export function FlyerList({ flyers, isLoading }: FlyerListProps) {
  if (isLoading) {
    return <FlyerListSkeleton />;
  }

  if (!flyers || flyers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {flyers.map((flyer) => (
        <FlyerCard key={flyer.uuid} flyer={flyer} />
      ))}
    </div>
  );
}
```

---

### 5. 로딩 상태 UI

#### A. Skeleton 컴포넌트

**[신규] `src/components/ui/Skeleton.tsx`**

```typescript
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton bg-gray-200 rounded ${className}`}
    />
  );
}

export function FlyerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function FlyerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <FlyerCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

#### B. 빈 상태 컴포넌트

**[신규] `src/components/ui/EmptyState.tsx`**

```typescript
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <FileQuestion className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        아직 전단지가 없습니다
      </h3>
      <p className="text-gray-500 mb-6 text-center">
        첫 번째 전단지를 만들어보세요!
      </p>
      <Link
        href="/flyers/new"
        className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
      >
        전단지 만들기
      </Link>
    </div>
  );
}
```

---

### 6. 에러 상태 처리

#### A. Error Boundary

**[신규] `src/components/ErrorBoundary.tsx`**

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '알 수 없는 오류'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### B. Toast 알림

**[신규] `src/components/ui/Toast.tsx`**

```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastContextType {
  showToast: (type: 'success' | 'error', message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
```

---

### 7. 페이지네이션

#### [신규] `src/components/ui/Pagination.tsx`

```typescript
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg ${
            currentPage === page
              ? 'bg-brand-500 text-white'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
```

**메인 페이지에 적용**:
```typescript
// src/app/page.tsx
const ITEMS_PER_PAGE = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const supabase = createClient();

  const { data: flyers, count } = await supabase
    .from('flyers')
    .select('*, users(full_name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div>
      <FlyerList flyers={flyers} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => router.push(`/?page=${p}`)}
      />
    </div>
  );
}
```

---

### 8. 상세 페이지 개선

#### [수정] `src/app/flyers/[id]/page.tsx`

**개선 사항**:
- Container 폭 제한
- Action 버튼 그룹화
- 작성자 정보 강화
- 공유 버튼 추가

```typescript
export default async function FlyerDetailPage({ params }: PageProps) {
  // ... (기존 코드)

  return (
    <article className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {flyer.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{flyer.users?.full_name || '익명'}</span>
                </div>
                <time>{formatDate(flyer.created_at)}</time>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/flyers/${params.id}/edit`}
                  className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>수정</span>
                </Link>
                <DeleteFlyerButton flyerId={params.id} />
              </div>
            )}
          </div>

          {/* Share Button */}
          <ShareButton url={window.location.href} title={flyer.title} />
        </div>

        {/* Content */}
        <div
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: flyer.html_content }}
        />
      </div>
    </article>
  );
}
```

---

### 9. 폼 UX 개선

#### [수정] `src/components/flyers/FlyerForm.tsx`

**개선 사항**:
- 실시간 문자 수 카운터
- 인라인 검증 에러
- 진행 상태 표시
- 취소 버튼

```typescript
<form onSubmit={handleSubmit} className="space-y-6">
  {/* 제목 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      제목 *
    </label>
    <input
      type="text"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      placeholder="전단지 제목을 입력하세요"
      maxLength={100}
    />
    <div className="flex justify-between mt-1">
      <p className="text-xs text-gray-500">
        {formData.title.length}/100
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  </div>

  {/* 이미지 업로드 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      이미지 * (최소 1개)
    </label>
    <ImageUpload
      onUploadComplete={handleImageUpload}
      onRemove={handleImageRemove}
    />
    {formData.imageUrls.length > 0 && (
      <p className="text-xs text-green-600 mt-1">
        {formData.imageUrls.length}개 이미지 업로드됨
      </p>
    )}
  </div>

  {/* 액션 버튼 */}
  <div className="flex items-center justify-end space-x-3">
    <button
      type="button"
      onClick={() => router.back()}
      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      취소
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
    >
      {isSubmitting && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span>{isSubmitting ? '저장 중...' : mode === 'create' ? '등록' : '수정'}</span>
    </button>
  </div>
</form>
```

---

### 10. 성능 최적화

#### A. Next.js Image 컴포넌트 사용

**모든 이미지를 Next.js Image로 변경**:

```typescript
import Image from 'next/image';

// Before
<img src={flyer.image_url} alt={flyer.title} />

// After
<Image
  src={flyer.image_url}
  alt={flyer.title}
  width={400}
  height={300}
  className="w-full h-full object-cover"
/>
```

**`next.config.js` 설정**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['<your-supabase-project>.supabase.co'],
  },
};

module.exports = nextConfig;
```

---

### 11. 접근성 개선

**체크리스트**:
- [ ] 모든 이미지에 `alt` 속성
- [ ] 버튼에 명확한 레이블
- [ ] 폼 필드에 `label` 연결
- [ ] 키보드 네비게이션 가능
- [ ] ARIA 레이블 추가
- [ ] 색상 대비 4.5:1 이상

**예시**:
```typescript
<button
  aria-label="전단지 삭제"
  onClick={handleDelete}
>
  <Trash2 className="w-4 h-4" />
</button>
```

---

## 검증 계획

### 1. 반응형 테스트

**Breakpoints**:
- Mobile: 320px ~ 767px
- Tablet: 768px ~ 1023px
- Desktop: 1024px+

**체크리스트**:
- [ ] Header 모바일 메뉴 동작
- [ ] 그리드 레이아웃 변화 (1 → 2 → 3 → 4 컬럼)
- [ ] 이미지 비율 유지
- [ ] 폼 입력 필드 크기
- [ ] 버튼 터치 영역 충분 (최소 44x44px)

### 2. 로딩 상태 테스트

**시나리오**:
- [ ] 메인 페이지 로딩 시 Skeleton UI 표시
- [ ] 전단지 작성 중 버튼 비활성화
- [ ] 이미지 업로드 중 진행 상태
- [ ] 삭제 중 로딩 표시

### 3. 에러 상태 테스트

**시나리오**:
- [ ] 네트워크 오류 시 Toast 메시지
- [ ] 404 페이지 표시
- [ ] 폼 검증 에러 인라인 표시
- [ ] Error Boundary 동작

### 4. 페이지네이션 테스트

**시나리오**:
- [ ] 페이지 번호 클릭 시 데이터 변경
- [ ] URL 쿼리 파라미터 반영 (`?page=2`)
- [ ] 첫/마지막 페이지 버튼 비활성화
- [ ] 총 페이지 수 계산 정확성

### 5. 접근성 테스트

**도구**:
- Lighthouse Accessibility 점수 90+ 목표
- 키보드만으로 전체 탐색 가능

### 6. 성능 테스트

**Lighthouse 점수 목표**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### 7. 브라우저 호환성

**지원 브라우저**:
- Chrome (최신 2버전)
- Firefox (최신 2버전)
- Safari (최신 2버전)
- Edge (최신 2버전)

---

## 구현 순서 권장사항

1. **디자인 시스템 설정** (Tailwind, 아이콘)
2. **Header 개선** (로고, 드롭다운)
3. **FlyerCard UI 고도화** (호버, 타이포)
4. **Skeleton & EmptyState** (로딩/빈 상태)
5. **Toast & ErrorBoundary** (에러 처리)
6. **Pagination** (목록 페이징)
7. **Hero Section** (랜딩 개선)
8. **상세 페이지 레이아웃** (Container, 버튼)
9. **폼 UX** (인라인 검증, 카운터)
10. **성능 최적화** (Image, lazy loading)
11. **접근성** (ARIA, 키보드)
12. **최종 검증** (반응형, 성능, 접근성)

---

## 선택사항 (추후 고려)

### 1. 다크모드

Tailwind의 `dark:` 클래스 활용

### 2. 애니메이션 라이브러리

Framer Motion 도입

### 3. 검색 기능

전단지 제목/설명 검색

### 4. 필터링

작성자별, 날짜별 필터

### 5. 공유 기능

SNS 공유 버튼 (Twitter, Facebook)
