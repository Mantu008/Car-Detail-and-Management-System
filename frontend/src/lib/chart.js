import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';

// Register once for the whole app.
ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

ChartJS.defaults.font.family = 'Inter, ui-sans-serif, system-ui, sans-serif';
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#64748b';
ChartJS.defaults.borderColor = '#f1f5f9';
ChartJS.defaults.plugins.tooltip.backgroundColor = '#0f172a';
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
ChartJS.defaults.plugins.tooltip.boxPadding = 4;
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
ChartJS.defaults.plugins.legend.labels.padding = 16;

/** Ordered categorical palette (distinguishable, calm). */
export const PALETTE = ['#2563eb', '#0d9488', '#f59e0b', '#e11d48', '#7c3aed', '#64748b', '#16a34a', '#db2777'];

export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const axis = { grid: { display: false }, border: { display: false } };

export const barOptions = ({ currency = false, horizontal = false } = {}) => ({
  ...baseOptions,
  indexAxis: horizontal ? 'y' : 'x',
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: currency ? { label: (ctx) => ` ${formatCurrency(ctx.parsed[horizontal ? 'x' : 'y'])}` } : {} },
  },
  scales: {
    [horizontal ? 'y' : 'x']: axis,
    [horizontal ? 'x' : 'y']: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: '#f1f5f9' },
      ticks: { precision: 0, callback: currency ? (v) => formatCurrencyCompact(v) : undefined },
    },
  },
});

export const doughnutOptions = {
  ...baseOptions,
  cutout: '68%',
  plugins: { legend: { display: true, position: 'bottom' } },
};
