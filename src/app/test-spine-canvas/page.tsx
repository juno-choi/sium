'use client';

import { useEffect, useState } from 'react';
import CharacterCanvas from '@/components/character/CharacterCanvas';

export default function TestSpineCanvasPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Spine 캐릭터 테스트</h1>
          <p className="text-slate-600">CharacterCanvas 컴포넌트가 올바르게 작동하는지 확인하세요</p>
        </div>

        {/* Test 1: 기본 설정 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Test 1: 기본 설정 (idle 애니메이션)</h2>
          <div className="flex justify-center">
            <div className="border-4 border-slate-300 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50">
              <CharacterCanvas
                characterId="casual-character"
                animationName="Idle"
                loop={true}
                width={400}
                height={500}
                className="w-[400px] h-[500px]"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">확인 사항:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
              <li>Phaser 캔버스가 표시되는가?</li>
              <li>Spine 캐릭터가 렌더링되는가?</li>
              <li>idle 애니메이션이 루프되는가?</li>
              <li>에러 또는 로딩 UI가 표시되지 않는가?</li>
            </ul>
          </div>
        </div>

        {/* Test 2: 크기 변화 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Test 2: 다양한 크기</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { size: 200, label: 'Small (200x250)' },
              { size: 300, label: 'Medium (300x375)' },
              { size: 400, label: 'Large (400x500)' },
            ].map((item) => (
              <div key={item.size} className="text-center">
                <p className="font-semibold text-slate-900 mb-4">{item.label}</p>
                <div className="flex justify-center border-4 border-slate-300 rounded-lg overflow-hidden bg-slate-50 inline-block">
                  <CharacterCanvas
                    characterId="casual-character"
                    animationName="Idle"
                    loop={true}
                    width={item.size}
                    height={item.size * 1.25}
                    className={`w-[${item.size}px] h-[${item.size * 1.25}px]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test 3: 콘솔 확인 */}
        <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">💡 브라우저 콘솔 확인</h2>
          <p className="text-blue-700 mb-4">
            브라우저 개발자 도구 (F12)의 콘솔 탭에서 다음을 확인하세요:
          </p>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> Signed URL 발급 성공 메시지
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> Phaser Game 인스턴스 생성 확인
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> 네트워크 탭에서 spine-phaser 파일 로드 확인
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">⚠️</span> 에러 메시지 (있다면 기록)
            </li>
          </ul>
        </div>

        {/* Test 4: 반응형 테스트 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Test 4: 반응형 (CharacterStatus처럼)</h2>
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[2.5rem] p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* 캐릭터 */}
              <div className="relative group">
                <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[3rem] flex items-center justify-center shadow-inner animate-[float_4s_ease-in-out_infinite] overflow-hidden">
                  <CharacterCanvas
                    characterId="casual-character"
                    animationName="Idle"
                    loop={true}
                    width={160}
                    height={200}
                  />
                </div>
              </div>

              {/* 정보 */}
              <div className="flex-1">
                <h3 className="text-3xl font-black text-slate-900 mb-2">테스트 캐릭터</h3>
                <p className="text-slate-600 mb-6">화면 크기에 따라 반응형으로 동작하는지 확인하세요</p>
                <p className="text-sm text-slate-500">
                  Desktop: w-40/h-40 → w-52/h-52 (md:)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
