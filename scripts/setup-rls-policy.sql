-- Step 4: Supabase Storage RLS 정책 설정
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요.

-- RLS 활성화 (이미 활성화되어 있을 가능성 높음)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 assets bucket의 파일을 읽을 수 있음
CREATE POLICY "Authenticated users can read assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'assets');

-- 정책 2: 관리자만 assets bucket에 파일을 업로드할 수 있음 (선택사항)
-- 프로필에서 role = 'admin'으로 설정된 사용자만 가능
-- CREATE POLICY "Admins can upload assets"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'assets' AND (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin');

-- 정책 3: 인증되지 않은 사용자도 assets를 읽을 수 있음 (선택사항)
-- CREATE POLICY "Public read access to assets"
-- ON storage.objects FOR SELECT
-- TO anon
-- USING (bucket_id = 'assets');

-- RLS 정책 확인 SQL (실행 후 결과 확인)
-- SELECT * FROM pg_policies
-- WHERE tablename = 'objects'
-- ORDER BY policyname;
