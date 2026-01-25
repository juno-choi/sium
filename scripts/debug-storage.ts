import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('환경 변수 부족');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugStorage() {
    console.log('--- Storage Debug ---');

    // 1. 버킷 확인
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    console.log('Buckets:', buckets?.map(b => b.name) || [], bError?.message || '');

    // 2. 파일 목록 확인
    const { data: files, error: fError } = await supabase.storage.from('assets').list('spine');
    console.log('Files in spine/ folder:', files?.map(f => f.name) || [], fError?.message || '');

    // 3. Signed URL 테스트 (어드민 권한으로)
    const { data: url, error: uError } = await supabase.storage.from('assets').createSignedUrl('spine/casual-character.json', 60);
    console.log('Signed URL (Admin):', url?.signedUrl ? 'SUCCESS' : 'FAILED', uError?.message || '');
}

debugStorage();
