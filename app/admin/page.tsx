'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getTaiwanTodayString } from '@/lib/utils/date';
import { DailyMenu, Order } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [todayStr] = useState(getTaiwanTodayString());
  const [igInput, setIgInput] = useState('');
  const [menu, setMenu] = useState<DailyMenu>({
    date: todayStr,
    option_a_enabled: true,
    option_b_enabled: true,
    option_c_enabled: true,
    option_d_enabled: false,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState('');

  // 簡易管理員密碼驗證 (預設為 classadmin888)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'classadmin888') {
      setIsAuthenticated(true);
    } else {
      alert('密碼錯誤！');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchAdminData() {
      // 載入 IG 帳號
      const { data: igData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ig_username')
        .single();
      if (igData) setIgInput(igData.value);

      // 載入當日菜單設定
      const { data: menuData } = await supabase
        .from('daily_menu')
        .select('*')
        .eq('date', todayStr)
        .single();
      if (menuData) setMenu(menuData);

      // 載入訂單
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('date', todayStr);
      if (ordersData) setOrders(ordersData as Order[]);
    }

    fetchAdminData();
  }, [isAuthenticated, todayStr]);

  const handleSaveMenu = async () => {
    const { error } = await supabase.from('daily_menu').upsert({
      date: todayStr,
      option_a_enabled: menu.option_a_enabled,
      option_b_enabled: menu.option_b_enabled,
      option_c_enabled: menu.option_c_enabled,
      option_d_enabled: menu.option_d_enabled,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      alert('菜單儲存失敗: ' + error.message);
    } else {
      setMsg('✅ 菜單選項更新成功！已即時同步至前台。');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleSaveIg = async () => {
    const { error } = await supabase.from('settings').upsert({
      key: 'ig_username',
      value: igInput.trim(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      alert('IG 設定失敗: ' + error.message);
    } else {
      setMsg('✅ Instagram 帳號更新成功！');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">🔐 管理員後台登入</h2>
          <input
            type="password"
            placeholder="請輸入管理員密碼"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border-2 border-gray-300 p-3 rounded-xl mb-4 font-semibold text-center"
          />
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">
            登入系統
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto space-y-6">
      <header className="flex justify-between items-center border-b pb-3">
        <h1 className="text-xl font-bold text-gray-800">⚙️ 訂餐系統管理後台</h1>
        <span className="text-xs bg-gray-200 px-2.5 py-1 rounded-full">{todayStr}</span>
      </header>

      {msg && <div className="p-3 bg-green-100 text-green-800 text-sm font-bold rounded-xl">{msg}</div>}

      {/* 開放餐點設定 */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-3">
        <h3 className="font-bold text-gray-800">1. 當天開放餐點選項</h3>
        <div className="grid grid-cols-2 gap-3">
          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
            const key = `option_${opt.toLowerCase()}_enabled` as keyof DailyMenu;
            return (
              <label key={opt} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!menu[key]}
                  onChange={(e) => setMenu({ ...menu, [key]: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="font-bold text-gray-800">開放 {opt} 餐</span>
              </label>
            );
          })}
        </div>
        <button
          onClick={handleSaveMenu}
          className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700"
        >
          儲存菜單設定
        </button>
      </section>

      {/* IG 帳號設定 */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-3">
        <h3 className="font-bold text-gray-800">2. 合作社 Instagram 帳號</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={igInput}
            onChange={(e) => setIgInput(e.target.value)}
            placeholder="例如: coop_store_official"
            className="flex-1 border p-2.5 rounded-xl text-sm"
          />
          <button
            onClick={handleSaveIg}
            className="bg-gray-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm"
          >
            更新 IG
          </button>
        </div>
      </section>

      {/* 今日訂單管理與總計 */}
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-2">3. 今日訂單快照 (共 {orders.length} 筆)</h3>
        <p className="text-sm text-gray-600 mb-3">
          總金額：<span className="font-bold text-green-600">{orders.length * 85}</span> 元
        </p>
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 text-sm">
          {orders.map((o) => (
            <div key={o.id} className="py-2 flex justify-between items-center">
              <span>{o.seat_number} 號 - <strong className="text-indigo-600">{o.meal_option} 餐</strong></span>
              <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleTimeString('zh-TW')}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}