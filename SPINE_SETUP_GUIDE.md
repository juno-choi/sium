# Spine 캐릭터 시스템 설정 가이드 (Phase 1)

## ✅ 완료된 작업

- ✅ **Step 1**: Phaser 및 spine-phaser 패키지 설치 완료
  ```
  phaser@3.87.0
  @esotericsoftware/spine-phaser@4.2.47
  ```

## 📋 남은 작업 (Step 2-5)

### Step 2: Supabase Storage Bucket 생성 (5분)

**Supabase Dashboard 진행:**

1. https://supabase.com/dashboard 접속
2. 좌측 메뉴 → **Storage**
3. **Create a new bucket** 클릭
4. 다음 설정으로 생성:

```
Name: assets
Public: ❌ 체크 해제 (Private bucket)
Allowed MIME types: image/png,image/jpeg,application/json,text/plain
File size limit: 5MB
```

**결과 확인:**
- Storage > assets 폴더가 보여야 함

---

### Step 3: Spine 에셋 파일 업로드 (10분)

**선택 옵션 1: 대시보드에서 수동 업로드 (권장)**

1. Storage > **assets** bucket 진입
2. **Create folder** 버튼 → 폴더명: `spine`
3. **spine** 폴더 진입
4. **Upload files** 클릭 → 다음 3개 파일 선택:
   ```
   assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.json
   assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.atlas.txt
   assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.png
   ```

5. 업로드 후 **각 파일 Rename:**

   | 기존 이름 | 변경할 이름 |
   |---------|-----------|
   | Casual Character.json | casual-character.json |
   | Casual Character.atlas.txt | casual-character.atlas |
   | Casual Character.png | casual-character.png |

   파일을 클릭 → 우측 메뉴 → **Rename**

**선택 옵션 2: 스크립트로 자동 업로드**

> ⚠️ 이 방법은 Service Role Key가 필요합니다. (보안상 권장하지 않음)

만약 진행하고 싶다면:

1. Supabase Dashboard > **Settings** > **API**
2. **Service Role Key** 복사
3. `.env.local` 파일에 추가:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. 다음 명령 실행:
   ```bash
   npm run upload:spine-assets
   ```

**결과 확인:**
- Storage > assets > spine 폴더에 3개 파일 확인
  ```
  casual-character.json
  casual-character.atlas
  casual-character.png
  ```

---

### Step 4: Storage RLS 정책 설정 (2분)

1. Supabase Dashboard > **SQL Editor**
2. **New query** 클릭
3. 다음 SQL 복사 후 붙여넣기:

```sql
-- 인증된 사용자가 assets bucket의 파일을 읽을 수 있도록 설정
CREATE POLICY "Authenticated users can read assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets');
```

4. **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. 하단에 **Success** 메시지 확인

**정책 확인:**
```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
  AND policyname = 'Authenticated users can read assets';
```

---

### Step 5: 검증 (5분)

이 단계는 Next.js 앱에서 진행합니다.

**1. 앱 실행:**
```bash
npm run dev
```

**2. 로그인 후 테스트 페이지 접속:**
- http://localhost:3000/test-storage

**3. 페이지에서 "검증 재실행" 버튼 클릭**

**결과 확인 사항:**
- ✅ 인증됨: 사용자 이메일 표시
- ✅ "assets" bucket 확인됨
- ✅ 3개 파일 목록 표시
- ✅ Signed URL 생성 성공
- ✅ JSON 파일 파싱 성공 (skeleton 정보 표시)

---

## 🔍 문제 해결

### Q: Bucket 생성 후 파일 업로드 실패
**A:**
- Bucket의 "Allowed MIME types" 확인
- 파일명에 공백이 있으면 제거 후 재업로드

### Q: RLS 정책 설정 후 "permission denied" 에러
**A:**
- 정책이 제대로 생성되었는지 확인 SQL 실행
- 브라우저 캐시 삭제 후 재시도

### Q: Signed URL 생성 실패
**A:**
- 파일명 확인 (정확히: `casual-character.json` 등)
- URL 만료 시간 설정 확인 (테스트 페이지는 1시간으로 설정)

---

## 📁 생성된 파일

- `scripts/upload-spine-assets.ts` - 자동 업로드 스크립트
- `scripts/setup-rls-policy.sql` - RLS 정책 SQL
- `src/app/test-storage/page.tsx` - 검증 테스트 페이지

---

## 다음 단계 (Phase 2)

Phase 1 완료 후:

1. **SpineCharacterScene.ts** - Phaser Scene 구현
2. **CharacterCanvas.tsx** - React 래퍼 컴포넌트
3. **useSpineAssets.ts** - Signed URL 로더 Hook
4. **캐릭터 표시** - CharacterStatus.tsx 수정 (Image → CharacterCanvas)

---

## 📞 주의사항

⚠️ **Service Role Key 보안:**
- `.env.local` 파일은 **절대 Git에 커밋하지 마세요**
- `.gitignore`에 이미 포함되어 있습니다 (확인: `git status`)

⚠️ **Supabase RLS:**
- "Authenticated users" 정책만 설정하면 로그인한 사용자만 접근 가능
- 공개 접근이 필요하면 추가 정책 설정 필요

---

## 체크리스트

```
[ ] Step 2: "assets" bucket 생성 (Public ❌)
[ ] Step 3: casual-character.* 3개 파일 업로드
[ ] Step 4: RLS 정책 SQL 실행
[ ] Step 5: /test-storage 페이지에서 검증 완료 확인
[ ] 모든 체크 완료 → Phase 2 시작 가능
```
