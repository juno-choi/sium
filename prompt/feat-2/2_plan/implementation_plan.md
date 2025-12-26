# Sium Phase 2: 캐릭터 커스터마이징 & 골드 시스템 기획

## 1. 개요

기존의 경험치 기반 성장 시스템을 확장하여, 사람형 캐릭터에 장비를 착용하고, 골드를 벌어 아이템을 구매하며, 외형을 커스터마이징할 수 있는 기능을 추가합니다.

### 주요 목표

| 순번 | 기능 | 설명 |
|------|------|------|
| 1 | 장비 시스템 | 모자, 상의, 하의, 신발, 장갑, 얼굴장식 6개 슬롯의 장비 착용 |
| 2 | 골드 시스템 | 퀘스트 완료 시 골드 획득, 상점에서 장비 구매 |
| 3 | 캐릭터 커스터마이징 | 헤어스타일, 성형(얼굴형), 피부색 변경 |
| 4 | 퀘스트 취소 | 완료한 퀘스트를 다시 미완료 상태로 되돌리기 |
| 5 | 메인 페이지 리뉴얼 | 프로젝트 테마에 맞는 판타지/모험 테마로 변경 |

---

## 2. 데이터베이스 스키마 변경

### 2.1 기존 테이블 수정

#### `user_characters` 테이블 확장
```sql
ALTER TABLE user_characters ADD COLUMN gold INTEGER DEFAULT 0;
ALTER TABLE user_characters ADD COLUMN hair_style VARCHAR(50) DEFAULT 'default';
ALTER TABLE user_characters ADD COLUMN face_shape VARCHAR(50) DEFAULT 'default';
ALTER TABLE user_characters ADD COLUMN skin_color VARCHAR(20) DEFAULT '#FFDAB9';
```

### 2.2 신규 테이블

#### `equipment_items` (장비 아이템 마스터)
```sql
CREATE TABLE equipment_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slot VARCHAR(20) NOT NULL, -- 'hat', 'top', 'bottom', 'shoes', 'gloves', 'face_accessory'
  image_url VARCHAR(255),
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_equipment` (유저 보유 장비)
```sql
CREATE TABLE user_equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES equipment_items(id),
  is_equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);
```

### 2.3 캐릭터 커스터마이징 옵션

#### `customization_options` (커스터마이징 옵션 마스터)
```sql
CREATE TABLE customization_options (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL, -- 'hair', 'face', 'skin'
  name VARCHAR(50) NOT NULL,
  value VARCHAR(100) NOT NULL, -- 이미지URL 또는 색상코드
  price INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE
);
```

---

## 3. 골드 시스템 설계

### 3.1 골드 획득량 (난이도별)

| 난이도 | 경험치 | 골드 |
|--------|--------|------|
| 쉬움 (easy) | +10 XP | +100 G |
| 보통 (normal) | +20 XP | +200 G |
| 어려움 (hard) | +35 XP | +350 G |

### 3.2 골드 차감 케이스
- 상점에서 장비 구매
- 커스터마이징 옵션 변경 (이후에는 일부 유료로 전환 가능)

---

## 4. 장비 슬롯 구조

```
┌─────────────────────────────────────┐
│              [모자/Hat]              │
│                                     │
│     [얼굴장식]      [헤어]           │
│                                     │
│              [상의/Top]              │
│                                     │
│      [장갑]                [장갑]    │
│                                     │
│              [하의/Bottom]           │
│                                     │
│              [신발/Shoes]            │
└─────────────────────────────────────┘
```

### 슬롯별 정의

| 슬롯 Key | 한글명 | 설명 |
|----------|--------|------|
| `hat` | 모자 | 헬멧, 왕관, 리본 등 |
| `top` | 상의 | 갑옷, 로브, 티셔츠 등 |
| `bottom` | 하의 | 바지, 스커트 등 |
| `shoes` | 신발 | 부츠, 샌들 등 |
| `gloves` | 장갑 | 건틀렛, 손목밴드 등 |
| `face_accessory` | 얼굴장식 | 안경, 마스크, 수염 등 |

---

## 5. 퀘스트 Clear 취소 기능

### 5.1 요구사항
- 이미 완료한 퀘스트를 다시 '미완료' 상태로 되돌릴 수 있음
- 취소 시 획득했던 XP와 골드를 차감함
- 당일 완료한 퀘스트만 취소 가능 (과거 기록은 변경 불가)

### 5.2 API 흐름
1. `habit_logs`에서 해당 날짜의 로그 삭제
2. `user_characters.current_xp` 차감 (레벨 다운 시 롤백 처리)
3. `user_characters.gold` 차감

---

## 6. 메인 페이지 리뉴얼 컨셉

### 6.1 테마: **판타지 모험**
- 기존: 심플한 인디고 톤의 깔끔한 랜딩
- 변경: 중세 판타지 + 게임 UI 느낌의 몰입감 있는 디자인

### 6.2 주요 변경 요소

