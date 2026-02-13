# Recruitment Frontend

A React + TypeScript + Vite application for recruitment management.

## Tech Stack

- **React** 18.3.1
- **TypeScript** 5.5.3
- **Vite** 5.3.1
- **React Router DOM** 7.9.6
- **Framer Motion** 12.23.26
- **Lucide React** 0.553.0
- **Firebase** 12.5.0
- **SCSS** (sass-embedded 1.93.3)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The development server will start with:
- Hot module replacement
- Proxy for `/api` endpoints (defaults to `http://localhost:3000`, configurable via `VITE_API_TARGET` env var)
- WebSocket proxying enabled
- Network access enabled (host: true)

### Build

```bash
npm run build
```

This will:
1. Run TypeScript type checking
2. Build the production bundle to `dist/`

### Preview

```bash
npm run preview
```

Preview the production build locally.

### Linting

```bash
npm run lint
```

## Project Structure

```
├── public/          # Static assets
├── src/             # Source files
│   ├── main.tsx     # Entry point
│   ├── App.tsx      # Root component
│   ├── main.scss    # Main stylesheet (compiled to main.css)
│   └── main.css     # Compiled CSS
├── tsconfig.json    # TypeScript config for src
├── tsconfig.node.json # TypeScript config for vite.config.ts
├── vite.config.ts   # Vite configuration
└── .eslintrc.cjs    # ESLint configuration
```

## Configuration

### API Proxy

The Vite dev server proxies `/api` requests. Set the target via environment variable:

```bash
VITE_API_TARGET=http://localhost:3000 npm run dev
```

### TypeScript

- Target: ES2020
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Strict mode enabled
- No unused locals/parameters

### Styling

SCSS files are supported. The main stylesheet is `src/main.scss`, which is compiled to `src/main.css`.









