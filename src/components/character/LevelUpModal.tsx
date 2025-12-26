'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles, X } from 'lucide-react';

interface LevelUpModalProps {
    level: number;
    onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`bg-white rounded-[3rem] p-10 max-w-sm w-full relative z-10 shadow-2xl text-center transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-50 translate-y-20'}`}>
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center animate-[float_2s_ease-in-out_infinite]">
                            <Trophy className="w-12 h-12 text-amber-500" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                        </div>
                    </div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 font-display mb-2">Level Up!</h2>
                <p className="text-slate-500 font-medium mb-8">
                    축하합니다! 당신의 캐릭터가 성장했어요.<br />
                    이제 <span className="text-indigo-600 font-bold">Lv.{level}</span>이 되었습니다!
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                >
                    계속하기
                </button>

                {/* Decorative elements */}
                <div className="absolute top-1/2 left-4 text-amber-400 animate-bounce delay-100">
                    <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="absolute bottom-1/4 right-6 text-indigo-400 animate-bounce delay-300">
                    <Star className="w-4 h-4 fill-current" />
                </div>
            </div>
        </div>
    );
}
