import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Gamepad2, CheckCircle2, Trophy, Sparkles, ArrowRight, Target, Zap } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
              <span className="text-sm font-semibold text-indigo-700 font-display">습관 형성의 새로운 즐거움</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8 animate-fade-in font-display">
              귀여운 캐릭터와 함께<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                성장하는 습관
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              매일의 작은 할 일을 완료하고 캐릭터를 키워보세요.
              지루한 체크리스트가 즐거운 모험으로 변합니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1 transform duration-200"
                >
                  <Gamepad2 className="mr-2 w-5 h-5" />
                  퀘스트 시작하기
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1 transform duration-200 w-full sm:w-auto justify-center"
                  >
                    무료로 시작하기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm hover:-translate-y-1 transform duration-200 w-full sm:w-auto justify-center"
                  >
                    더 알아보기
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-violet-200/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display">왜 Sium 인가요?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              습관 형성이 어려운 이유는 즐거움이 없기 때문입니다.
              Sium은 당신의 성취를 시각화하고 보상합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-white" />}
              title="귀여운 캐릭터 진화"
              description="경험치를 쌓아 캐릭터를 성장시키세요. 레벨이 오를수록 외형이 변화합니다."
              color="bg-amber-400"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-white" />}
              title="맞춤형 습관 설정"
              description="난이도와 요일을 설정하여 나만의 퀘스트를 만드세요."
              color="bg-indigo-500"
            />
            <FeatureCard
              icon={<Trophy className="w-8 h-8 text-white" />}
              title="확실한 보상 체계"
              description="할 일을 완료할 때마다 얻는 XP로 성취감을 즉각적으로 느껴보세요."
              color="bg-rose-500"
            />
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-display">
                작은 실천이<br />
                커다란 성장이 됩니다.
              </h2>
              <div className="space-y-6">
                <StepItem
                  icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  title="일일 퀘스트 완료"
                  description="오늘 할 일을 'Clear' 하고 경험치를 획득하세요."
                />
                <StepItem
                  icon={<Zap className="w-6 h-6 text-amber-500" />}
                  title="능력치 상승"
                  description="캐릭터의 레벨이 올라가며 새로운 모습을 발견하세요."
                />
                <StepItem
                  icon={<Gamepad2 className="w-6 h-6 text-indigo-500" />}
                  title="즐거운 습관 형성"
                  description="더 이상 의무가 아닌 즐거움으로 습관을 지속하세요."
                />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-12 relative z-10 overflow-hidden">
                <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center mb-8 relative">
                  <span className="text-8-xl">🐱</span>
                  <div className="absolute -bottom-2 w-3/4 h-4 bg-slate-200 blur-md rounded-full -z-10"></div>
                </div>
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-bold text-slate-700">Lv. 5 푸딩이</span>
                    <span className="text-xs font-medium text-slate-500">450 / 500 XP</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="w-[90%] h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                  </div>
                </div>
                {/* Floating XP decoration */}
                <div className="absolute top-1/4 right-1/4 animate-bounce delay-100 italic font-black text-indigo-600">+20 XP ✨</div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-indigo-100 rounded-3xl -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-xl font-bold text-slate-900 font-display">Sium</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Sium. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm md:text-base">{description}</p>
    </div>
  );
}

function StepItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start">
      <div className="mr-4 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

