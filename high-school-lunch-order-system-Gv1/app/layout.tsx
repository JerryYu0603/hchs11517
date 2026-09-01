import './globals.css';
import React from 'react';

export const metadata = {
  title: '高中班級午餐訂餐系統',
  description: '全班即時訂餐系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}