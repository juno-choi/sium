import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Sword, CheckCircle2, Trophy, Sparkles, ArrowRight, Shield, Zap, Coins, Palette } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-40">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-indigo-500/10 border border-indigo-500/20 px-6 py-2 mb-10 animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-400 mr-2" />
              <span className="text-sm font-black text-indigo-300 font-display uppercase tracking-widest">The Legendary Task RPG</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-10 animate-slide-up font-display">
              나의 일상이<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-amber-400">
                위대한 모험으로
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Sium에서 매일의 퀘스트를 완료하고 캐릭터를 육성하세요.<br className="hidden md:block" />
              골드를 벌어 전설적인 장비를 맞추고 당신만의 영웅을 완성할 시간입니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center px-10 py-5 bg-indigo-600 text-white text-xl font-black rounded-[2rem] hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95"
                >
                  <Sword className="mr-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                  모험 계속하기
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group relative inline-flex items-center px-10 py-5 bg-indigo-600 text-white text-xl font-black rounded-[2rem] hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 w-full sm:w-auto justify-center"
                  >
                    영웅으로 거듭나기
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center px-10 py-5 bg-slate-800 text-slate-300 text-xl font-black rounded-[2rem] border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all hover:-translate-y-1 w-full sm:w-auto justify-center"
                  >
                    가이드 보기
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fantasy Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-0 w-[40%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

          {/* Floating weapon icons as decor */}
          <div className="hidden lg:block absolute top-1/4 left-20 opacity-20 animate-[float_6s_ease-in-out_infinite]">
            <Shield className="w-20 h-20 text-indigo-400 rotate-12" />
          </div>
          <div className="hidden lg:block absolute bottom-1/4 right-20 opacity-20 animate-[float_5s_ease-in-out_infinite_reverse]">
            <Sword className="w-24 h-24 text-amber-400 -rotate-12" />
          </div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section id="features" className="py-32 bg-[#020617] relative border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display">당신만의 전설을 써 내려가세요</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Sium은 단순한 할 일 목록이 아닙니다. 당신의 성장이 눈에 보이는<br className="hidden md:block" />
              현대인을 위한 가장 즐거운 라이프스타일 RPG입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <FeatureCard
              icon={<Palette className="w-10 h-10 text-indigo-400" />}
              title="무한한 커스터마이징"
              description="외모, 헤어, 피부색을 자유롭게 변경하여 당신을 닮은 영웅을 만드세요."
              highlight="bg-indigo-500/10"
              borderColor="border-indigo-500/20"
            />
            <FeatureCard
              icon={<Coins className="w-10 h-10 text-amber-400" />}
              title="전설적인 장비 시스템"
              description="퀘스트 완료로 번 골드를 사용하여 상점에서 6종류의 장비를 구입할 수 있습니다."
              highlight="bg-amber-500/10"
              borderColor="border-amber-500/20"
            />
            <FeatureCard
              icon={<Trophy className="w-10 h-10 text-emerald-400" />}
              title="실시간 성장 체감"
              description="레벨업과 장비 착용을 통해 어제보다 더 강해진 모습을 실시간으로 확인하세요."
              highlight="bg-emerald-500/10"
              borderColor="border-emerald-500/20"
            />
          </div>
        </div>
      </section>

      {/* Visual Preview Section */}
      <section className="py-32 bg-[#0f172a]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-10 font-display leading-tight">
                작은 습관이 모여<br />
                강력한 힘이 됩니다
              </h2>
              <div className="space-y-8">
                <GameStep
                  number="01"
                  title="일일 퀘스트 수락"
                  description="당신이 지키고 싶은 습관을 퀘스트로 등록하세요. 매일 아침 새로운 모험이 기다립니다."
                />
                <GameStep
                  number="02"
                  title="골드와 경험치 획득"
                  description="퀘스트 완료 버튼을 누르는 순간, 즉시 보상이 지급됩니다. 놓친 퀘스트는 취소 기능으로 유연하게."
                />
                <GameStep
                  number="03"
                  title="영웅의 탄생"
                  description="모은 골드로 더 멋진 장비를 구입하세요. 레벨이 오를수록 당신의 가치는 더 빛납니다."
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative z-10 aspect-[4/5] bg-slate-800 rounded-[3.5rem] p-10 shadow-2xl border border-white/5 flex flex-col justify-between overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="flex justify-between items-center relative z-10">
                  <span className="text-indigo-400 font-black text-2xl font-display">LEVEL 25</span>
                  <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-500 font-black">12,450 G</span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="text-[12rem] animate-[float_4s_ease-in-out_infinite]">🧙</div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-xs font-black text-slate-400 tracking-[0.2em] mb-1">
                    <span>EXPERIENCE</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className="w-[85%] h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] -z-0" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/20 rounded-full blur-[60px] -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-white/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <span className="text-2xl font-black text-white font-display">Sium</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto leading-loose mb-10">
            당신의 성장을 응원합니다. Sium은 더 나은 내일을 만드는<br />
            가장 강력한 파트너가 될 것입니다.
          </p>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2025 Sium Studio. Quest for a better you.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, highlight, borderColor }: { icon: React.ReactNode, title: string, description: string, highlight: string, borderColor: string }) {
  return (
    <div className={`bg-slate-900/50 p-10 rounded-[2.5rem] border ${borderColor} hover:bg-slate-800/80 hover:-translate-y-2 transition-all duration-300 group`}>
      <div className={`w-20 h-20 ${highlight} rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 font-display">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function GameStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0">
        <span className="text-5xl font-black text-slate-800 group-hover:text-indigo-900 transition-colors font-display">{number}</span>
      </div>
      <div>
        <h4 className="text-xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
