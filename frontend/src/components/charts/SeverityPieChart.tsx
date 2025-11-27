/**
 * Severity Pie Chart
 * Displays vulnerability severity distribution as a pie/donut chart
 */

import { Box, Typography, Paper, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

interface SeverityData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface SeverityPieChartProps {
  data?: SeverityData[];
  title?: string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

// Default mock data for demonstration
const defaultData: SeverityData[] = [
  { name: 'Critical', value: 5, color: '#b71c1c' },
  { name: 'High', value: 12, color: '#ff5252' },
  { name: 'Medium', value: 25, color: '#ff9800' },
  { name: 'Low', value: 18, color: '#ffeb3b' },
  { name: 'Info', value: 8, color: '#00bcd4' },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  } = props;

  // Type guards for safety
  if (
    typeof cx !== 'number' ||
    typeof cy !== 'number' ||
    typeof midAngle !== 'number' ||
    typeof innerRadius !== 'number' ||
    typeof outerRadius !== 'number' ||
    typeof percent !== 'number'
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for very small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontWeight: 600, fontSize: 12 }}
    >
      {value}
    </text>
  );
};

const SeverityPieChart = ({
  data = defaultData,
  title = 'Vulnerability Severity Distribution',
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
}: SeverityPieChartProps) => {
  const theme = useTheme();

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Paper sx={{ p: 2, height: height + 60 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        🎯 {title}
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
              animationBegin={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span style={{ color: theme.palette.text.primary }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text for donut chart */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -70%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SeverityPieChart;
