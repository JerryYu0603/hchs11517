'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getTaiwanTodayString } from '@/lib/utils/date';
import { DailyMenu, MealOption, Order, OrderStats } from '@/types';
import { NoticeHeader } from '@/components/NoticeHeader';
import { InstagramEmbed } from '@/components/InstagramEmbed';
import { OrderForm } from '@/components/OrderForm';
import { OrderTable } from '@/components/OrderTable';
import { OrderStatsView } from '@/components/OrderStats';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export default function HomePage() {
  const [todayStr, setTodayStr] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyMenu, setDailyMenu] = useState<DailyMenu>({
    date: '', option_a_enabled: true, option_b_enabled: true, option_c_enabled: true, option_d_enabled: false,
  });
  const [igUsername, setIgUsername] = useState<string>('coop_store_official');
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const today = getTaiwanTodayString();
    setTodayStr(today);

    async function initData() {
      setLoading(true);
      try {
        const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'ig_username').single();
        if (settingData) setIgUsername(settingData.value);

        const { data: menuData } = await supabase.from('daily_menu').select('*').eq('date', today).single();
        if (menuData) setDailyMenu(menuData);
        else setDailyMenu({ date: today, option_a_enabled: true, option_b_enabled: true, option_c_enabled: true, option_d_enabled: false });

        const { data: ordersData } = await supabase.from('orders').select('*').eq('date', today);
        if (ordersData) setOrders(ordersData as Order[]);
      } catch (err) {
        console.error('初始化失敗:', err);
      } finally {
        setLoading(false);
      }
    }

    initData();

    const ordersSubscription = supabase.channel('orders-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newOrder = payload.new as Order;
          if (newOrder.date === today) setOrders((prev) => [...prev.filter((o) => o.id !== newOrder.id), newOrder]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedOrder = payload.new as Order;
          if (updatedOrder.date === today) setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      }).subscribe();

    const menuSubscription = supabase.channel('menu-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_menu', filter: `date=eq.${today}` }, (payload) => {
        if (payload.new) setDailyMenu(payload.new as DailyMenu);
      }).subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(menuSubscription);
    };
  }, []);

  const stats: OrderStats = useMemo(() => {
    let countA = 0, countB = 0, countC = 0, countD = 0;
    orders.forEach((o) => {
      if (o.meal_option === 'A') countA++;
      if (o.meal_option === 'B') countB++;
      if (o.meal_option === 'C') countC++;
      if (o.meal_option === 'D') countD++;
    });
    const totalCount = orders.length;
    return { countA, countB, countC, countD, totalCount, totalAmount: totalCount * 85 };
  }, [orders]);

  const handleOrderSubmit = async (seatNumber: number, mealOption: MealOption, isUpdate: boolean) => {
    const today = getTaiwanTodayString();
    if (isUpdate) {
      const existing = orders.find((o) => o.seat_number === seatNumber && o.date === today);
      if (!existing) throw new Error('找不到欲修改的原訂單');
      const { error } = await supabase.from('orders').update({ meal_option: mealOption, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('orders').insert({ date: today, seat_number: seatNumber, meal_option: mealOption });
      if (error) {
        if (error.code === '23505') throw new Error(`${seatNumber} 號今天已經有訂餐紀錄，請刷新頁面再試`);
        throw new Error(error.message);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('orders').delete().eq('id', deletingOrder.id);
      if (error) throw new Error(error.message);
      setDeletingOrder(null);
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-500 font-semibold animate-pulse">系統載入中...</div></div>;

  return (
    <main className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 max-w-md mx-auto">
      <header className="text-center mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">🍱 班級午餐訂餐系統</h1>
        <p className="text-xs text-gray-500 mt-1">{todayStr} (Asia/Taipei)</p>
      </header>
      <NoticeHeader />
      <InstagramEmbed igUsername={igUsername} />
      <OrderForm dailyMenu={dailyMenu} existingOrders={orders} onSubmitOrder={handleOrderSubmit} />
      <OrderTable orders={orders} onSelectDeleteOrder={(order) => setDeletingOrder(order)} />
      <OrderStatsView stats={stats} dailyMenu={dailyMenu} />
      <DeleteConfirmModal order={deletingOrder} currentStats={stats} onCancel={() => setDeletingOrder(null)} onConfirm={handleConfirmDelete} isDeleting={isDeleting} />
    </main>
  );
}