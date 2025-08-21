# Caelven Music Player

A modern music player application with React frontend and Express.js backend.

## Project Structure

```
caelven/
├── frontend/          # React + TypeScript + Vite application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/          # Express.js API server
│   ├── src/          # Backend source code
│   ├── package.json  # Backend dependencies
│   └── ...
└── package.json      # Root monorepo configuration
```

## Quick Start

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install
```

### Development

```bash
# Run both frontend and backend in development mode
npm run dev

# Or run them separately:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:3001
```

### Production

```bash
# Build both applications
npm run build

# Start production servers
npm start
```

## Frontend (React + TypeScript + Vite)

- **Port**: 5173
- **Network Access**: http://192.168.1.52:5173
- **Features**: Music player, playlist management, responsive design

### Frontend Scripts

```bash
cd frontend
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Backend (Express.js)

- **Port**: 3001
- **Network Access**: http://192.168.1.52:3001
- **Features**: REST API, music file management

### Backend Scripts

```bash
cd backend
npm run dev      # Development server with nodemon
npm start        # Production server
```

### API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/tracks` - Get all tracks
- `POST /api/tracks` - Upload new track

## Network Access

Both frontend and backend are configured to run on your network:

- **Frontend**: http://192.168.1.52:5173
- **Backend**: http://192.168.1.52:3001

You can access the application from your phone or other devices on the same network.

## Technologies

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- GSAP (animations)
- Three.js (3D graphics)

### Backend
- Express.js
- Node.js
- CORS enabled
- Helmet (security)
- Morgan (logging)

## Development Workflow

1. Start both servers: `npm run dev`
2. Frontend runs on port 5173
3. Backend runs on port 3001
4. Access from network devices using your IP address
5. Hot reload works for both frontend and backend

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

Copy `backend/env.example` to `backend/.env` and modify as needed.
