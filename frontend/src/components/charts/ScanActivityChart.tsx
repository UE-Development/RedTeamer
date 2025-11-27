/**
 * Scan Activity Chart
 * Displays scan activity over time as a bar/area chart
 */

import { Typography, Paper, useTheme } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ScanData {
  name: string;
  scans: number;
  completed: number;
  vulnerabilities: number;
}

interface ScanActivityChartProps {
  data?: ScanData[];
  title?: string;
  height?: number;
}

// Default mock data for demonstration
const defaultData: ScanData[] = [
  { name: 'Week 1', scans: 15, completed: 12, vulnerabilities: 45 },
  { name: 'Week 2', scans: 22, completed: 20, vulnerabilities: 67 },
  { name: 'Week 3', scans: 18, completed: 17, vulnerabilities: 52 },
  { name: 'Week 4', scans: 28, completed: 25, vulnerabilities: 89 },
  { name: 'Week 5', scans: 35, completed: 33, vulnerabilities: 124 },
  { name: 'Week 6', scans: 30, completed: 28, vulnerabilities: 98 },
];

const ScanActivityChart = ({
  data = defaultData,
  title = 'Scan Activity Overview',
  height = 300,
}: ScanActivityChartProps) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, height: height + 60 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        📊 {title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b71c1c" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#b71c1c" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff41" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00ff41" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorVulns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: theme.palette.text.primary }}
          />
          <Area
            type="monotone"
            dataKey="scans"
            name="Total Scans"
            stroke="#b71c1c"
            fillOpacity={1}
            fill="url(#colorScans)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#00ff41"
            fillOpacity={1}
            fill="url(#colorCompleted)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="vulnerabilities"
            name="Vulnerabilities Found"
            stroke="#ff9800"
            fillOpacity={1}
            fill="url(#colorVulns)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ScanActivityChart;
