# 농산물 판매 템플릿(Apple) 구현 계획

`template1.png` 이미지를 기반으로, 사과 농산물 판매에 최적화된 고품질 웹 전단지 템플릿을 추가합니다.

## 주요 목표
1. **정형화된 데이터 입력**: 과수별 가격표(5KG/10KG), 연락처, 계좌번호, 사과즙 판매 정보 등을 구조화하여 입력받음.
2. **고급 레이아웃 재현**: 제공된 이미지의 배치(테이블, 강조 문구, 이미지, 컬러 스키마)를 현대적인 CSS로 재현.
3. **반응형 디자인**: 모바일/데스크탑 모두에서 가독성 높은 레이아웃 제공.
4. **확장 가능한 구조**: 향후 다른 유형의 템플릿 추가가 용이하도록 시스템 개선.

## 템플릿 레이아웃 분석 (template1.png 기준)

### 섹션 구조
1. **상단 영역** (2컬럼)
   - **왼쪽**: 과수(5KG) 가격표 - 빨간색 헤더 테이블
   - **오른쪽**: 사과즙 판매 정보 - 이미지 + 가격 + 택배비 안내

2. **전화번호 영역**
   - 빨간 전화기 아이콘 + "전화번호" 제목
   - 2개의 연락처 박스 (이름 + 전화번호)

3. **안내 문구 영역**
   - 판매 품종 안내 (아리수, 감홍, 시나노골드, 부사)
   - 주문 시 필수 정보 안내 (성함, 전화번호, 주소)

4. **택배비 강조 영역**
   - 빨간 배경: "택배비 별도 5천원"

5. **계좌번호 영역**
   - 초록 체크마크 + "계좌번호" 제목
   - 계좌 정보 박스
   - 사과 이미지

6. **하단 영역**
   - 과수(10KG) 가격표 - 초록색 헤더 테이블

### 컬러 스키마
- **Primary Red**: 테이블 헤더(5KG), 전화번호 섹션, 택배비 배너
- **Primary Green**: 테이블 헤더(10KG), 계좌번호 섹션
- **Beige Background**: 전체 배경색
- **White**: 카드 배경, 테이블 행

## 사용자 입력 데이터 구조 (`form_data`)

```typescript
interface AppleTemplateData {
  template_id: 'apple';
  form_data: {
    // 사과즙 판매 정보
    juiceSale: {
      productName: string;      // 상품명 (예: 사과즙 판매)
      price: string;            // 가격 (예: 35,000원)
      shippingNote: string;     // 택배비 안내 (예: 택배비 포함)
      imageUrl?: string;        // 사과즙 이미지 URL (선택)
    };

    // 과수 5KG 가격표
    table5kg: Array<{
      range: string;            // 과수 범위 (예: 12~13과)
      price: string;            // 가격 (예: 75,000)
      quantity: string;         // 갯수 (예: 12~13)
    }>;

    // 연락처 (최대 2개)
    contacts: Array<{
      name: string;             // 이름 (예: 이왕자)
      phone: string;            // 전화번호 (예: 010-8522-3378)
    }>;

    // 판매 품종 안내
    varieties: string;          // 판매 품종 (예: 아리수, 감홍, 시나노골드, 부사 판매)

    // 주문 안내 문구
    orderInstruction: string;   // 주문 시 안내 (예: 주문 시 "성함, 전화번호, 주소" 빠짐없이 보내주세요)

    // 택배비 정보
    shippingFee: string;        // 택배비 (예: 택배비 별도 5천원)

    // 계좌 정보
    account: {
      bank: string;             // 은행명 (예: 농협)
      number: string;           // 계좌번호 (예: 352-1117-5671-23)
      owner: string;            // 예금주 (예: 최학래)
    };

    // 과수 10KG 가격표
    table10kg: Array<{
      range: string;            // 과수 범위 (예: 12~13과)
      price: string;            // 가격 (예: 140,000)
      quantity: string;         // 갯수 (예: 24~26)
    }>;

    // 사과 이미지 (선택)
    appleImageUrl?: string;     // 하단 사과 이미지 URL
  };
}
```

## 제안된 변경 사항

### 1. 타입 정의
#### [수정] `src/types/flyer.ts`
- `AppleTemplateData` 인터페이스 추가
- `FlyerFormData`에 Apple 템플릿 필드 추가

