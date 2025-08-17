# Deep Research Agents UI

A modern React-based web interface for the Deep Research Agents system, providing comprehensive monitoring and interaction capabilities for research agents, memory management, search operations, and citation handling.

## 🚀 Features

### ✅ Completed
- **Agent Dashboard** - Real-time monitoring of all research agents
- **Dark/Light Mode** - Toggle between themes with persistent preference
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **WebSocket Integration** - Real-time updates and notifications
- **TypeScript Support** - Full type safety throughout the application
- **Modern UI** - Built with Tailwind CSS and modern React patterns

### 🚧 In Development
- **Search Interface** - Dynamic search across all document types
- **Memory Explorer** - Browse and manage semantic memory entries
- **Citation Manager** - Create, edit, and manage citations

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- The Deep Research Agents system (lib folder)

### Install Dependencies

```bash
# Frontend dependencies
cd deep-research-ui
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
```

### Development Mode

```bash
# Terminal 1: Start the backend
uv run python backend/main.py

# Terminal 2: Start the frontend
cd deep-research-ui
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
deep-research-ui/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── AgentDashboard.tsx    # Real-time agent monitoring
│   │   ├── shared/
│   │   │   └── Header.tsx            # Navigation and theme toggle
│   │   ├── search/                   # Search interface (coming soon)
│   │   ├── memory/                   # Memory explorer (coming soon)
│   │   └── citations/                # Citation manager (coming soon)
│   ├── services/
│   │   ├── api.ts                    # REST API client
│   │   └── websocket.ts              # WebSocket client
│   ├── hooks/
│   │   └── useAgents.ts              # Agent state management
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── utils/
│       └── cn.ts                     # Utility functions
├── backend/
│   ├── main.py                       # FastAPI backend
│   └── requirements.txt              # Python dependencies
└── package.json
```

## 🔧 API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/stats` - Agent statistics

### Search
- `POST /api/search` - Search documents
- `GET /api/search/providers` - Available search providers
- `GET /api/search/document-types` - Available document types

### Memory
- `POST /api/memory/store` - Store memory entry
- `POST /api/memory/search` - Search memory
- `GET /api/memory/stats` - Memory statistics
- `DELETE /api/memory/clear` - Clear all memory

### Citations
- `POST /api/citations` - Create citation
- `GET /api/citations` - List citations
- `GET /api/citations/{id}` - Get specific citation
- `DELETE /api/citations/{id}` - Delete citation

### WebSocket
- `ws://localhost:8000/ws` - Real-time updates
