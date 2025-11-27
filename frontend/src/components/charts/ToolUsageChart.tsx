/**
 * Tool Usage Chart
 * Displays tool usage statistics as a horizontal bar chart
 */

import { Typography, Paper, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ToolData {
  name: string;
  usage: number;
  category: string;
}

interface ToolUsageChartProps {
  data?: ToolData[];
  title?: string;
  height?: number;
}

// Default mock data for demonstration
const defaultData: ToolData[] = [
  { name: 'Nuclei', usage: 312, category: 'web' },
  { name: 'Gobuster', usage: 278, category: 'web' },
  { name: 'FFuf', usage: 256, category: 'web' },
  { name: 'Nmap', usage: 245, category: 'network' },
  { name: 'Amass', usage: 234, category: 'network' },
  { name: 'Subfinder', usage: 198, category: 'network' },
  { name: 'Rustscan', usage: 189, category: 'network' },
  { name: 'TheHarvester', usage: 187, category: 'osint' },
  { name: 'Masscan', usage: 167, category: 'network' },
  { name: 'Hashcat', usage: 156, category: 'ctf' },
];

// Category colors
const categoryColors: Record<string, string> = {
  web: '#ff5252',
  network: '#b71c1c',
  binary: '#9c27b0',
  cloud: '#00bcd4',
  ctf: '#ff9800',
  osint: '#00ff41',
};

const ToolUsageChart = ({
  data = defaultData,
  title = 'Top Tool Usage',
  height = 350,
}: ToolUsageChartProps) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, height: height + 60 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        🛠️ {title}
      </Typography>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            type="number"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
            formatter={(value: number) => [`${value} times`, 'Usage']}
            labelStyle={{ color: theme.palette.text.primary }}
          />
          <Bar dataKey="usage" name="Usage Count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColors[entry.category] || '#b71c1c'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ToolUsageChart;