```typescript
export interface AppleTemplateData {
  juiceSale: {
    productName: string;
    price: string;
    shippingNote: string;
    imageUrl?: string;
  };
  table5kg: Array<{
    range: string;
    price: string;
    quantity: string;
  }>;
  contacts: Array<{
    name: string;
    phone: string;
  }>;
  varieties: string;
  orderInstruction: string;
  shippingFee: string;
  account: {
    bank: string;
    number: string;
    owner: string;
  };
  table10kg: Array<{
    range: string;
    price: string;
    quantity: string;
  }>;
  appleImageUrl?: string;
}
```

---

### 2. HTML 생성 로직
#### [수정] `src/lib/flyer-template.ts`

**주요 구현 내용**:

1. **템플릿 분기 로직**
```typescript
export function generateFlyerHTML(templateId: string, formData: any): string {
  switch (templateId) {
    case 'apple':
      return generateAppleTemplateHTML(formData);
    case 'basic':
    default:
      return generateBasicTemplateHTML(formData);
  }
}
```

2. **`generateAppleTemplateHTML` 함수 구현**

**레이아웃 구조**:
```html
<div class="apple-template">
  <!-- 상단 2컬럼 -->
  <div class="top-section">
    <!-- 왼쪽: 5KG 가격표 -->
    <div class="price-table-5kg">
      <table>
        <thead>
          <tr>
            <th>과수(5KG)</th>
            <th>가격</th>
            <th>갯수</th>
          </tr>
        </thead>
        <tbody>
          <!-- table5kg 데이터 렌더링 -->
        </tbody>
      </table>
    </div>

    <!-- 오른쪽: 사과즙 판매 -->
    <div class="juice-sale">
      <img src="{imageUrl}" alt="사과즙" />
      <h2>{productName}</h2>
      <p class="price">{price}</p>
      <p class="shipping">{shippingNote}</p>
    </div>
  </div>

  <!-- 전화번호 섹션 -->
  <div class="contact-section">
    <h3>📞 전화번호</h3>
    <div class="contact-list">
      <!-- contacts 배열 렌더링 -->
    </div>
  </div>

  <!-- 안내 문구 -->
  <div class="info-section">
    <p class="varieties">{varieties}</p>
    <p class="order-instruction">{orderInstruction}</p>
  </div>

  <!-- 택배비 배너 -->
  <div class="shipping-banner">
    {shippingFee}
  </div>

  <!-- 계좌번호 섹션 -->
  <div class="account-section">
    <h3>✅ 계좌번호</h3>
    <div class="account-info">
      {account.number}<br />
      {account.bank} - {account.owner}
    </div>
    {appleImageUrl && <img src="{appleImageUrl}" alt="사과" />}
  </div>

  <!-- 하단: 10KG 가격표 -->
  <div class="price-table-10kg">
    <table>
      <thead>
        <tr>
          <th>과수(10KG)</th>
          <th>가격</th>
          <th>갯수</th>
        </tr>
      </thead>
      <tbody>
        <!-- table10kg 데이터 렌더링 -->
      </tbody>
    </table>
  </div>
</div>
```

**CSS 스타일링**:
- **컬러 변수**:
  ```css
  --apple-red: #DC2626;      /* 빨간색 헤더, 배너 */
  --apple-green: #16A34A;    /* 초록색 헤더 */
  --apple-beige: #F5F5DC;    /* 배경색 */
  --apple-pink: #FFE4E1;     /* 테이블 행 배경 */
  ```

- **테이블 스타일**:
  - 헤더: 굵은 글꼴, 흰색 텍스트, 빨간/초록 배경
  - 행: 번갈아가며 흰색/연분홍 배경
  - 테두리: 없음 또는 미세한 회색

- **반응형 디자인**:
  - 모바일: 1컬럼 (세로 배치)
  - 데스크탑: 상단 2컬럼 유지

- **폰트**:
  - 굵은 고딕체 (헤더, 가격)
  - 중간 두께 (본문)

---

### 3. 입력 폼 UI
#### [수정] `src/components/flyers/FlyerForm.tsx`

