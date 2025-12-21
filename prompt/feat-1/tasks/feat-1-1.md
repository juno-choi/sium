# 전단지 사이트 구축 작업 목록

## 1단계: 프로젝트 초기화
- [x] Next.js 프로젝트 생성 (TypeScript, App Router)
- [x] ESLint, Prettier 설정
- [x] Tailwind CSS 설정 (UI 스타일링용)

## 2단계: Supabase 연동
- [x] Supabase 프로젝트 설정 및 환경변수 구성
- [x] Supabase Client 초기화 (`@supabase/supabase-js`)
- [x] DB 스키마 설계 및 테이블 생성
  - [x] `users` 테이블 생성
  - [x] `flyers` 테이블 생성

## 3단계: 인증 구현 (Google OAuth)
- [x] Supabase Auth + Google OAuth Provider 설정
- [x] 로그인 페이지 구현
- [x] 로그아웃 기능 구현
- [x] 인증 상태 관리 (Server Component + UserMenu)
- [x] 미들웨어(Middleware)를 이용한 보호된 라우트 처리

## 4단계: 파일 업로드 기능
- [x] Supabase Storage 버킷 생성 (`flyers`) - *SQL 적용 필요*
- [x] 이미지 업로드 컴포넌트 구현
- [x] 이미지 미리보기 기능
- [x] 이미지 삭제 기능

## 5단계: 전단지 CRUD 기능
- [ ] 메인 페이지: 전단지 목록 조회 (Grid 레이아웃)
- [ ] 상세 페이지: 전단지 상세 정보 표시
- [ ] 작성 페이지: 전단지 등록 폼 (로그인 사용자 전용)
- [ ] 수정/삭제 기능 구현 (작성자 본인만 가능)

## 6단계: UI/UX 마무리
- [ ] 반응형 레이아웃 최적화 (모바일/데스크탑)
- [ ] 로딩 스켈레톤(Skeleton) 및 에러 상태 처리
- [ ] 페이지네이션 또는 무한 스크롤(Infinite Scroll) 적용
- [ ] 최종 디자인 폴리싱 (폰트, 색상, 애니메이션)
