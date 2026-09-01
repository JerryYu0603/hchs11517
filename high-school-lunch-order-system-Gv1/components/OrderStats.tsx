'use client';

import React from 'react';
import { DailyMenu, OrderStats } from '@/types';

interface OrderStatsProps {
  stats: OrderStats;
  dailyMenu: DailyMenu;
}

export const OrderStatsView: React.FC<OrderStatsProps> = ({ stats, dailyMenu }) => {
  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl shadow-lg p-5 mb-8">
      <h3 className="text-md font-bold mb-3 text-slate-300">📊 當前訂餐統計</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {dailyMenu.option_a_enabled && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-medium">A 餐</span>
            <p className="text-xl font-black text-amber-400">{stats.countA} 人</p>
          </div>
        )}
        {dailyMenu.option_b_enabled && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-medium">B 餐</span>
            <p className="text-xl font-black text-emerald-400">{stats.countB} 人</p>
          </div>
        )}
        {dailyMenu.option_c_enabled && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-medium">C 餐</span>
            <p className="text-xl font-black text-sky-400">{stats.countC} 人</p>
          </div>
        )}
        {dailyMenu.option_d_enabled && (
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-medium">D 餐</span>
            <p className="text-xl font-black text-purple-400">{stats.countD} 人</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-bold">
        <span>總訂餐人數：<span className="text-indigo-400 text-base">{stats.totalCount}</span> 人</span>
        <span>總金額：<span className="text-green-400 text-lg">{stats.totalAmount}</span> 元</span>
      </div>
    </div>
  );
};