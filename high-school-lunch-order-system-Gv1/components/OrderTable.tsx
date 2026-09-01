'use client';

import React from 'react';
import { Order } from '@/types';
import { formatSeatNumber } from '@/lib/utils/date';

interface OrderTableProps {
  orders: Order[];
  onSelectDeleteOrder: (order: Order) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onSelectDeleteOrder }) => {
  // 按照座號由小到大數值排序
  const sortedOrders = [...orders].sort((a, b) => a.seat_number - b.seat_number);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-5 border border-gray-100 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-between">
        📋 今日訂餐總表
        <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
          共 {orders.length} 筆
        </span>
      </h3>

      {sortedOrders.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">
          目前尚無同學訂餐
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                <th className="py-3 px-2">座號</th>
                <th className="py-3 px-2 text-center">餐點</th>
                <th className="py-3 px-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {sortedOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-2 font-bold text-gray-800">
                    {formatSeatNumber(ord.seat_number)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-block w-8 h-8 line-height-8 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-base leading-8 text-center">
                      {ord.meal_option}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onSelectDeleteOrder(ord)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};