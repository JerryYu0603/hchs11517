export function getTaiwanTodayString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

export function formatSeatNumber(seat: number): string {
  return seat.toString().padStart(2, '0');
}