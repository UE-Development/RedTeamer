# HexStrike AI Frontend - Setup Guide

## 🎉 Phase 1 Complete!

The frontend foundation has been successfully implemented based on FEATURES.md specifications.

## 📸 Screenshot

![HexStrike AI Frontend Dashboard](https://github.com/user-attachments/assets/26930a74-463d-4731-a1ca-2cd486aebf15)

## ✅ Implemented Features (Phase 1)

### 1. Project Setup
- ✅ React 18 + TypeScript 5 with Vite
- ✅ Material-UI v5 component library
- ✅ Redux Toolkit for state management
- ✅ React Router v6 for routing
- ✅ Axios for HTTP requests
- ✅ Socket.IO Client for WebSocket communication
- ✅ ESLint + Prettier for code quality

### 2. Design System
- ✅ Cybersecurity hacker theme (reddish color scheme)
- ✅ Custom Material-UI theme configuration
- ✅ Color palette: Critical Red (#b71c1c), Alert Red (#ff5252), Success Green (#00ff41)
- ✅ Typography: JetBrains Mono for code/data, Roboto for UI
- ✅ Dark background with accent colors

### 3. Layout Components
- ✅ **TopBar**: Navigation with branding, notifications, and user menu
- ✅ **Sidebar**: Collapsible navigation with icons and active state
- ✅ **MainLayout**: Responsive layout with proper spacing

### 4. State Management
- ✅ Redux store configuration
- ✅ Dashboard slice (metrics, activity)
- ✅ Agents slice (agent management, messages)
- ✅ Scans slice (scan tracking)
- ✅ Tools slice (tool library)
- ✅ Vulnerabilities slice (vulnerability tracking)
- ✅ Notifications slice (system notifications)

### 5. Services
- ✅ **API Client**: Full REST API integration with backend
  - Agent management endpoints
  - Tool execution endpoints
  - Scan management endpoints
  - Vulnerability tracking endpoints
  - Report generation endpoints
  - Project management endpoints
  - CVE intelligence endpoints
- ✅ **WebSocket Service**: Real-time event handling
  - Connection management with auto-reconnect
  - Agent events (messages, status changes)
  - Scan events (progress, completion)
  - Tool events (execution, output)
  - Vulnerability events (discovery, updates)
  - System events (notifications, alerts)

### 6. TypeScript Types
- ✅ Complete type definitions based on FEATURES.md
- ✅ Agent types (status, capabilities)
- ✅ Tool types (categories, parameters)
- ✅ Scan types (phases, results)
- ✅ Vulnerability types (severity, CVSS)
- ✅ Project types (targets, members)
- ✅ Report types (formats, sections)

### 7. Pages
- ✅ Dashboard page with metrics and activity
- ✅ AI Agents page with chat interface, multi-agent support, and collaboration view
- ✅ Tools page with security tools library (150+ tools)
- ✅ Scans page with real-time monitoring
- ✅ Vulnerabilities page with filtering and detailed cards
- ✅ Reports page with report generator
- ✅ Projects page with project management
- ✅ Settings page with MCP server, API, theme, and notification settings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- HexStrike AI backend running on port 8888

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── MainLayout.tsx    # Main app layout
│   │       ├── TopBar.tsx        # Top navigation bar
│   │       └── Sidebar.tsx       # Side navigation menu
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard with metrics
│   │   ├── AgentsPage.tsx        # AI Agents management
│   │   ├── ToolsPage.tsx         # Security tools library
│   │   ├── ScansPage.tsx         # Scan management
│   │   ├── VulnerabilitiesPage.tsx
│   │   ├── ReportsPage.tsx       # Report generation
│   │   ├── ProjectsPage.tsx      # Project management
│   │   └── SettingsPage.tsx      # Application settings
│   │
│   ├── store/
│   │   ├── index.ts              # Redux store configuration
│   │   └── slices/               # Redux state slices
│   │       ├── dashboardSlice.ts
│   │       ├── agentsSlice.ts
│   │       ├── scansSlice.ts
│   │       ├── toolsSlice.ts
│   │       ├── vulnerabilitiesSlice.ts
│   │       └── notificationsSlice.ts
│   │
│   ├── services/
│   │   ├── api.ts                # REST API client
│   │   └── websocket.ts          # WebSocket service
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   │
│   ├── theme/
│   │   └── theme.ts              # Material-UI theme config
│   │
│   ├── App.tsx                   # Main application component
│   └── main.tsx                  # Application entry point
│
├── public/
│   └── hexstrike-logo.png        # HexStrike logo
│
├── .env                          # Environment variables
├── .prettierrc                   # Prettier configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

## 🔧 Configuration

### Environment Variables (.env)

```env
VITE_API_URL=http://localhost:8888
VITE_WS_URL=ws://localhost:8888
```

### Vite Configuration

The Vite config includes:
- API proxy to backend (port 8888)
- Development server on port 3000
- Fast HMR (Hot Module Replacement)

## 🎨 Theme Configuration

The cybersecurity hacker theme features:

**Primary Colors (Reddish Theme):**
- Critical Red: `#b71c1c`
- Alert Red: `#ff5252`
- Light Red: `#ff8a80`
- Dark Background: `#2d0000`
- Deep Black: `#0a0a0a`

**Secondary Colors:**
- Success Green: `#00ff41` (hacker green)
- Warning Orange: `#ff9800`
- Info Blue: `#00bcd4`
- Purple Accent: `#9c27b0`

**Typography:**
- Primary Font: 'JetBrains Mono', 'Fira Code' (monospace)
- Display Font: 'Roboto', 'Inter' (sans-serif)

## 📡 API Integration

The frontend integrates with the HexStrike AI backend via:

### REST API Endpoints
- `/health` - Health check
- `/api/agents/*` - Agent management
- `/api/tools/*` - Tool execution
- `/api/scans/*` - Scan management
- `/api/vulnerabilities/*` - Vulnerability tracking
- `/api/reports/*` - Report generation
- `/api/projects/*` - Project management
- `/api/intelligence/*` - CVE intelligence

### WebSocket Events
- `agent:*` - Agent events
- `scan:*` - Scan progress events
- `tool:*` - Tool execution events
- `vulnerability:*` - Vulnerability discovery
- `system:*` - System notifications

## 🎯 Next Steps (Phase 2)

The next phase will implement the Agent Interface:

### Agent Interface Components ✅
- [x] Agent chat interface with message threading
- [x] Agent selector panel with status indicators
- [x] Smart command builder for security testing
- [x] Real-time agent communication
- [x] Command auto-completion
- [x] Conversation history with search
- [x] Agent performance metrics
- [x] Multi-agent chat support

### Agent Collaboration View ✅
- [x] Multi-agent task visualization
- [x] Agent workflow diagram
- [x] Real-time status updates
- [x] Task coordination display

### Reports Page (Phase 6) ✅
- [x] Report generator interface
- [x] Report type selection (Comprehensive, Executive, Technical, Compliance)
- [x] Target and scan date selection
- [x] Section selection (checkboxes)
- [x] Output format selection (PDF, HTML, JSON, Markdown)
- [x] Report generation with progress indicator
- [x] Generated reports list with actions

### Projects Page (Phase 7) ✅
- [x] Project cards with status and metrics
- [x] Team member display with online status
- [x] Search and filter functionality
- [x] Tabs for Active/Completed/Archived
- [x] Create new project dialog
- [x] Archive and delete functionality

### Settings Page ✅
- [x] MCP Server Configuration with external access toggle
- [x] Authentication settings with API key generation
- [x] API Configuration (Base URL, WebSocket URL, Timeout, Retry)
- [x] Theme Settings (Dark/Light mode, color customization)
- [x] Notification Settings (sound alerts, critical only, scan complete, vulnerability found)
- [x] Save and Reset functionality
- [x] Security warnings for external access

## 📸 Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/ec2a51d1-7455-4c8b-bcbb-46b150a7951d)

### AI Agents Interface
![AI Agents](https://github.com/user-attachments/assets/3da769d2-6ecc-45ba-a790-cbfee810bbdd)

### Settings Page
![Settings](https://github.com/user-attachments/assets/cf6b3452-7e31-4941-989c-64b94d8f180f)

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

The frontend follows the main HexStrike AI contribution guidelines. See the main README.md for details.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the HexStrike AI v6.0 Platform**
