'use client';

import { useCharacter } from '@/lib/hooks/useCharacter';
import { useEquipment } from '@/lib/hooks/useEquipment';
import { useShop } from '@/lib/hooks/useShop';
import { Loader2, Shield, User, ChevronRight, Check, Users as UsersIcon, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { EquipmentSlot } from '@/types/equipment';

const ITEMS_PER_PAGE = 6;

export default function CharacterPage() {
    const { character, userCharacters, switchCharacter, loading: charLoading } = useCharacter();
    const { equippedItems, toggleEquip, loading: equipLoading } = useEquipment();
    const { userItems, refresh: refreshShop } = useShop();

    const [activeMainTab, setActiveMainTab] = useState<'companions' | 'equipment'>('companions');
    const [activeSubTab, setActiveSubTab] = useState<string>('hat');
    const [charPage, setCharPage] = useState(1);
    const [equipPage, setEquipPage] = useState(1);

    const isLoading = charLoading || equipLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!character) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">


                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left Side: Character Preview */}
                    <div className="lg:w-2/5">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-indigo-100/30 overflow-hidden relative group">
                                {/* Background Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -z-0 group-hover:w-40 group-hover:h-40 transition-all duration-700" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h1 className="text-3xl font-black text-slate-900 font-display mb-1">캐릭터 설정</h1>
                                            <p className="text-slate-500 font-medium">{character.character?.name}님을 꾸며보세요.</p>
                                        </div>
                                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                            {character.current_level}
                                        </div>
                                    </div>

                                    {/* Visual Preview Area */}
                                    <div className="aspect-[4/5] bg-gradient-to-br from-slate-50 to-indigo-50 rounded-[2.5rem] flex items-center justify-center text-[10rem] shadow-inner mb-8 relative">
                                        <span>
                                            {character.character?.base_image_url}
                                        </span>

                                        {/* Visual indicators for equipped slots */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-around p-8 opacity-20 pointer-events-none">
                                            {equippedItems.hat && <span className="text-4xl absolute top-10">{equippedItems.hat.item?.image_url}</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest">Character ID</span>
                                            <span className="text-slate-900 font-black">{character.id.slice(0, 8)}...</span>
                                        </div>
                                        <div className="w-full h-px bg-slate-100" />
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="flex gap-2">
                                                {Object.values(equippedItems).filter(item => item !== null).map((item, idx) => (
                                                    <div key={idx} title={item?.item?.name} className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                                                        {item?.item?.image_url}
                                                    </div>
                                                ))}
                                                {Object.values(equippedItems).filter(item => item !== null).length === 0 && (
                                                    <p className="text-xs text-slate-400 italic">착용한 장비가 없습니다.</p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Sections */}
                    <div className="lg:w-3/5 space-y-6">
                        {/* Main Tabs */}
                        <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex gap-2">
                            <button
                                onClick={() => setActiveMainTab('companions')}
                                className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${activeMainTab === 'companions'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <UsersIcon className="w-5 h-5" />
                                <span>내 동료</span>
                            </button>
                            <button
                                onClick={() => setActiveMainTab('equipment')}
                                className={`flex-1 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${activeMainTab === 'equipment'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <Shield className="w-5 h-5" />
                                <span>보유 장비</span>
                            </button>
                        </div>

                        {activeMainTab === 'companions' ? (
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[500px] flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 font-display">동료 목록</h2>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total {userCharacters.length}</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                                    {userCharacters.slice((charPage - 1) * ITEMS_PER_PAGE, charPage * ITEMS_PER_PAGE).map((uc) => {
                                        const isActive = uc.id === character.id;
                                        return (
                                            <button
                                                key={uc.id}
                                                onClick={() => switchCharacter(uc.id)}
                                                className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${isActive ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-5xl shadow-inner">
                                                    {uc.character?.base_image_url}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase">LV. {uc.current_level}</p>
                                                    <h4 className="text-sm font-bold text-slate-800">{uc.character?.name}</h4>
                                                </div>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Paging */}
                                {userCharacters.length > ITEMS_PER_PAGE && (
                                    <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-50">
                                        <button
                                            disabled={charPage === 1}
                                            onClick={() => setCharPage(prev => prev - 1)}
                                            className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm font-bold text-slate-600">{charPage} / {Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}</span>
                                        <button
                                            disabled={charPage === Math.ceil(userCharacters.length / ITEMS_PER_PAGE)}
                                            onClick={() => setCharPage(prev => prev + 1)}
                                            className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Sub Tabs (Categories) */}
                                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                                    {['hat', 'top', 'bottom', 'shoes', 'gloves', 'weapon'].map(slot => (
                                        <button
                                            key={slot}
                                            onClick={() => { setActiveSubTab(slot); setEquipPage(1); }}
                                            className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeSubTab === slot ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-500'
                                                }`}
                                        >
                                            {slot === 'hat' ? '모자' : slot === 'top' ? '상의' : slot === 'bottom' ? '하의' : slot === 'shoes' ? '신발' : slot === 'gloves' ? '장갑' : '무기'}
                                        </button>
                                    ))}
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[500px] flex flex-col">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                                        {userItems
                                            .filter(ui => ui.item?.slot === activeSubTab)
                                            .slice((equipPage - 1) * ITEMS_PER_PAGE, equipPage * ITEMS_PER_PAGE)
                                            .map(ui => {
                                                const isEquipped = ui.is_equipped;
                                                return (
                                                    <button
                                                        key={ui.id}
                                                        onClick={async () => {
                                                            await toggleEquip(ui.id, activeSubTab as EquipmentSlot, isEquipped);
                                                            refreshShop();
                                                        }}
                                                        className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${isEquipped ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                                                            {ui.item?.image_url}
                                                        </div>
                                                        <div className="text-center">
                                                            <h4 className="text-sm font-bold text-slate-800 mb-1">{ui.item?.name}</h4>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                {ui.item?.rarity}
                                                            </span>
                                                        </div>
                                                        {isEquipped && (
                                                            <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                                <Check className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        {userItems.filter(ui => ui.item?.slot === activeSubTab).length === 0 && (
                                            <div className="col-span-full py-12 text-center">
                                                <p className="text-slate-400 font-bold">보유한 아이템이 없습니다.</p>
                                                <p className="text-xs text-slate-400 mt-2">상점에서 새로운 장비를 구매해보세요!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Paging */}
                                    {userItems.filter(ui => ui.item?.slot === activeSubTab).length > ITEMS_PER_PAGE && (
                                        <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-50">
                                            <button
                                                disabled={equipPage === 1}
                                                onClick={() => setEquipPage(prev => prev - 1)}
                                                className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm font-bold text-slate-600">
                                                {equipPage} / {Math.ceil(userItems.filter(ui => ui.item?.slot === activeSubTab).length / ITEMS_PER_PAGE)}
                                            </span>
                                            <button
                                                disabled={equipPage === Math.ceil(userItems.filter(ui => ui.item?.slot === activeSubTab).length / ITEMS_PER_PAGE)}
                                                onClick={() => setEquipPage(prev => prev + 1)}
                                                className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 disabled:opacity-30"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
