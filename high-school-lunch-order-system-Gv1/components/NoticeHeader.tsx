import React from 'react';

export const NoticeHeader: React.FC = () => {
  return (
    <div className="w-full bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg shadow-sm">
      <h2 className="text-amber-800 font-bold text-base mb-1 flex items-center">
        📢 每日訂餐須知
      </h2>
      <p className="text-amber-900 text-sm leading-relaxed font-medium">
        請同學在每日<span className="font-bold underline">第一節與第二節課中間的下課</span>填寫完畢，將在第二節課後的下課送出。
      </p>
      <p className="text-amber-800 text-sm font-bold mt-2">
        💰 每份餐點均為 <span className="text-red-600 text-base">85</span> 元。
      </p>
    </div>
  );
};