# 커스텀 슬러그 라우팅 및 전용 뷰어 구현 계획

전단지를 공유할 때 더 전문적이고 구조적인 URL(`domain.com/{userUuid}/{flyerUuid}`)을 제공하기 위한 계획입니다. 이 경로는 사용자의 브랜딩과 전단지의 고유성을 동시에 나타냅니다.

## 현재 상황 분석

### 기존 구조
- **기존 라우트**: `/flyers/[id]/page.tsx` - 인증된 사용자용 상세 페이지
- **데이터베이스**: flyers 테이블 (uuid, user_id, title, description, image_url, html_url 등)
- **Storage**: Supabase Storage `flyers` 버킷, 경로: `html/{flyerUuid}.html`
- **HTML 로딩**: `fetchHTMLFromStorage(html_url)` 유틸리티 사용

### 신규 요구사항
- **공개 뷰어 URL**: `/{userUuid}/{flyerUuid}` - 비인증 사용자도 접근 가능
- **SEO 최적화**: SNS 공유 시 메타데이터 제공
- **보안**: URL 파라미터 검증 (userUuid와 flyerUuid 매칭)

## 제안된 변경 사항

### [컴포넌트] 신규 공개 뷰어 라우팅
#### [NEW] `src/app/[userUuid]/[flyerUuid]/page.tsx`

**주요 기능**:
1. **데이터 조회**
   - params로 `userUuid`, `flyerUuid` 추출
   - Supabase에서 전단지 조회:
     ```sql
     SELECT * FROM flyers
     WHERE uuid = {flyerUuid}
     AND user_id = {userUuid}
     ```
   - 매칭 실패 시 `notFound()` 호출

2. **보안 검증**
   - URL의 `userUuid`와 DB의 `user_id` 일치 여부 확인
   - 불일치 시 404 처리 (데이터 무결성 보장)
   - 공개 콘텐츠이므로 인증 체크는 불필요

3. **HTML 콘텐츠 로딩**
   - Storage 우선: `fetchHTMLFromStorage(flyer.html_url)`
   - 폴백: `flyer.html_content` (DB 백업)
   - 로딩 실패 시 에러 메시지 표시

4. **UI 구성**
   - **최소화된 레이아웃**: 헤더/푸터/네비게이션 없음
   - **전단지 콘텐츠 중심**: HTML 콘텐츠만 렌더링
   - **기본 정보 표시** (선택):
     - 작성자 이름 (users.full_name)
     - 작성일 (created_at)
   - 기존 `/flyers/[id]`의 편집/삭제 버튼은 제외

5. **에러 처리**
   - 전단지 없음: `notFound()` → 404 페이지
   - userUuid 불일치: `notFound()` → 404 페이지
   - Storage 로딩 실패: 에러 메시지 표시 또는 폴백
   - 서버 오류: try-catch로 처리

---

### [컴포넌트] 메타데이터 및 SEO
#### [수정] `src/app/[userUuid]/[flyerUuid]/page.tsx`

**generateMetadata 구현**:
```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userUuid, flyerUuid } = await params;
  const supabase = await createClient();

  const { data: flyer } = await supabase
    .from('flyers')
    .select('title, description, image_url')
    .eq('uuid', flyerUuid)
    .eq('user_id', userUuid)
    .single();

  if (!flyer) return { title: '전단지를 찾을 수 없습니다' };

  return {
    title: flyer.title,
    description: flyer.description || '전단지 상세 내용',
    openGraph: {
      title: flyer.title,
      description: flyer.description || undefined,
      images: flyer.image_url ? [{ url: flyer.image_url }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: flyer.title,
      description: flyer.description || undefined,
      images: flyer.image_url ? [flyer.image_url] : [],
    },
  };
}
```

**메타데이터 필드**:
- `title`: flyer.title
- `description`: flyer.description
- `openGraph.images`: flyer.image_url (썸네일)
- `twitter:card`: 큰 이미지 카드

---

### [선택] 기존 페이지 개선
#### [수정] `src/app/flyers/[id]/page.tsx`

**공유 링크 업데이트** (ShareButton 컴포넌트):
- 기존: `/flyers/{uuid}`
- 신규: `/{userUuid}/{flyerUuid}` 형식으로 공유 URL 변경
- 더 짧고 깔끔한 URL 제공

---

## 구현 순서

### 1단계: 기본 라우팅 구현
- [ ] `src/app/[userUuid]/[flyerUuid]/page.tsx` 파일 생성
- [ ] params 추출 및 데이터 조회 로직 작성
- [ ] userUuid-flyerUuid 매칭 검증 로직 추가
- [ ] notFound() 에러 처리

