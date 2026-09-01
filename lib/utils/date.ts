/**
 * 取得台灣時間 (Asia/Taipei) 當前日期字串 (格式：YYYY-MM-DD)
 * 確保跨午夜 00:00 時能準確自動切換日期，不受使用者瀏覽器時區影響
 */
export function getTaiwanTodayString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // 回傳 "YYYY-MM-DD"
}

/**
 * 格式化座號，小於 10 前面自動補零 (例如: 5 -> "05")
 */
export function formatSeatNumber(seat: number): string {
  return seat.toString().padStart(2, '0');
}