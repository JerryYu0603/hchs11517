'use client';

import React from 'react';
import { Order, OrderStats } from '@/types';
import { formatSeatNumber } from '@/lib/utils/date';

interface DeleteConfirmModalProps {
  order: Order | null;
  currentStats: OrderStats;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  order,
  currentStats,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  if (!order) return null;

  const { meal_option } = order;

  // 計算刪除後的預期統計
  const nextStats: OrderStats = {
    countA: meal_option === 'A' ? Math.max(0, currentStats.countA - 1) : currentStats.countA,
    countB: meal_option === 'B' ? Math.max(0, currentStats.countB - 1) : currentStats.countB,
    countC: meal_option === 'C' ? Math.max(0, currentStats.countC - 1) : currentStats.countC,
    countD: meal_option === 'D' ? Math.max(0, currentStats.countD - 1) : currentStats.countD,
    totalCount: Math.max(0, currentStats.totalCount - 1),
    totalAmount: Math.max(0, (currentStats.totalCount - 1) * 85),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ❓ 確認刪除 {formatSeatNumber(order.seat_number)} 號之餐點選擇？
        </h3>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 my-4 text-xs space-y-3">
          <div>
            <p className="font-bold text-gray-700 mb-1">目前統計：</p>
            <div className="text-gray-600 grid grid-cols-2 gap-1">
              <span>A：{currentStats.countA} 人</span>
              <span>B：{currentStats.countB} 人</span>
              <span>C：{currentStats.countC} 人</span>
              <span>D：{currentStats.countD} 人</span>
            </div>
            <p className="font-semibold text-gray-800 mt-1">
              總共：{currentStats.totalCount} 人 / 總金額：{currentStats.totalAmount} 元
            </p>
          </div>

          <hr className="border-gray-200" />

          <div>
            <p className="font-bold text-red-600 mb-1">刪除後預期：</p>
            <div className="text-gray-600 grid grid-cols-2 gap-1">
              <span className={meal_option === 'A' ? 'font-bold text-red-600' : ''}>
                A：{nextStats.countA} 人
              </span>
              <span className={meal_option === 'B' ? 'font-bold text-red-600' : ''}>
                B：{nextStats.countB} 人
              </span>
              <span className={meal_option === 'C' ? 'font-bold text-red-600' : ''}>
                C：{nextStats.countC} 人
              </span>
              <span className={meal_option === 'D' ? 'font-bold text-red-600' : ''}>
                D：{nextStats.countD} 人
              </span>
            </div>
            <p className="font-semibold text-red-600 mt-1">
              總共：{nextStats.totalCount} 人 / 總金額：{nextStats.totalAmount} 元
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition disabled:bg-gray-400"
          >
            {isDeleting ? '刪除中...' : '確認刪除'}
          </button>
        </div>
      </div>
    </div>
  );
};