| 섹션 | Before | After |
|------|--------|-------|
| Hero | 그라데이션 텍스트 | 캐릭터 일러스트 + 퀘스트 스크롤 |
| Features | 단순 카드 레이아웃 | 던전/마을 지도 스타일 |
| CTA | 인디고 버튼 | 게임 UI 스타일 버튼 (칼/방패 아이콘) |
| Footer | 심플 | 판타지 세계관 설명 |

### 6.3 색상 팔레트 제안

| 용도 | 색상 | 코드 |
|------|------|------|
| Primary | 로얄 퍼플 | `#6C3483` |
| Secondary | 골드 | `#F4D03F` |
| Accent | 에메랄드 | `#1ABC9C` |
| Background | 다크 네이비 | `#1B2631` |
| Surface | 오프화이트 | `#F8F9F9` |

---

## 7. 폴더 구조 변경

### 신규 추가 항목

```
src/
├── app/
│   ├── shop/                    # [NEW] 상점 페이지
│   │   └── page.tsx
│   └── character/               # [NEW] 캐릭터 커스터마이징
│       └── page.tsx
├── components/
│   ├── character/
│   │   ├── CharacterAvatar.tsx  # [NEW] 장비 착용 캐릭터 렌더링
│   │   └── EquipmentSlot.tsx    # [NEW] 장비 슬롯 UI
│   └── shop/
│       ├── ShopItem.tsx         # [NEW] 상점 아이템 카드
│       └── ShopCategory.tsx     # [NEW] 카테고리 필터
├── lib/
│   └── hooks/
│       ├── useEquipment.ts      # [NEW] 장비 관리 훅
│       └── useShop.ts           # [NEW] 상점/구매 훅
└── types/
    └── equipment.ts             # [NEW] 장비 관련 타입
```

---

## 8. UI/UX 상세

### 8.1 캐릭터 아바타 렌더러

캐릭터는 레이어 기반의 SVG 또는 이미지로 구성:

```
Z-Order (뒤 → 앞):
1. 배경/그림자
2. 신발
3. 하의
4. 상의
5. 장갑
6. 피부/몸체
7. 헤어
8. 얼굴/표정
9. 얼굴장식
10. 모자
```

### 8.2 상점 UI

```
┌─────────────────────────────────────────────┐
│  [모자] [상의] [하의] [신발] [장갑] [얼굴]   │  ← 카테고리 탭
├─────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 🎩     │ │ 👑     │ │ 🎀     │          │
│  │ 실크햇 │ │ 황금왕관│ │ 리본   │          │
│  │ 500 G  │ │ 2000 G │ │ 100 G  │          │
│  │ [구매] │ │ [구매] │ │ [보유] │          │
│  └────────┘ └────────┘ └────────┘          │
└─────────────────────────────────────────────┘
│  💰 내 골드: 1,250 G                        │
└─────────────────────────────────────────────┘
```

---

## 9. 구현 우선순위

| 순서 | 기능 | 예상 일정 | 의존성 |
|------|------|----------|--------|
| 1 | DB 스키마 업데이트 | 0.5일 | - |
| 2 | 골드 시스템 + 퀘스트 취소 | 1일 | DB 완료 |
| 3 | 장비 시스템 기본 구현 | 2일 | 골드 완료 |
| 4 | 상점 페이지 | 1.5일 | 장비 완료 |
| 5 | 캐릭터 커스터마이징 | 1.5일 | 장비 완료 |
| 6 | 메인 페이지 리뉴얼 | 1일 | - |
| 7 | 테스트 & 마무리 | 0.5일 | 전체 |

**총 예상 기간: 8일**

---

## 10. 검증 계획

### 10.1 수동 테스트

1. **골드 획득**
   - 퀘스트 완료 → 대시보드에서 골드 증가 확인
   - 난이도별 골드 차등 지급 확인

2. **퀘스트 취소**
   - 완료된 퀘스트 옆 취소 버튼 클릭
   - XP, 골드 차감 확인
   - 캐릭터 상태 실시간 반영 확인

3. **장비 구매 및 착용**
   - 상점에서 아이템 구매
   - 골드 차감 확인
   - 인벤토리에 아이템 추가 확인
   - 장비 착용 후 캐릭터 외형 변화 확인

4. **커스터마이징**
   - 헤어/얼굴/피부색 변경
   - 변경사항 저장 및 유지 확인

5. **메인 페이지**
   - 새로운 테마 디자인 적용 확인
   - 반응형 레이아웃 확인

### 10.2 테스트 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 테스트
http://localhost:3000
```

---

## 11. 리스크 및 고려사항

> [!WARNING]
> **캐릭터 에셋 필요**
> 사람형 캐릭터와 장비 이미지 에셋이 필요합니다. 초기에는 이모지 또는 간단한 SVG로 대체하고 추후 에셋을 준비할 수 있습니다.

> [!IMPORTANT]
> **레벨 롤백 로직**
> 퀘스트 취소로 XP가 마이너스가 되는 경우 레벨도 함께 내려가야 합니다. 이 로직의 정확한 처리가 필요합니다.

> [!NOTE]
> **초기 데이터**
> 상점에 판매할 장비 아이템과 커스터마이징 옵션의 시드 데이터 준비가 필요합니다.
