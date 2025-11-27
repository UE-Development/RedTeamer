/**
 * Resource Usage Gauge
 * Displays system resource usage as a radial gauge
 */

import { Box, Typography, Paper } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ResourceData {
  name: string;
  value: number;
  fill: string;
}

interface ResourceUsageGaugeProps {
  cpu?: number;
  memory?: number;
  disk?: number;
  title?: string;
  height?: number;
}

const ResourceUsageGauge = ({
  cpu = 45,
  memory = 67,
  disk = 32,
  title = 'System Resources',
  height = 250,
}: ResourceUsageGaugeProps) => {
  const getColor = (value: number) => {
    if (value >= 90) return '#b71c1c'; // Critical
    if (value >= 70) return '#ff9800'; // Warning
    return '#00ff41'; // Good
  };

  const data: ResourceData[] = [
    { name: 'Disk', value: disk, fill: getColor(disk) },
    { name: 'Memory', value: memory, fill: getColor(memory) },
    { name: 'CPU', value: cpu, fill: getColor(cpu) },
  ];

  return (
    <Paper sx={{ p: 2, height: height + 60 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        💻 {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={height - 20}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              barSize={20}
              data={data}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                angleAxisId={0}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ minWidth: 100 }}>
          {data.reverse().map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: item.fill,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 'auto',
                  fontWeight: 600,
                  color: item.fill,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {item.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ResourceUsageGauge;
