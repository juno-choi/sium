'use client';

import { useShop } from '@/lib/hooks/useShop';
import { useCharacter } from '@/lib/hooks/useCharacter';
import { Coins, Loader2, ShoppingBag, CheckCircle2, AlertCircle, Users, Eye } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { getLevelImage } from '@/lib/utils/getLevelImage';
import { Character } from '@/types/character';
import CharacterPreviewModal from '@/components/shop/CharacterPreviewModal';

export default function ShopPage() {
    const { characters: shopCharacters, loading, buyCharacter } = useShop();
    const { userCharacters, gold } = useCharacter();
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [previewCharacter, setPreviewCharacter] = useState<Character | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const ownedCharacterIds = new Set(userCharacters.map(uc => uc.character_id));

    const handleBuyCharacter = async (charId: number, price: number) => {
        if (buyingId) return;
        setBuyingId(charId);
        try {
            await buyCharacter(charId, price);
            alert('새로운 동료를 맞이했습니다! 캐릭터 설정에서 확인해보세요.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setBuyingId(null);
        }
    };

    const getCharacterImageSrc = (char: Character) => {
        const levelImage = getLevelImage(1, char.level_images);
        if (levelImage) {
            return `${levelImage}`;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-4xl font-black text-slate-900 font-display">캐릭터 상점</h1>
                        </div>
                        <p className="text-slate-500 font-medium">퀘스트를 통해 모은 골드로 새로운 동료를 만나보세요!</p>
                    </div>

                    <div className="bg-amber-100/50 border-2 border-amber-200 px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-amber-100/20">
                        <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <Coins className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-amber-600 uppercase tracking-widest">My Balance</span>
                            <span className="text-3xl font-black text-amber-700 font-display">
                                {gold.toLocaleString()} <span className="text-xl">G</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-8">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-black text-slate-900 font-display">새로운 동료</h2>
                </div>

                {/* Character Grid */}
                {/* Character Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {shopCharacters.map((char) => {
                        const isOwned = ownedCharacterIds.has(char.id);
                        const canAfford = gold >= char.price;
                        const imageSrc = getCharacterImageSrc(char);

                        return (
                            <div
                                key={char.id}
                                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-6 md:p-10 flex flex-col group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 group-hover:bg-indigo-50 transition-colors" />

                                <div className="relative z-10">
                                    <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 group-hover:scale-105 transition-transform duration-500 shadow-inner overflow-hidden relative">
                                        {imageSrc ? (
                                            <Image
                                                src={imageSrc}
                                                alt={char.name}
                                                fill
                                                className="object-contain p-8 object-center"
                                            />
                                        ) : (
                                            <span className="text-[8rem]">{char.base_image_url}</span>
                                        )}

                                        {/* Preview Button */}
                                        <button
                                            onClick={() => setPreviewCharacter(char)}
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-2xl font-bold text-sm shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            미리보기
                                        </button>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 font-display">{char.name}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8 h-12 line-clamp-2">
                                        {char.description}
                                    </p>

                                    {isOwned ? (
                                        <div className="flex items-center justify-center gap-2 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black cursor-default text-lg">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            <span>보유 중</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyCharacter(char.id, char.price)}
                                            disabled={!canAfford || buyingId !== null}
                                            className={`w-full py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${canAfford
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                                                : 'bg-slate-100 text-slate-400 shadow-none'
                                                }`}
                                        >
                                            {buyingId === char.id ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="w-5 h-5" />
                                                    <span>{char.price.toLocaleString()} G</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {!isOwned && !canAfford && (
                                        <p className="text-sm text-rose-500 font-bold text-center mt-4 flex items-center justify-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            골드가 부족합니다
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {shopCharacters.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">상점에 캐릭터가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Character Preview Modal */}
            {previewCharacter && (
                <CharacterPreviewModal
                    character={previewCharacter}
                    onClose={() => setPreviewCharacter(null)}
                />
            )}
        </div>
    );
}
