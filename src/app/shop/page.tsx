'use client';

import { useShop } from '@/lib/hooks/useShop';
import { useCharacter } from '@/lib/hooks/useCharacter';
import { Coins, Loader2, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { EquipmentSlot } from '@/types/equipment';

const slotLabels: Record<string, string> = {
    hat: '모자',
    top: '상의',
    bottom: '하의',
    shoes: '신발',
    gloves: '장갑',
    face_accessory: '얼굴장식',
};

export default function ShopPage() {
    const { items, characters: shopCharacters, userItems, loading, buyItem, buyCharacter } = useShop();
    const { character, userCharacters, gold } = useCharacter();
    const [activeCategory, setActiveCategory] = useState<'equipment' | 'character'>('equipment');
    const [activeTab, setActiveTab] = useState<EquipmentSlot | 'all'>('all');
    const [buyingId, setBuyingId] = useState<number | null>(null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const ownedItemIds = new Set(userItems.map(ui => ui.item_id));
    const ownedCharacterIds = new Set(userCharacters.map(uc => uc.character_id));

    const filteredItems = activeTab === 'all'
        ? items
        : items.filter(item => item.slot === activeTab);

    const handleBuyItem = async (itemId: number, price: number) => {
        if (buyingId) return;
        setBuyingId(itemId);
        try {
            await buyItem(itemId, price);
            alert('아이템을 구매했습니다! 캐릭터 꾸미기에서 착용해보세요.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setBuyingId(null);
        }
    };

    const handleBuyCharacter = async (charId: number, price: number) => {
        if (buyingId) return;
        setBuyingId(charId);
        try {
            await buyCharacter(charId, price);
            alert('새로운 동료를 맞이했습니다! 대시보드에서 캐릭터를 전환할 수 있습니다.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-4xl font-black text-slate-900 font-display">상점</h1>
                        </div>
                        <p className="text-slate-500 font-medium">퀘스트를 통해 모은 골드로 새로운 아이템과 동료를 만나보세요!</p>
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

                {/* Main Category Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveCategory('equipment')}
                        className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${activeCategory === 'equipment'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                    >
                        장비 아이템
                    </button>
                    <button
                        onClick={() => setActiveCategory('character')}
                        className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2 ${activeCategory === 'character'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                    >
                        새로운 캐릭터
                    </button>
                </div>

                {activeCategory === 'equipment' ? (
                    <>
                        {/* Equipment Categories */}
                        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 no-scrollbar">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeTab === 'all'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                전체
                            </button>
                            {Object.entries(slotLabels).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key as EquipmentSlot)}
                                    className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeTab === key
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Item Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredItems.map((item) => {
                                const isOwned = ownedItemIds.has(item.id);
                                const canAfford = gold >= item.price;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col group overflow-hidden relative"
                                    >
                                        {/* Rarity Tag */}
                                        <div className={`absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.rarity === 'rare' ? 'bg-indigo-50 text-indigo-600' :
                                            item.rarity === 'epic' ? 'bg-purple-50 text-purple-600' :
                                                item.rarity === 'legendary' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-50 text-slate-400'
                                            }`}>
                                            {item.rarity}
                                        </div>

                                        <div className="w-full aspect-square bg-slate-50 rounded-3xl flex items-center justify-center text-6xl mb-6 group-hover:scale-110 transition-transform duration-500">
                                            {item.image_url}
                                        </div>

                                        <div className="flex-1">
                                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mb-1">
                                                {slotLabels[item.slot]}
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{item.name}</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto">
                                            {isOwned ? (
                                                <div className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold cursor-default">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    <span>보유 중</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleBuyItem(item.id, item.price)}
                                                    disabled={!canAfford || buyingId !== null}
                                                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${canAfford
                                                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                        : 'bg-slate-100 text-slate-400'
                                                        }`}
                                                >
                                                    {buyingId === item.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Coins className="w-4 h-4" />
                                                            <span>{item.price.toLocaleString()} G</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {!isOwned && !canAfford && (
                                                <p className="text-[10px] text-rose-500 font-bold text-center mt-2 flex items-center justify-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    골드가 부족합니다
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* Character Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shopCharacters.map((char) => {
                            const isOwned = ownedCharacterIds.has(char.id);
                            const canAfford = gold >= char.price;

                            return (
                                <div
                                    key={char.id}
                                    className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-10 flex flex-col group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 group-hover:bg-indigo-50 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-[10rem] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                            {char.base_image_url}
                                        </div>

                                        <h3 className="text-3xl font-black text-slate-900 mb-2 font-display">{char.name}</h3>
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
                )}

                {((activeCategory === 'equipment' && filteredItems.length === 0) || (activeCategory === 'character' && shopCharacters.length === 0)) && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">목록이 비어있습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
