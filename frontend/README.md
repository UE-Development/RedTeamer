# HexStrike AI Frontend

Modern React + TypeScript frontend with Agent Interface for HexStrike AI v6.0.

## Features

- 🎨 **Modern UI** - Material-UI components with cybersecurity hacker theme
- 🤖 **AI Agent Interface** - Seamless communication with autonomous AI agents
- 📊 **Real-time Dashboard** - Live monitoring of security assessments
- 🛠️ **Tool Management** - Browse and execute 150+ security tools
- 🔍 **Scan Management** - Create and monitor security scans
- 🐛 **Vulnerability Tracking** - Manage discovered vulnerabilities
- 📄 **Report Generation** - Generate comprehensive security reports
- 🔄 **WebSocket Integration** - Real-time updates from backend

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Material-UI (MUI) v5** - Component library
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket communication
- **Vite** - Build tool

## Prerequisites

- Node.js 20+ and npm (required for Vite 7.x)
- HexStrike AI backend server running on port 8889

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Roadmap

Based on FEATURES.md, Phase 1 (Foundation) is complete:

### Phase 1: Foundation ✅
- [x] Project setup with React + TypeScript + Vite
- [x] Redux Toolkit state management
- [x] Material-UI theme (cybersecurity/hacker style)
- [x] Basic routing and layout
- [x] API client and WebSocket service

### Phase 2: Agent Interface ✅
- [x] Agent chat interface with message threading
- [x] Agent selector panel with status indicators
- [x] Smart command builder with auto-completion
- [x] Real-time agent communication display
- [x] 12 AI agents with mock data

### Phase 3: Tool Management (Next)
- [ ] Tool library browser with search/filter
- [ ] Tool detail pages
- [ ] Tool launch interface
- [ ] Tool configuration panels

## License

MIT License
