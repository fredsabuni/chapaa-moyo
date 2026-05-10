export const fmtTZS = (n: number | null | undefined): string => {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
};

export const fmtTZSFull = (n: number | null | undefined): string =>
  n == null || isNaN(n) ? '—' : n.toLocaleString('en-US');

export const CHART_FONT = "'Plus Jakarta Sans', -apple-system, sans-serif";

export const baseAxis = {
  grid: { color: '#F1F3F9', drawBorder: false, drawTicks: false },
  border: { display: false },
  ticks: { color: '#9AA3BD', font: { family: CHART_FONT, size: 11 }, padding: 8 },
};

export const baseTooltip = {
  backgroundColor: '#0B1330',
  titleColor: 'rgba(255,255,255,0.55)',
  titleFont: { family: CHART_FONT, size: 10 },
  bodyColor: '#fff',
  bodyFont: { family: 'Roboto Mono, monospace', size: 13 },
  padding: 12,
  cornerRadius: 8,
  displayColors: false,
  caretSize: 0,
  borderColor: 'transparent',
};
