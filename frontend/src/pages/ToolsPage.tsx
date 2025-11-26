/**
 * Tools Page - Security Tools Library
 * Browse and manage 150+ security tools
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  InputAdornment,
  Paper,
  Button,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ToolCard } from '../components/tools';
import type { Tool } from '../types';

// Mock tools data based on FEATURES.md
const MOCK_TOOLS: Tool[] = [
  // Network Reconnaissance (25+ tools)
  {
    id: '1',
    name: 'Nmap',
    category: 'network',
    version: '7.94',
    description: 'Advanced port scanning with custom NSE scripts and service detection',
    installed: true,
    parameters: [],
    usageCount: 245,
  },
  {
    id: '2',
    name: 'Rustscan',
    category: 'network',
    version: '2.1.1',
    description: 'Ultra-fast port scanner with intelligent rate limiting',
    installed: true,
    parameters: [],
    usageCount: 189,
  },
  {
    id: '3',
    name: 'Masscan',
    category: 'network',
    version: '1.3.2',
    description: 'High-speed Internet-scale port scanning with banner grabbing',
    installed: true,
    parameters: [],
    usageCount: 167,
  },
  {
    id: '4',
    name: 'Amass',
    category: 'network',
    version: '3.23.3',
    description: 'Advanced subdomain enumeration and OSINT gathering',
    installed: true,
    parameters: [],
    usageCount: 234,
  },
  {
    id: '5',
    name: 'Subfinder',
    category: 'network',
    version: '2.6.3',
    description: 'Fast passive subdomain discovery with multiple sources',
    installed: true,
    parameters: [],
    usageCount: 198,
  },

  // Web Application Security (40+ tools)
  {
    id: '6',
    name: 'Nuclei',
    category: 'web',
    version: '3.1.4',
    description: 'Fast vulnerability scanner with 4000+ templates',
    installed: true,
    parameters: [],
    usageCount: 312,
  },
  {
    id: '7',
    name: 'Gobuster',
    category: 'web',
    version: '3.6',
    description: 'Directory, file, and DNS enumeration with intelligent wordlists',
    installed: true,
    parameters: [],
    usageCount: 278,
  },
  {
    id: '8',
    name: 'FFuf',
    category: 'web',
    version: '2.1.0',
    description: 'Fast web fuzzer with advanced filtering and parameter discovery',
    installed: true,
    parameters: [],
    usageCount: 256,
  },
  {
    id: '9',
    name: 'SQLMap',
    category: 'web',
    version: '1.7.12',
    description: 'Advanced automatic SQL injection testing with tamper scripts',
    installed: true,
    parameters: [],
    usageCount: 145,
  },
  {
    id: '10',
    name: 'Nikto',
    category: 'web',
    version: '2.5.0',
    description: 'Web server vulnerability scanner with comprehensive checks',
    installed: true,
    parameters: [],
    usageCount: 134,
  },

  // Binary Analysis & Reverse Engineering
  {
    id: '11',
    name: 'Ghidra',
    category: 'binary',
    version: '10.4',
    description: "NSA's software reverse engineering suite with headless analysis",
    installed: true,
    parameters: [],
    usageCount: 89,
  },
  {
    id: '12',
    name: 'Radare2',
    category: 'binary',
    version: '5.8.8',
    description: 'Advanced reverse engineering framework with comprehensive analysis',
    installed: true,
    parameters: [],
    usageCount: 76,
  },
  {
    id: '13',
    name: 'GDB',
    category: 'binary',
    version: '13.2',
    description: 'GNU Debugger with Python scripting and exploit development support',
    installed: true,
    parameters: [],
    usageCount: 112,
  },

  // Cloud Security Tools
  {
    id: '14',
    name: 'Prowler',
    category: 'cloud',
    version: '3.12.1',
    description: 'AWS/Azure/GCP security assessment with compliance checks',
    installed: true,
    parameters: [],
    usageCount: 67,
  },
  {
    id: '15',
    name: 'Trivy',
    category: 'cloud',
    version: '0.48.3',
    description: 'Comprehensive vulnerability scanner for containers and IaC',
    installed: true,
    parameters: [],
    usageCount: 98,
  },
  {
    id: '16',
    name: 'Kube-Hunter',
    category: 'cloud',
    version: '0.6.8',
    description: 'Kubernetes penetration testing with active/passive modes',
    installed: true,
    parameters: [],
    usageCount: 54,
  },

  // CTF & Forensics Tools
  {
    id: '17',
    name: 'Volatility3',
    category: 'ctf',
    version: '2.5.0',
    description: 'Next-generation memory forensics with enhanced analysis',
    installed: true,
    parameters: [],
    usageCount: 43,
  },
  {
    id: '18',
    name: 'John the Ripper',
    category: 'ctf',
    version: '1.9.0',
    description: 'Password cracker with custom rules and advanced modes',
    installed: true,
    parameters: [],
    usageCount: 128,
  },
  {
    id: '19',
    name: 'Hashcat',
    category: 'ctf',
    version: '6.2.6',
    description: 'GPU-accelerated password recovery with 300+ hash types',
    installed: true,
    parameters: [],
    usageCount: 156,
  },

  // OSINT Tools
  {
    id: '20',
    name: 'TheHarvester',
    category: 'osint',
    version: '4.5.1',
    description: 'Email and subdomain harvesting from multiple sources',
    installed: true,
    parameters: [],
    usageCount: 187,
  },
  {
    id: '21',
    name: 'Sherlock',
    category: 'osint',
    version: '0.14.3',
    description: 'Username investigation across 400+ social networks',
    installed: true,
    parameters: [],
    usageCount: 92,
  },
  {
    id: '22',
    name: 'SpiderFoot',
    category: 'osint',
    version: '4.0',
    description: 'OSINT automation with 200+ modules',
    installed: false,
    parameters: [],
    usageCount: 34,
  },
];


const ToolsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '6', '11']));

  const filteredTools = useMemo(() => {
    return MOCK_TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesInstalled = !showInstalledOnly || tool.installed;

      return matchesSearch && matchesCategory && matchesInstalled;
    });
  }, [searchQuery, selectedCategory, showInstalledOnly]);

  const handleLaunchTool = (tool: Tool) => {
    console.log('Launching tool:', tool.name);
    // TODO: Implement tool launch
  };

  const handleToggleFavorite = (tool: Tool) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tool.id)) {
        newFavorites.delete(tool.id);
      } else {
        newFavorites.add(tool.id);
      }
      return newFavorites;
    });
  };

  const toolStats = {
    total: MOCK_TOOLS.length,
    installed: MOCK_TOOLS.filter((t) => t.installed).length,
    network: MOCK_TOOLS.filter((t) => t.category === 'network').length,
    web: MOCK_TOOLS.filter((t) => t.category === 'web').length,
    binary: MOCK_TOOLS.filter((t) => t.category === 'binary').length,
    cloud: MOCK_TOOLS.filter((t) => t.category === 'cloud').length,
    ctf: MOCK_TOOLS.filter((t) => t.category === 'ctf').length,
    osint: MOCK_TOOLS.filter((t) => t.category === 'osint').length,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Security Tools Library ({toolStats.total}+)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${toolStats.installed} Installed`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${toolStats.total - toolStats.installed} Not Installed`}
            color="warning"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories ({toolStats.total})</MenuItem>
                <MenuItem value="network">🔍 Network ({toolStats.network})</MenuItem>
                <MenuItem value="web">🌐 Web ({toolStats.web})</MenuItem>
                <MenuItem value="binary">💻 Binary ({toolStats.binary})</MenuItem>
                <MenuItem value="cloud">☁️ Cloud ({toolStats.cloud})</MenuItem>
                <MenuItem value="ctf">🏆 CTF ({toolStats.ctf})</MenuItem>
                <MenuItem value="osint">🔥 OSINT ({toolStats.osint})</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              variant={showInstalledOnly ? 'contained' : 'outlined'}
              startIcon={<FilterListIcon />}
              onClick={() => setShowInstalledOnly(!showInstalledOnly)}
            >
              {showInstalledOnly ? 'Installed Only' : 'All Tools'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {filteredTools.map((tool) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={tool.id}>
            <ToolCard
              tool={tool}
              onLaunch={handleLaunchTool}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(tool.id)}
            />
          </Grid>
        ))}
      </Grid>

      {filteredTools.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tools found matching your criteria
          </Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setShowInstalledOnly(false);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ToolsPage;
