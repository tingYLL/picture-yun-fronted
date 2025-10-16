# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript picture management and sharing platform frontend. The project includes features for picture upload, management, search, sharing, and analysis with user authentication and space management capabilities.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs type-check and build-only)
- `npm run picture-build` - Build only (no type check)
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run openapi` - Generate API client from OpenAPI spec

### Special Commands
- `npm run preview` - Preview production build

## Architecture

### Frontend Stack
- **Framework**: Vue 3 with Composition API and TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design Vue 4.x
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Charts**: ECharts with Vue integration
- **Styling**: Less preprocessor

### Project Structure
```
src/
├── api/              # Auto-generated API controllers
├── components/       # Reusable Vue components
├── layouts/          # Layout components (BasicLayout)
├── pages/            # Page components (feature-based)
├── router/           # Vue Router configuration
├── stores/           # Pinia state management
├── utils/            # Utility functions
├── constants/        # Application constants
├── request.ts        # Axios instance with interceptors
└── App.vue           # Root component
```

### Key Features
- **Picture Management**: Upload, edit, delete pictures with batch operations
- **Search**: Text search, color search, and reverse image search
- **Social Features**: Like, collect, share pictures
- **Space System**: Organize pictures in user spaces with permissions
- **Admin Panel**: User, picture, space, category management
- **Analytics**: Space usage and picture statistics with ECharts
- **VIP System**: Premium features and redemption codes

### API Integration
- API controllers are auto-generated from OpenAPI specification at `http://localhost:8123/api/v2/api-docs`
- Use `npm run openapi` to regenerate API clients
- Base URL points to localhost:8123 (development backend)
- Request interceptor handles authentication (401 redirects to login)

### State Management
- `useLoginUserStore`: Manages user authentication state
- Stores use Pinia with TypeScript integration
- User state persists across app sessions

### Component Patterns
- Pages are feature-based in `src/pages/`
- Reusable components in `src/components/`
- Layout system with `BasicLayout` wrapper
- Composition API with `<script setup>` syntax

### Routing
- Vue Router with history mode
- Route guards and authentication handling
- Dynamic routes with props passing
- Admin routes prefixed with `/admin/`

### Key Technical Details
- **Environment**: Development targets localhost:8123 backend
- **Authentication**: Cookie-based with automatic redirect on 401
- **File Upload**: Form data handling for picture uploads
- **Image Processing**: Cropper and out-painting features
- **Responsive**: Mobile-first design with Ant Design
- **Performance**: Lazy loading, infinite scroll, debouncing

### Development Workflow
1. Backend changes → Run `npm run openapi` to update API clients
2. Type checking enforced with `npm run type-check`
3. Linting and formatting with ESLint + Prettier
4. Development server with hot reload on port 5173

### Important Notes
- Backend repository: https://github.com/tingYLL/picture-yun
- CORS handled via Vite proxy configuration (commented out in vite.config.ts)
- OpenAPI generation is crucial for keeping API clients synchronized
- User authentication is handled via cookies, not tokens