**템플릿 선택기 추가**:
```tsx
<select name="template_id" onChange={handleTemplateChange}>
  <option value="basic">기본 템플릿</option>
  <option value="apple">농산물 판매 템플릿</option>
</select>
```

**동적 필드 렌더링** (templateId === 'apple' 일 때):

1. **사과즙 판매 정보**
   - 상품명 입력
   - 가격 입력
   - 택배비 안내 입력
   - 이미지 업로드 (선택)

2. **5KG 가격표**
   - 행 추가 버튼 (기본 7개 행)
   - 각 행: 과수 범위, 가격, 갯수 입력

3. **연락처** (최대 2개)
   - 이름, 전화번호 입력
   - 추가/삭제 버튼

4. **안내 문구**
   - 판매 품종 입력 (텍스트)
   - 주문 안내 입력 (텍스트)

5. **택배비 정보**
   - 택배비 입력 (예: 택배비 별도 5천원)

6. **계좌 정보**
   - 은행명, 계좌번호, 예금주 입력

7. **10KG 가격표**
   - 행 추가 버튼 (기본 7개 행)
   - 각 행: 과수 범위, 가격, 갯수 입력

8. **사과 이미지**
   - 이미지 업로드 (선택)

**UX 개선**:
- 각 섹션을 접을 수 있는 아코디언 UI
- 실시간 미리보기 (선택)
- 행 추가/삭제 버튼
- 가격 자동 포맷팅 (1000 단위 쉼표)
- 전화번호 자동 포맷팅 (010-1234-5678)

---

### 4. 기존 코드 연동
#### [수정] `src/app/flyers/new/page.tsx`
- FlyerForm에 템플릿 선택 기능 전달
- Apple 템플릿 데이터 검증 로직 추가

#### [확인] `src/lib/storage/html-storage.ts`
- 기존 로직 재사용 (변경 없음)
- HTML 파일을 Storage에 저장하는 기능 활용

---

## 구현 순서

### 1단계: 타입 정의 및 기본 구조
- [ ] `src/types/flyer.ts`에 `AppleTemplateData` 인터페이스 추가
- [ ] 타입스크립트 컴파일 에러 없는지 확인

### 2단계: HTML 생성 로직 구현
- [ ] `src/lib/flyer-template.ts`에 `generateAppleTemplateHTML` 함수 작성
- [ ] HTML 구조 구현 (테이블, 섹션 등)
- [ ] 인라인 CSS 스타일 추가
- [ ] 목(Mock) 데이터로 HTML 생성 테스트

### 3단계: 스타일링 최적화
- [ ] 컬러 변수 정의 및 적용
- [ ] 테이블 스타일링 (헤더, 행, 테두리)
- [ ] 반응형 디자인 (모바일/데스크탑)
- [ ] 폰트 및 간격 조정

### 4단계: 입력 폼 UI 구현
- [ ] FlyerForm에 템플릿 선택 드롭다운 추가
- [ ] Apple 템플릿 전용 필드 컴포넌트 작성
- [ ] 행 추가/삭제 기능 구현
- [ ] 이미지 업로드 필드 추가
- [ ] 폼 검증 로직 추가

### 5단계: 통합 및 테스트
- [ ] 폼 제출 시 데이터 검증
- [ ] HTML 생성 및 Storage 저장
- [ ] 생성된 전단지 미리보기
- [ ] 반응형 테스트 (모바일/데스크탑)

### 6단계: 완성도 향상
- [ ] 이미지 원본과 비교하여 레이아웃 미세 조정
- [ ] 가독성 개선 (폰트 크기, 간격, 색상)
- [ ] 에러 처리 및 폴백 UI
- [ ] 성능 최적화 (이미지 로딩, CSS 최적화)

---

## 검증 계획

### 기능 테스트
1. **템플릿 선택 테스트**
   - `/flyers/new` 페이지 접속
   - 템플릿 드롭다운에서 "농산물 판매 템플릿" 선택
   - Apple 템플릿 전용 필드가 표시되는지 확인

2. **데이터 입력 테스트**
   - 모든 필드에 샘플 데이터 입력:
     - 사과즙 판매 정보
     - 5KG 가격표 (7개 행)
     - 연락처 (2개)
     - 안내 문구
     - 택배비 정보
     - 계좌 정보
     - 10KG 가격표 (7개 행)
   - 이미지 업로드 (사과즙 이미지, 사과 이미지)
   - "생성" 버튼 클릭

