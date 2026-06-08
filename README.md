# Productivity Arcade

> AI-powered gamified productivity platform that turns procrastination into a Snakes & Ladders game loop.



## Overview

Productivity Arcade is a full-stack behavioral productivity app built around a gamified Snakes & Ladders experience. Users create personalized reward tasks and productive challenge tasks, roll dice on a 10x10 board, complete assigned activities, upload proof, and unlock progress after image verification.

The project demonstrates production-minded full-stack engineering across authentication, persistence, media uploads, AI verification, cloud services, responsive UI, and developer documentation.

## Why This Project Exists

Procrastination is often a feedback-loop problem. Productivity Arcade reframes task completion as an immediate game mechanic:

- Favorite tasks become ladder rewards.
- Productive habits become snake challenges.
- Uploaded proof creates accountability.
- AI verification reduces cheating.
- A persistent game session gives users continuity.
- The victory montage turns completed proof into a visible progress archive.

## Key Features

- Secure registration and login with JWT authentication and httpOnly cookies
- Onboarding task profiler for favorite and productive tasks
- Personalized Snakes & Ladders board with dice rolling
- Smooth animated avatar movement across board tiles
- Custom avatar selection: boy, girl, or cat
- Task assignment engine for ladder and snake tiles
- Board locking while a task is pending
- Image proof upload flow
- AWS S3 storage support
- Amazon Bedrock Claude 3.5 Sonnet verification support
- Local development storage and local verification mode
- PostgreSQL persistence through Prisma ORM
- Account gallery for verified proof images
- Victory timeline and cinematic proof montage
- Responsive dark arcade UI with Tailwind CSS

## Architecture Overview

```mermaid
flowchart TD
  User["User"] --> Frontend["React + Vite Frontend"]
  Frontend --> Backend["Express + TypeScript API"]
  Backend --> Auth["JWT HttpOnly Cookies"]
  Backend --> Prisma["Prisma ORM"]
  Prisma --> Postgres["PostgreSQL"]
  Backend --> S3["AWS S3 or Local Storage"]
  Backend --> Bedrock["Amazon Bedrock Claude 3.5 Sonnet or Local Verification"]
  S3 --> Gallery["Media Gallery"]
  Bedrock --> Game["Game Unlock Logic"]
```

More detail: [System Architecture](./docs/ARCHITECTURE.md)

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- lucide-react

### Backend

- Node.js
- Express.js
- TypeScript
- Zod validation
- bcryptjs
- JWT
- Multer

### Database

- PostgreSQL
- Prisma ORM

### Cloud and AI

- AWS S3
- AWS SDK v3
- Amazon Bedrock Runtime
- Anthropic Claude 3.5 Sonnet

## Demo

Recommended demo flow:

1. Register a new account.
2. Choose avatar and outfit color.
3. Add favorite tasks and productive tasks.
4. Roll dice on the board.
5. Land on a ladder or snake tile.
6. Complete the assigned task.
7. Upload proof.
8. Watch the board unlock after verification.
9. View proof in the gallery.
10. Reach tile 100 to trigger the victory montage.

## Local Installation

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Optional: AWS CLI for S3 and Bedrock production mode

### Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/productivity-arcade.git
cd productivity-arcade
npm install
```

### Create Environment File

```bash
cp .env.example .env
```

For local development, these defaults are enough:

```bash
STORAGE_DRIVER=local
VERIFICATION_DRIVER=local
```

### Start PostgreSQL

macOS with Homebrew:

```bash
brew services start postgresql@16
createdb productivity_arcade
```

If your app uses the default local `.env`, create the `postgres` role:

```bash
psql postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
```

If the role already exists:

```bash
psql postgres -c "ALTER ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
```

### Run Prisma Migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### Start the App

```bash
npm run dev
```

Backend:

```bash
http://localhost:4000
```

Frontend:

```bash
http://localhost:5173
```

If Vite uses `5174`, that is supported by default.

## Running Services Separately

### Backend

```bash
npm run dev --workspace backend
```

### Frontend

```bash
npm run dev --workspace frontend
```

### Prisma Studio

```bash
npm run prisma:studio
```

## Environment Variables

See [Environment Variables](./docs/ENVIRONMENT.md).

Quick example:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/productivity_arcade?schema=public"
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
STORAGE_DRIVER=local
VERIFICATION_DRIVER=local
API_PUBLIC_URL=http://localhost:4000
```

## AWS Configuration

Local development works without AWS by using:

```bash
STORAGE_DRIVER=local
VERIFICATION_DRIVER=local
```

For production AWS mode:

```bash
STORAGE_DRIVER=s3
VERIFICATION_DRIVER=bedrock
```

Required AWS setup:

- S3 bucket for proof uploads
- IAM permissions for `s3:PutObject`, `s3:GetObject`, and `bedrock:InvokeModel`
- Bedrock model access enabled for Claude 3.5 Sonnet
- AWS credentials configured through environment variables or platform secrets

More detail: [Deployment Guide](./docs/DEPLOYMENT.md)

## API Documentation

Full API docs: [API Documentation](./docs/API.md)

Core endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /profile/tasks`
- `POST /game/start`
- `POST /game/roll`
- `POST /game/verify-proof`
- `GET /game/state`
- `GET /gallery`

## Repository Structure

```text
productivity-arcade/
├── backend/
├── frontend/
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

Full structure explanation: [Repository Structure](./docs/REPOSITORY_STRUCTURE.md)

## Deployment

Recommended deployment targets:

- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL, Neon, Supabase, or AWS RDS PostgreSQL
- Media: AWS S3
- AI: Amazon Bedrock

Deployment guide: [Deployment Guide](./docs/DEPLOYMENT.md)

## Future Improvements

- Persist avatar preferences in PostgreSQL
- Add multiplayer productivity leagues
- Add daily streaks and habit analytics
- Add OAuth login
- Add signed S3 URLs or CloudFront media delivery
- Add automated integration tests
- Add CI/CD with GitHub Actions
- Add production observability with structured logs and tracing
- Add admin analytics dashboard

## License

MIT License. See [LICENSE](./LICENSE).

## Author

Built by **Shree Gayathri** as a production-ready full-stack portfolio project demonstrating frontend engineering, backend architecture, cloud integration, AI verification, database design, and developer documentation.

If you are a recruiter or hiring manager, start with:

- [System Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
