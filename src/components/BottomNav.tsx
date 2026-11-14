'use client';

import React from 'react';
import { Dumbbell, Sliders, CheckSquare, Activity } from 'lucide-react';

export type MobileTab = 'workout' | 'checkin' | 'fuel' | 'recovery';

interface BottomNavProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  pendingSetsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingSetsCount = 0,
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ElementType }[] = [
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'checkin', label: 'Check-In', icon: Sliders },
    { id: 'fuel', label: 'Fuel & Rules', icon: CheckSquare },
    { id: 'recovery', label: 'Recovery', icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/[0.08] bg-[#09090B]/98 backdrop-blur-none px-2 sm:px-6 select-none">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all touch-manipulation active:scale-95 ${
                isActive ? 'text-[#A3E635]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.id === 'workout' && pendingSetsCount > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#A3E635] text-[9px] font-bold text-zinc-950">
                    {pendingSetsCount > 9 ? '9+' : pendingSetsCount}
                  </span>
                )}
              </div>
              <span className={`mt-1 text-[11px] tracking-tight ${isActive ? 'font-semibold text-white' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-[#A3E635]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

