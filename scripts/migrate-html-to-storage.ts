import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 서비스 키 필요
);

async function migrateHTMLToStorage() {
    console.log('Starting HTML migration to Storage...\n');

    // 1. html_url이 없는 전단지 조회
    const { data: flyers, error } = await supabase
        .from('flyers')
        .select('uuid, html_content, template_id')
        .is('html_url', null)
        .not('html_content', 'is', null);

    if (error || !flyers) {
        console.error('Failed to fetch flyers:', error);
        return;
    }

    console.log(`Found ${flyers.length} flyers to migrate\n`);

    let successCount = 0;
    let failCount = 0;

    for (const flyer of flyers) {
        try {
            // 2. HTML을 Storage에 업로드
            const blob = new Blob([flyer.html_content], {
                type: 'text/html; charset=utf-8',
            });

            const filePath = `html/${flyer.uuid}.html`;

            const { error: uploadError } = await supabase.storage
                .from('flyers')
                .upload(filePath, blob, {
                    contentType: 'text/html',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // 3. Public URL 생성
            const { data: { publicUrl } } = supabase.storage
                .from('flyers')
                .getPublicUrl(filePath);

            // 4. DB 업데이트
            const { error: updateError } = await supabase
                .from('flyers')
                .update({ html_url: publicUrl })
                .eq('uuid', flyer.uuid);

            if (updateError) throw updateError;

            successCount++;
            console.log(`✓ Migrated [${flyer.template_id}]: ${flyer.uuid}`);
        } catch (err) {
            failCount++;
            console.error(`✗ Failed: ${flyer.uuid}`, err);
        }
    }

    console.log(`\n=== Migration Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Total: ${flyers.length}`);
}

migrateHTMLToStorage();
