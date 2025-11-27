/**
 * Resource Usage Gauge
 * Displays system resource usage as a radial gauge
 * Now supports live data from the backend with visual indicator
 */

import { Box, Typography, Paper, Chip } from '@mui/material';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

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
  /** Whether the data is from a live source */
  isLive?: boolean;
  /** Last update timestamp for live data */
  lastUpdated?: Date;
}

const ResourceUsageGauge = ({
  cpu = 0,
  memory = 0,
  disk = 0,
  title = 'System Resources',
  height = 250,
  isLive = false,
  lastUpdated,
}: ResourceUsageGaugeProps) => {
  const getColor = (value: number) => {
    if (value >= 90) return '#b71c1c'; // Critical
    if (value >= 70) return '#ff9800'; // Warning
    return '#00ff41'; // Good
  };

  // Round values to 1 decimal place for display
  const roundedCpu = Math.round(cpu * 10) / 10;
  const roundedMemory = Math.round(memory * 10) / 10;
  const roundedDisk = Math.round(disk * 10) / 10;

  // Data for the radial chart (inner to outer order)
  const chartData: ResourceData[] = [
    { name: 'Disk', value: roundedDisk, fill: getColor(roundedDisk) },
    { name: 'Memory', value: roundedMemory, fill: getColor(roundedMemory) },
    { name: 'CPU', value: roundedCpu, fill: getColor(roundedCpu) },
  ];

  // Data for the legend (display order: CPU, Memory, Disk)
  const legendData: ResourceData[] = [
    { name: 'CPU', value: roundedCpu, fill: getColor(roundedCpu) },
    { name: 'Memory', value: roundedMemory, fill: getColor(roundedMemory) },
    { name: 'Disk', value: roundedDisk, fill: getColor(roundedDisk) },
  ];

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <Paper sx={{ p: 2, height: height + 60 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          💻 {title}
        </Typography>
        {isLive && (
          <Chip
            size="small"
            icon={
              <FiberManualRecordIcon 
                sx={{ 
                  fontSize: 10, 
                  color: '#00ff41 !important',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }} 
              />
            }
            label={lastUpdated ? `Live • ${getLastUpdatedText()}` : 'Live'}
            sx={{
              bgcolor: 'rgba(0, 255, 65, 0.1)',
              color: '#00ff41',
              border: '1px solid rgba(0, 255, 65, 0.3)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              height: 24,
            }}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height={height - 20}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="30%"
              outerRadius="90%"
              barSize={20}
              data={chartData}
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
          {legendData.map((item, index) => (
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
                  boxShadow: isLive ? `0 0 8px ${item.fill}40` : 'none',
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
                {item.value.toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default ResourceUsageGauge;