3. **HTML 생성 테스트**
   - 생성된 HTML이 template1.png와 유사한지 비교
   - 모든 데이터가 올바른 위치에 렌더링되는지 확인
   - 테이블 행이 정확히 표시되는지 확인

4. **스타일 검증**
   - 컬러 스키마가 원본과 일치하는지 확인:
     - 5KG 테이블 헤더: 빨간색
     - 10KG 테이블 헤더: 초록색
     - 배경: 베이지색
     - 전화번호/택배비: 빨간색
     - 계좌번호: 초록색
   - 폰트 크기 및 굵기 확인
   - 간격 및 패딩 확인

### 반응형 테스트
1. **모바일 (375px)**
   - 2컬럼이 1컬럼으로 변경되는지 확인
   - 테이블이 가로 스크롤 없이 표시되는지 확인
   - 텍스트 크기가 적절한지 확인
   - 이미지 크기 조절 확인

2. **태블릿 (768px)**
   - 레이아웃이 적절히 조정되는지 확인

3. **데스크탑 (1024px+)**
   - 2컬럼 레이아웃 유지
   - 최대 너비 제한 (가독성)

### 비교 검증
1. **원본 이미지와 비교**
   - template1.png와 생성된 HTML을 나란히 비교
   - 레이아웃, 컬러, 폰트, 간격이 유사한지 확인
   - 차이점 기록 및 조정

2. **데이터 정확성**
   - 입력한 데이터가 HTML에 정확히 반영되는지 확인
   - 가격 포맷팅 (쉼표) 확인
   - 전화번호 포맷팅 확인

### 에러 처리 테스트
1. **필수 필드 누락**
   - 사과즙 판매 정보 없이 제출 → 에러 메시지
   - 연락처 없이 제출 → 에러 메시지
   - 계좌 정보 없이 제출 → 에러 메시지

2. **잘못된 데이터 형식**
   - 전화번호 형식 오류 → 에러 메시지
   - 가격에 문자 입력 → 에러 메시지

3. **이미지 업로드 실패**
   - 이미지 없이도 HTML 생성 가능한지 확인
   - 기본 이미지 또는 공백 처리 확인

### 성능 테스트
1. **HTML 생성 속도**
   - 대량 데이터(테이블 20개 행)에서도 빠르게 생성되는지 확인

2. **이미지 로딩**
   - 이미지 최적화 (크기, 포맷) 확인
   - Lazy loading 적용 여부

---

## 주요 고려사항

### 1. 템플릿 확장성
- 향후 다른 템플릿(배, 포도 등) 추가 시 `generateFlyerHTML`에 case 추가만으로 확장 가능
- 템플릿별 CSS를 인라인 스타일로 관리하여 독립성 유지

### 2. 데이터 검증
- 필수 필드: juiceSale, contacts, account, table5kg, table10kg
- 선택 필드: imageUrl, appleImageUrl
- 가격/전화번호 포맷팅 자동화

### 3. 이미지 처리
- 사용자가 이미지를 업로드하지 않을 경우:
  - 기본 placeholder 이미지 사용
  - 또는 해당 섹션 숨김 처리
- 이미지 크기 제한 (최대 2MB)
- 이미지 포맷: JPG, PNG, WebP

### 4. 접근성 (Accessibility)
- 테이블에 `<thead>`, `<tbody>` 사용
- 이미지에 `alt` 텍스트 추가
- 충분한 색상 대비 (WCAG 2.1 AA 기준)
- 키보드 네비게이션 가능

### 5. SEO 최적화
- 시맨틱 HTML 사용 (`<table>`, `<section>`, `<h2>` 등)
- 메타데이터 활용 (step-9 계획 참고)

### 6. 향후 개선 사항
- **실시간 미리보기**: 폼 입력 중 실시간으로 HTML 미리보기
- **템플릿 갤러리**: 다양한 템플릿 예시 제공
- **커스터마이징**: 사용자가 컬러/폰트 선택 가능
- **PDF 내보내기**: HTML을 PDF로 변환하는 기능
- **통계**: 어떤 템플릿이 많이 사용되는지 트래킹
