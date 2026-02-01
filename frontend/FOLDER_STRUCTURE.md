# Frontend Folder Structure

This document explains the organization of the frontend codebase.

## 📁 Root Level
- `package.json` – Project dependencies and run scripts
- `package-lock.json` – Locks exact dependency versions
- `index.html` – Single HTML file where React app mounts
- `vite.config.ts` – Vite build & dev server configuration
- `eslint.config.js` – Code quality and linting rules
- `postcss.config.js` – CSS processing (used by Tailwind)
- `tailwind.config.js` – Tailwind theme and utility config
- `tsconfig.json` / `tsconfig.node.json` – TypeScript settings
- `README.md` – Project documentation
- `public/` – Static files (images, icons, favicon)

## 📁 src/ (Main Application Code)
- `main.tsx` – App entry point, renders the app
- `App.tsx` – Root component (layout + routes)
- `App.css` – App-level styles
- `index.css` – Global styles + Tailwind directives

## 📁 Feature & Logic Folders

### `pages/` 👉 Full pages/screens
- Complete page components (Login, Dashboard, Profile)
- Organized by user type (admin/, user/)

### `routes/` 👉 All route definitions
- React Router configuration
- Protected routes and navigation logic

### `components/` 👉 Reusable UI components
- Shared components (Button, Modal, Header)
- Layout components

### `services/` 👉 API calls & backend communication
- HTTP client configuration
- API endpoint functions
- External service integrations

### `store/` 👉 Global state management
- Redux/Zustand store configuration
- State slices and actions

### `context/` 👉 React Context for global state
- Authentication context
- Socket context
- Theme context

### `hooks/` 👉 Custom reusable hooks
- `useAuth`, `useDebounce`, `useLocalStorage`
- Business logic hooks

### `utils/` 👉 Helper functions & constants
- Pure utility functions (no UI, no API)
- Constants and configuration
- Formatters and validators

### `styles/` 👉 Common/reusable styles
- CSS variables and themes
- Utility classes
- Component-specific styles

## Import Examples

```typescript
// Utils
import { formatCurrency, API_BASE_URL } from '@/utils';

// Hooks
import { useDebounce, useLocalStorage } from '@/hooks';

// Components
import { Layout, NavTabs } from '@/components';

// Services
import { api } from '@/services';
```

## Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Folders**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase with descriptive names