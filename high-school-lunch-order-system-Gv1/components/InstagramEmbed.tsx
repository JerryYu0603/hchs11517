'use client';

import React, { useState } from 'react';

interface InstagramEmbedProps {
  igUsername: string;
}

export const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ igUsername }) => {
  const [hasError, setHasError] = useState(false);

  if (!igUsername) {
    return null;
  }

  const embedUrl = `https://www.instagram.com/${igUsername}/embed`;

  return (
    <div className="w-full mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
          📸 當日菜單 (合作社 Instagram)
        </span>
        <a
          href={`https://instagram.com/${igUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 font-medium hover:underline"
        >
          @{igUsername}
        </a>
      </div>

      {!hasError ? (
        <div className="relative w-full overflow-hidden rounded-lg bg-gray-50 border border-gray-200 aspect-[4/5] max-h-[420px]">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            scrolling="no"
            allowTransparency={true}
            onError={() => setHasError(true)}
            title="Instagram Daily Menu Post"
          />
        </div>
      ) : (
        <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-600 mb-2">無法直接載入 Instagram 最新貼文</p>
          <a
            href={`https://instagram.com/${igUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            點此開啟 IG 查看最新菜單 (@{igUsername})
          </a>
        </div>
      )}
    </div>
  );
};