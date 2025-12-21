import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Upload, Share2, PlusCircle, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50 pt-20 pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-brand-100 px-4 py-1.5 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 mr-2"></span>
              <span className="text-sm font-semibold text-brand-700">누구나 무료로 시작하세요</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8 animate-fade-in">
              나만의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">전단지</span>를<br />
              <span className="relative inline-block">
                1분 만에
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
              완성하세요
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              복잡한 디자인 툴 없이도, 이미지만 업로드하면 전문가 수준의 웹 전단지가 자동으로 만들어집니다.
              링크 하나로 전 세계와 공유해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link
                  href="/flyers"
                  className="inline-flex items-center px-8 py-4 bg-brand-600 text-white text-lg font-bold rounded-xl hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200/50 hover:-translate-y-1 transform duration-200"
                >
                  <Layout className="mr-2 w-5 h-5" />
                  내 전단지 관리
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-4 bg-brand-600 text-white text-lg font-bold rounded-xl hover:bg-brand-700 transition shadow-lg hover:shadow-brand-200/50 hover:-translate-y-1 transform duration-200 w-full sm:w-auto justify-center"
                  >
                    <PlusCircle className="mr-2 w-5 h-5" />
                    지금 시작하기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link
                    href="/flyers" // In reality, this might redirect to login because of auth protection on /flyers, but keeping as 'Explore' link or verify logic
                    className="inline-flex items-center px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm hover:-translate-y-1 transform duration-200 w-full sm:w-auto justify-center"
                  >
                    둘러보기
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 Sium인가요?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              가장 쉽고 빠른 전단지 제작 경험을 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Upload className="w-8 h-8 text-white" />}
              title="간편한 이미지 업로드"
              description="드래그 앤 드롭으로 이미지를 올리기만 하세요. 복잡한 설정은 필요 없습니다."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="자동 레이아웃 생성"
              description="업로드한 콘텐츠에 맞춰 최적의 레이아웃이 자동으로 적용됩니다."
              color="bg-brand-500"
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-white" />}
              title="쉬운 공유"
              description="생성된 고유 링크로 카카오톡, 문자, SNS 어디든 쉽게 공유하세요."
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                3단계로 완성하는<br />
                나만의 전단지
              </h2>
              <div className="space-y-8">
                <StepItem number="01" title="로그인하기" description="구글 계정으로 3초 만에 시작하세요." />
                <StepItem number="02" title="내용 작성" description="제목, 설명과 함께 이미지를 업로드하세요." />
                <StepItem number="03" title="공유하기" description="완성된 전단지 링크를 필요한 곳에 전달하세요." />
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center justify-center p-8 relative z-10">
                <div className="space-y-4 w-full opacity-50 blur-[1px]">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-32 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-brand-600 text-white px-6 py-3 rounded-lg shadow-lg font-bold flex items-center animate-bounce">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    완성!
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-brand-100 rounded-2xl -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4 text-center ">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-xl font-bold text-gray-900">Sium</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Sium. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex">
      <div className="mr-6">
        <span className="text-4xl font-black text-brand-100">{number}</span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
