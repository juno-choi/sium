# 농산물 판매 템플릿(Apple) 구현 계획

사용자가 업로드한 이미지를 기반으로, 농산물 판매에 최적화된 고품질 웹 전단지 템플릿을 추가합니다.

## 주요 목표
1. **정형화된 데이터 입력**: 과수별 가격, 연락처, 계좌번호 등을 구조화하여 입력받음.
2. **고급 레이아웃 재현**: 제공된 이미지의 배치(테이블, 강조 문구, 이미지)를 현대적인 CSS로 재현.
3. **확장 가능한 구조**: 향후 다른 유형의 템플릿 추가가 용이하도록 시스템 개선.

## 사용자 입력 데이터 구조 (`form_data`)
```typescript
{
  template_id: 'apple',
  form_data: {
    mainPrice: string;       // 대표 가격 (예: 35,000원)
    shippingNote: string;    // 택배비 안내 (예: 택배비 포함)
    shippingFee: string;     // 상세 택배비 정보 (예: 별도 5천원)
    products: Array<{        // 판매 목록 (테이블 데이터)
      category: string;      // 카테고리 (예: 과수 5kg)
      items: Array<{
        name: string;        // 품목명 (예: 12~13과)
        price: string;       // 가격 (예: 75,000)
        quantity: string;    // 갯수/참고 (예: 12~13)
      }>
    }>;
    contacts: Array<{        // 연락처
      name: string;
      phone: string;
    }>;
    account: {               // 계좌 정보
      bank: string;
      number: string;
      owner: string;
    };
    additionalInfo: string;  // 하단 안내 문구
    externalUrl: string;     // 판매 사이트 링크
  }
}
```

## Proposed Changes

### 1. 타입 및 유틸리티 확장
#### [수정] [flyer.ts](file:///c:/project/personal/2025/sium/src/types/flyer.ts)
- `AppleTemplateData` 인터페이스 정의 추가.

#### [수정] [flyer-template.ts](file:///c:/project/personal/2025/sium/src/lib/flyer-template.ts)
- `template_id`에 따른 분기 로직 추가.
- `generateAppleTemplateHTML` 함수 구현:
    - CSS Grid/Flexbox를 활용한 전문적인 레이아웃.
    - 접근성을 고려한 미려한 테이블 디자인.
    - 외부 링크 연결용 버튼 추가.

### 2. UI/UX 개선 (입력 폼)
#### [수정] [FlyerForm.tsx](file:///c:/project/personal/2025/sium/src/components/flyers/FlyerForm.tsx)
- **템플릿 선택기**: '기본'과 '농산물 판매' 중 선택 가능.
- **동적 필드 렌더링**: '농산물 판매' 선택 시 테이블 행 추가, 연락처 추가 등 전용 입력 UI 노출.

### 3. 스타일링
#### [수정] [globals.css](file:///c:/project/personal/2025/sium/src/app/globals.css)
- `apple` 템플릿 전용 스타일(폰트, 컬러셋, 테이블 스타일) 추가.

## Verification Plan

### Automated Tests/Verification
- `generateAppleTemplateHTML` 함수에 목데이터(Mock Data)를 넣어 생성된 HTML 구조 확인.
- 브라우저 도구를 사용하여 모바일/데스크탑 반응형 레이아웃 확인.

### Manual Verification
1. `flyers/new` 페이지 접속.
2. '농산물 판매' 템플릿 선택.
3. 과수별 가격, 계좌번호 등 모든 필드 입력 후 '생성' 클릭.
4. 결과 페이지에서 이미지와 유사한 고품질 전단지가 노출되는지 확인.
5. 판매 사이트 링크 버튼 작동 확인.
