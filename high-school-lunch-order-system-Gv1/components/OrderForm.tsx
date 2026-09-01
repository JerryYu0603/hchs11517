'use client';

import React, { useState } from 'react';
import { DailyMenu, MealOption, Order } from '@/types';

interface OrderFormProps {
  dailyMenu: DailyMenu;
  existingOrders: Order[];
  onSubmitOrder: (seatNumber: number, mealOption: MealOption, isUpdate: boolean) => Promise<void>;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  dailyMenu,
  existingOrders,
  onSubmitOrder,
}) => {
  const [seatInput, setSeatInput] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealOption | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingOrder, setExistingOrder] = useState<Order | null>(null);

  // 取得可用的餐點選項 (A/B/C/D)
  const availableOptions: MealOption[] = [];
  if (dailyMenu.option_a_enabled) availableOptions.push('A');
  if (dailyMenu.option_b_enabled) availableOptions.push('B');
  if (dailyMenu.option_c_enabled) availableOptions.push('C');
  if (dailyMenu.option_d_enabled) availableOptions.push('D');

  // 處理座號輸入驗證
  const handleSeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 嚴格限制只能輸入半形阿拉伯數字
    if (value !== '' && !/^\d+$/.test(value)) {
      setErrorMessage('座號只能輸入半形阿拉伯數字');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSeatInput(value);

    if (value) {
      const num = parseInt(value, 10);
      const found = existingOrders.find((o) => o.seat_number === num);
      if (found) {
        setExistingOrder(found);
        setSelectedMeal(found.meal_option);
      } else {
        setExistingOrder(null);
        setSelectedMeal(null);
      }
    } else {
      setExistingOrder(null);
      setSelectedMeal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!seatInput) {
      setErrorMessage('請輸入座號');
      return;
    }

    const seatNum = parseInt(seatInput, 10);

    if (isNaN(seatNum) || seatNum <= 0 || seatNum > 60) {
      setErrorMessage('請輸入有效的班級座號 (1 - 60)');
      return;
    }

    if (!selectedMeal) {
      setErrorMessage('請選擇餐點選項');
      return;
    }

    // 檢查該餐點今天是否仍然開放
    if (!availableOptions.includes(selectedMeal)) {
      setErrorMessage(`餐點 ${selectedMeal} 今日未開放`);
      return;
    }

    setIsSubmitting(true);
    try {
      const isUpdate = !!existingOrder;
      await onSubmitOrder(seatNum, selectedMeal, isUpdate);
      
      setSuccessMessage(isUpdate ? `✅ ${seatNum} 號已成功修改餐點為 ${selectedMeal}` : `✅ ${seatNum} 號訂餐成功！`);
      setSeatInput('');
      setSelectedMeal(null);
      setExistingOrder(null);
    } catch (err: any) {
      setErrorMessage(err.message || '系統發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-5 border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        ✏️ 填寫/修改訂餐
      </h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-200">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm font-bold rounded-lg border border-green-200">
          {successMessage}
        </div>
      )}

      {existingOrder && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm font-medium rounded-lg border border-blue-200">
          ℹ️ {existingOrder.seat_number} 號已有訂餐紀錄（目前選擇：<span className="font-bold text-blue-900">{existingOrder.meal_option}</span>）。再次送出將會直接修改餐點。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 座號輸入 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            座號
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={seatInput}
            onChange={handleSeatChange}
            placeholder="請輸入座號 (例如：5)"
            className="w-full h-14 text-lg font-semibold text-center border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
          />
        </div>

        {/* 餐點選項：單純顯示 A, B, C, D */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            餐點選擇
          </label>
          {availableOptions.length === 0 ? (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">今日暫未開放任何餐點選項。</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableOptions.map((opt) => {
                const isSelected = selectedMeal === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedMeal(opt)}
                    className={`h-16 rounded-xl font-bold text-2xl flex items-center justify-center border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                        : 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 送出 / 修改按鈕 */}
        <button
          type="submit"
          disabled={isSubmitting || availableOptions.length === 0}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
        >
          {isSubmitting ? '處理中...' : existingOrder ? '修改餐點' : '送出訂餐'}
        </button>
      </form>
    </div>
  );
};