'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController, BarController, DoughnutController,
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, Filler, Tooltip, Legend,
  type ChartType, type ChartData, type ChartOptions,
} from 'chart.js';

Chart.register(
  LineController, BarController, DoughnutController,
  LineElement, PointElement, LinearScale, CategoryScale,
  BarElement, ArcElement, Filler, Tooltip, Legend
);

interface Props {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  height?: number;
}

export default function ChartCanvas({ type, data, options, height = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvasRef.current, { type, data, options } as never);
    return () => { chartRef.current?.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
