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
    date: '',
    option_a_enabled: true,
    option_b_enabled: true,
    option_c_enabled: true,
    option_d_enabled: false,
  });
  const [igUsername, setIgUsername] = useState<string>('coop_store_official');
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 初始化與資料載入
  useEffect(() => {
    const today = getTaiwanTodayString();
    setTodayStr(today);

    async function initData() {
      setLoading(true);
      try {
        // 1. 取得 IG 帳號設定
        const { data: settingData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'ig_username')
          .single();
        if (settingData) setIgUsername(settingData.value);

        // 2. 取得今日菜單設定
        const { data: menuData } = await supabase
          .from('daily_menu')
          .select('*')
          .eq('date', today)
          .single();

        if (menuData) {
          setDailyMenu(menuData);
        } else {
          // 若今日菜單尚無記錄，設定預設值
          setDailyMenu({
            date: today,
            option_a_enabled: true,
            option_b_enabled: true,
            option_c_enabled: true,
            option_d_enabled: false,
          });
        }

        // 3. 取得今日所有訂單
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('date', today);

        if (ordersData) setOrders(ordersData as Order[]);
      } catch (err) {
        console.error('初始化失敗:', err);
      } finally {
        setLoading(false);
      }
    }

    initData();

    // 4. 設定 Supabase Realtime 即時資料庫廣播監聽
    const ordersSubscription = supabase
      .channel('orders-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            if (newOrder.date === today) {
              setOrders((prev) => [...prev.filter((o) => o.id !== newOrder.id), newOrder]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            if (updatedOrder.date === today) {
              setOrders((prev) =>
                prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setOrders((prev) => prev.filter((o) => o.id !== deletedId));
          }
        }
      )
      .subscribe();

    const menuSubscription = supabase
      .channel('menu-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_menu', filter: `date=eq.${today}` },
        (payload) => {
          if (payload.new) {
            setDailyMenu(payload.new as DailyMenu);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(menuSubscription);
    };
  }, []);

  // 計算即時統計
  const stats: OrderStats = useMemo(() => {
    let countA = 0, countB = 0, countC = 0, countD = 0;
    orders.forEach((o) => {
      if (o.meal_option === 'A') countA++;
      if (o.meal_option === 'B') countB++;
      if (o.meal_option === 'C') countC++;
      if (o.meal_option === 'D') countD++;
    });
    const totalCount = orders.length;
    return {
      countA,
      countB,
      countC,
      countD,
      totalCount,
      totalAmount: totalCount * 85,
    };
  }, [orders]);

  // 送出或修改訂單
  const handleOrderSubmit = async (
    seatNumber: number,
    mealOption: MealOption,
    isUpdate: boolean
  ) => {
    const today = getTaiwanTodayString();

    if (isUpdate) {
      const existing = orders.find((o) => o.seat_number === seatNumber && o.date === today);
      if (!existing) throw new Error('找不到欲修改的原訂單');

      const { error } = await supabase
        .from('orders')
        .update({
          meal_option: mealOption,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('orders').insert({
        date: today,
        seat_number: seatNumber,
        meal_option: mealOption,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error(`${seatNumber} 號今天已經有訂餐紀錄，請刷新頁面再試`);
        }
        throw new Error(error.message);
      }
    }
  };

  // 確定刪除訂單
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', deletingOrder.id);

      if (error) throw new Error(error.message);
      setDeletingOrder(null);
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-semibold animate-pulse">系統載入中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 max-w-md mx-auto">
      {/* 1. 網站標題 */}
      <header className="text-center mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          🍱 班級午餐訂餐系統
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {todayStr} (Asia/Taipei)
        </p>
      </header>

      {/* 2. 訂餐說明與 85 元價格標示 */}
      <NoticeHeader />

      {/* 3. Instagram 最新貼文菜單 */}
      <InstagramEmbed igUsername={igUsername} />

      {/* 4. 座號與 A/B/C/D 選項輸入區 */}
      <OrderForm
        dailyMenu={dailyMenu}
        existingOrders={orders}
        onSubmitOrder={handleOrderSubmit}
      />

      {/* 5. 今日訂餐總表 */}
      <OrderTable
        orders={orders}
        onSelectDeleteOrder={(order) => setDeletingOrder(order)}
      />

      {/* 6. 人數與總金額統計 */}
      <OrderStatsView stats={stats} dailyMenu={dailyMenu} />

      {/* 刪除確認 Modal */}
      <DeleteConfirmModal
        order={deletingOrder}
        currentStats={stats}
        onCancel={() => setDeletingOrder(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}