# Repository Structure

This repository is organized as a production-ready full-stack application with clear separation between frontend, backend, database, documentation, and deployment assets.

```text
productivity-arcade/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── validation/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── state/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── docs/
├── screenshots/
├── deployment/
├── architecture/
├── migrations/
├── schema.prisma
├── docker-compose.yml
├── package.json
└── README.md
```

## Major Folders

### `frontend/`

React 18 + TypeScript + Vite client application. It contains authentication pages, onboarding, dashboard, game board, avatar selection, proof upload UI, gallery, and victory montage.

### `frontend/src/components/`

Reusable UI and domain components such as the board, dice roller, avatar selector, upload zone, gallery cards, and victory montage.

### `frontend/src/pages/`

Route-level screens including login, register, onboarding, dashboard, and gallery.

### `frontend/src/hooks/`

Custom React hooks for game state and API-driven workflows.

### `frontend/src/state/`

Application-level React context, including authentication state.

### `frontend/src/lib/`

Frontend utilities such as API client, formatting helpers, and avatar preference helpers.

### `backend/`

Express.js + TypeScript API server. It owns authentication, profile preferences, game progression, media upload, AI verification, and gallery APIs.

### `backend/src/config/`

Environment parsing and runtime configuration.

### `backend/src/lib/`

Shared backend utilities such as Prisma client, error handling, DTO mapping, board configuration, JWT helpers, and image validation.

### `backend/src/middleware/`

Authentication middleware and rate limiting.

### `backend/src/routes/`

REST API route definitions for auth, profile, game, and gallery modules.

### `backend/src/services/`

Business logic and integrations, including game logic, profile status, S3/local upload, and Bedrock/local verification.

### `backend/src/validation/`

Zod schemas for request validation.

### `schema.prisma`

Prisma schema defining the PostgreSQL data model.

### `migrations/`

Prisma migration history. These files should be committed so deployed databases can be reproduced.

### `docs/`

Long-form technical documentation for architecture, API, deployment, environment variables, and screenshots.

### `screenshots/`

Repository image assets for README and portfolio presentation.

### `deployment/`

Deployment notes, platform configs, IaC drafts, or service-specific setup files.

### `architecture/`

Architecture diagrams, exported Mermaid files, and visual system design assets.
