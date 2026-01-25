import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 환경 변수 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 환경 변수가 설정되지 않음:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Supabase Admin Client 생성
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface SpineAsset {
  localPath: string;
  fileName: string;
  mimeType: string;
}

const spineAssets: SpineAsset[] = [
  {
    localPath: 'assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.json',
    fileName: 'casual-character.json',
    mimeType: 'application/json'
  },
  {
    localPath: 'assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.atlas.txt',
    fileName: 'casual-character.atlas',
    mimeType: 'text/plain'
  },
  {
    localPath: 'assets/Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation/Casual Character.png',
    fileName: 'casual-character.png',
    mimeType: 'image/png'
  }
];

async function uploadSpineAssets() {
  try {
    console.log('🚀 Spine 에셋 업로드 시작...\n');

    // 1. Bucket 확인/생성
    console.log('📦 Bucket 확인...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Bucket 목록 조회 실패:', listError.message);
      process.exit(1);
    }

    const assetsBucket = buckets?.find(b => b.name === 'assets');
    if (!assetsBucket) {
      console.log('   "assets" bucket 없음. 생성 중...');
      const { error: createError } = await supabase.storage.createBucket('assets', {
        public: false,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'application/json', 'text/plain'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Bucket 생성 실패:', createError.message);
        process.exit(1);
      }
      console.log('✅ "assets" bucket 생성 완료');
    } else {
      console.log('✅ "assets" bucket 확인됨');
    }

    // 2. spine 폴더 생성 (파일 업로드 시 자동 생성됨)
    console.log('\n📁 Spine 폴더 생성...');

    // 3. 파일 업로드
    console.log('\n📤 파일 업로드 중...');
    for (const asset of spineAssets) {
      const filePath = path.resolve(asset.localPath);

      if (!fs.existsSync(filePath)) {
        console.error(`❌ 파일을 찾을 수 없음: ${asset.localPath}`);
        process.exit(1);
      }

      const fileContent = fs.readFileSync(filePath);
      const remotePath = `spine/${asset.fileName}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(remotePath, fileContent, {
          contentType: asset.mimeType,
          upsert: true // 기존 파일 덮어쓰기
        });

      if (error) {
        console.error(`❌ 업로드 실패: ${asset.fileName}`, error.message);
        process.exit(1);
      }

      console.log(`✅ ${asset.fileName} (${remotePath})`);
    }

    console.log('\n✨ 모든 파일 업로드 완료!');
    console.log('\n📋 업로드된 파일:');
    spineAssets.forEach(asset => {
      console.log(`   - spine/${asset.fileName}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

uploadSpineAssets();
