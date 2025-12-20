# 전단지 사이트 구축 계획

## 1단계: 프로젝트 초기화
- Next.js 프로젝트 생성 (TypeScript, App Router)
- ESLint, Prettier 설정
- Tailwind CSS 설정 (UI 스타일링용)

## 2단계: Supabase 연동
- Supabase 프로젝트 설정 및 환경변수 구성
- Supabase Client 초기화 (`@supabase/supabase-js`)
- DB 스키마 설계 및 테이블 생성
  - `users`: 사용자 정보
  - `flyers`: 전단지 정보 (제목, 설명, 이미지 URL, 작성자 등)

## 3단계: 인증 구현 (Google OAuth)
- Supabase Auth + Google OAuth Provider 설정
- 로그인/로그아웃 기능 구현
- 인증 상태 관리 (Context 또는 zustand)
- 보호된 라우트(Protected Route) 처리

## 4단계: 파일 업로드 기능
- Supabase Storage 버킷 생성
- 이미지 업로드 컴포넌트 구현
- 이미지 미리보기 및 삭제 기능

## 5단계: 전단지 CRUD 기능
- 전단지 목록 조회 (메인 페이지)
- 전단지 상세 보기
- 전단지 등록/수정/삭제 (로그인 사용자만)

## 6단계: UI/UX 마무리
- 반응형 레이아웃
- 로딩/에러 상태 처리
- 페이지네이션 또는 무한스크롤

---

## 예상 폴더 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트
│   │   ├── login/
│   │   └── callback/
│   ├── flyers/            # 전단지 관련 라우트
│   │   ├── [id]/
│   │   └── new/
│   └── layout.tsx
├── components/            # 재사용 컴포넌트
├── lib/                   # 유틸리티, Supabase 클라이언트
└── types/                 # TypeScript 타입 정의
```