### 2단계: 콘텐츠 렌더링
- [ ] HTML 콘텐츠 로딩 (Storage → DB 폴백)
- [ ] 최소화된 레이아웃 UI 구현
- [ ] 기본 정보 표시 (작성자, 작성일)
- [ ] dangerouslySetInnerHTML로 HTML 렌더링

### 3단계: SEO 및 메타데이터
- [ ] generateMetadata 함수 구현
- [ ] OpenGraph 태그 설정
- [ ] Twitter Card 설정
- [ ] 썸네일 이미지 처리

### 4단계: 에러 처리 및 최적화
- [ ] Storage 로딩 실패 시 폴백 로직
- [ ] 로딩 상태 UI (선택)
- [ ] 캐싱 전략 확인 (force-cache 활용)
- [ ] 성능 테스트

### 5단계: 기존 코드 연동
- [ ] ShareButton에서 새 URL 형식 사용하도록 수정
- [ ] 기존 `/flyers/[id]` 페이지는 유지 (인증된 사용자용)

---

## 검증 계획

### 기능 테스트
1. **정상 접속 테스트**
   - URL: `/{valid-user-uuid}/{valid-flyer-uuid}`
   - 기대 결과: 전단지 콘텐츠 정상 렌더링
   - 확인 사항: HTML 콘텐츠, 작성자 정보, 작성일 표시

2. **보안 검증 테스트**
   - URL: `/{wrong-user-uuid}/{flyer-uuid}`
   - 기대 결과: 404 Not Found
   - URL: `/{user-uuid}/{wrong-flyer-uuid}`
   - 기대 결과: 404 Not Found

3. **Storage 폴백 테스트**
   - html_url이 없거나 Storage 로딩 실패 시
   - 기대 결과: html_content (DB)에서 로드
   - html_content도 없을 경우: 에러 메시지 표시

4. **비인증 접근 테스트**
   - 로그아웃 상태에서 URL 접속
   - 기대 결과: 정상 렌더링 (공개 뷰어)

### SEO/메타데이터 검증
1. **메타데이터 확인**
   - 브라우저 개발자 도구 → Elements → `<head>` 태그 확인
   - `<meta property="og:title">`, `og:description`, `og:image` 존재 확인

2. **SNS 공유 미리보기**
   - 카카오톡: [Kakao Developers - 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)
   - 페이스북: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - 기대 결과: 제목, 설명, 썸네일 이미지 정상 표시

3. **검색엔진 크롤링**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - 구조화된 데이터 및 메타데이터 검증

### 성능 테스트
1. **초기 로딩 속도**
   - Lighthouse 성능 점수 확인
   - LCP (Largest Contentful Paint) < 2.5초 목표

2. **캐싱 동작**
   - 두 번째 접속 시 캐시에서 로드되는지 확인
   - Network 탭에서 `(from disk cache)` 확인

---

## 주요 고려사항

### 1. 기존 페이지와의 차이점
| 항목 | `/flyers/[id]` (기존) | `/[userUuid]/[flyerUuid]` (신규) |
|------|----------------------|----------------------------------|
| 대상 | 인증된 사용자 (소유자 중심) | 모든 사용자 (공개 공유) |
| 레이아웃 | 헤더/네비게이션/버튼 포함 | 최소화 (콘텐츠 중심) |
| 편집/삭제 | 소유자만 가능 | 없음 |
| 보안 검증 | isOwner 체크 | userUuid 매칭 검증 |
| 용도 | 관리 및 확인 | 공유 및 배포 |

### 2. URL 설계의 장점
- **계층 구조**: 사용자 → 전단지 관계 명확
- **브랜딩**: userUuid로 사용자 식별 가능
- **간결함**: `/flyers/` prefix 제거로 더 짧은 URL
- **SEO**: 의미 있는 URL 구조

### 3. 보안 및 성능
- **보안**: URL 파라미터 검증으로 잘못된 접근 차단
- **성능**: Storage 캐싱 (`force-cache`) 활용
- **폴백**: DB 백업으로 안정성 확보

### 4. 향후 확장 가능성
- 사용자 프로필 페이지: `/{userUuid}` → 해당 사용자의 모든 전단지 목록
- 커스텀 도메인: `custom-domain.com/{flyerUuid}` (userUuid 생략)
- 통계/분석: 조회수, 공유 수 트래킹
