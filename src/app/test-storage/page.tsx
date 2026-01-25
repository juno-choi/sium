'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestStoragePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const basePath = 'Layer Lab/2D Art Maker/AMCasual Character/Demo/SpineAnimation';
  const testAssets = [
    { name: 'Casual Character.json', path: `${basePath}/Casual Character.json` },
    { name: 'Casual Character.atlas.txt', path: `${basePath}/Casual Character.atlas.txt` },
    { name: 'Casual Character.png', path: `${basePath}/Casual Character.png` }
  ];

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const checkStorageStatus = async () => {
    try {
      setStatus('loading');
      setError('');

      const supabase = createClient();

      // 1. 인증 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('❌ 로그인이 필요합니다.');
        setStatus('error');
        return;
      }

      console.log('✅ 인증됨:', user.email);

      // 2. Bucket 목록 확인
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        setError(`❌ Bucket 목록 조회 실패: ${listError.message}`);
        setStatus('error');
        return;
      }

      const assetsBucket = buckets?.find(b => b.name === 'assets');
      if (!assetsBucket) {
        setError('❌ "assets" bucket을 찾을 수 없습니다. Step 2를 완료하세요.');
        setStatus('error');
        return;
      }

      console.log('✅ "assets" bucket 확인됨');

      // 3. Spine 폴더의 파일 목록 확인
      const { data: files, error: filesError } = await supabase.storage
        .from('assets')
        .list(basePath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (filesError) {
        setError(`❌ 파일 목록 조회 실패: ${filesError.message}`);
        setStatus('error');
        return;
      }

      if (!files || files.length === 0) {
        setError('❌ 해당 경로에 파일이 없습니다. 파일을 업로드해 주세요.');
        setStatus('error');
        return;
      }

      console.log('✅ Spine 파일 확인됨:', files.map(f => f.name));

      // 4. Signed URL 생성
      const urls: Record<string, string> = {};
      for (const asset of testAssets) {
        const { data, error: signError } = await supabase.storage
          .from('assets')
          .createSignedUrl(asset.path, 3600); // 1시간 유효

        if (signError) {
          console.warn(`⚠️ ${asset.name} Signed URL 생성 실패:`, signError.message);
        } else if (data) {
          urls[asset.name] = data.signedUrl;
          console.log(`✅ ${asset.name} Signed URL 생성됨`);
        }
      }

      setSignedUrls(urls);

      // 5. JSON 파일 내용 확인
      if (urls['Casual Character.json']) {
        const response = await fetch(urls['Casual Character.json']);
        const jsonData = await response.json();
        setResult({
          message: '✅ 모든 검증 완료!',
          bucketName: 'assets',
          fileCount: files.length,
          files: files.map(f => ({ name: f.name, id: f.id, created_at: f.created_at })),
          jsonSample: {
            skeleton: jsonData.skeleton,
            bones: jsonData.bones ? `${jsonData.bones.length}개` : 'N/A',
            slots: jsonData.slots ? `${jsonData.slots.length}개` : 'N/A'
          }
        });
      }

      setStatus('success');
    } catch (err) {
      console.error('오류:', err);
      setError(`❌ 예상치 못한 오류: ${String(err)}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🧪 Spine 에셋 스토리지 검증</h1>

        {/* 상태 표시 */}
        <div className="mb-8">
          {status === 'loading' && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 text-blue-300">
              ⏳ 검증 중...
            </div>
          )}
          {status === 'success' && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-green-300">
              ✅ 검증 완료!
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <button
          onClick={checkStorageStatus}
          disabled={status === 'loading'}
          className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
        >
          {status === 'loading' ? '검증 중...' : '검증 재실행'}
        </button>

        {/* 결과 표시 */}
        {result && (
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h2 className="text-xl font-bold text-white mb-4">{result.message}</h2>
              <div className="space-y-3 text-slate-300">
                <p>📦 Bucket 이름: <span className="text-green-400">{result.bucketName}</span></p>
                <p>📁 파일 개수: <span className="text-green-400">{result.fileCount}개</span></p>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-4">📋 업로드된 파일</h3>
              <div className="space-y-2">
                {result.files.map((file: any) => (
                  <div key={file.id} className="flex justify-between items-center p-2 bg-slate-600/30 rounded">
                    <span className="text-slate-300">{file.name}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(file.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-4">🎮 JSON 파일 정보</h3>
              <pre className="bg-slate-900 p-4 rounded text-slate-300 text-sm overflow-auto">
                {JSON.stringify(result.jsonSample, null, 2)}
              </pre>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-bold text-white mb-4">🔗 Signed URLs</h3>
              <div className="space-y-2">
                {Object.entries(signedUrls).map(([name, url]) => (
                  <div key={name} className="p-2 bg-slate-600/30 rounded">
                    <p className="text-slate-300 font-semibold mb-1">{name}</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all"
                    >
                      {url.substring(0, 80)}...
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 준비 단계 안내 */}
        {status === 'idle' && (
          <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-6 text-amber-100">
            <h3 className="font-bold mb-3">📝 진행 단계</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>Step 2:</strong> Supabase Dashboard에서 "assets" bucket 생성
                <br />
                <span className="text-xs text-amber-300 ml-4">Settings: Public ❌, MIME types: image/png,image/jpeg,application/json,text/plain</span>
              </li>
              <li>
                <strong>Step 3:</strong> 다음 명령으로 파일 업로드
                <br />
                <code className="text-xs bg-slate-700 px-2 py-1 rounded ml-4">npm run upload:spine-assets</code>
                <br />
                <span className="text-xs text-amber-300 ml-4">(먼저 .env.local에 SUPABASE_SERVICE_ROLE_KEY 추가 필요)</span>
              </li>
              <li>
                <strong>Step 4:</strong> Supabase Dashboard SQL Editor에서 setup-rls-policy.sql 실행
              </li>
              <li>
                <strong>Step 5:</strong> "검증 재실행" 버튼 클릭
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
