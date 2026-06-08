# System Architecture

Productivity Arcade is a full-stack web application with a React frontend, Express backend, PostgreSQL database, Prisma ORM, optional AWS S3 media storage, and optional Amazon Bedrock Claude 3.5 Sonnet verification.

## High-Level Flow

```mermaid
flowchart TD
  User["User"] --> Frontend["React 18 + Vite Frontend"]
  Frontend --> Backend["Express.js + TypeScript API"]
  Backend --> Prisma["Prisma ORM"]
  Prisma --> Postgres["PostgreSQL"]
  Backend --> Storage["AWS S3 or Local Upload Storage"]
  Backend --> AI["Amazon Bedrock Claude 3.5 Sonnet or Local Verification"]
  Storage --> Gallery["MediaGallery Records"]
  AI --> Unlock["Unlock Game Session"]
```

## Runtime Components

```mermaid
flowchart LR
  Browser["Browser"] --> React["React App"]
  React --> API["Express API"]
  API --> Auth["JWT Cookie Auth"]
  API --> Game["Game Service"]
  API --> Upload["Upload Service"]
  API --> Verify["Verification Service"]
  Game --> DB["PostgreSQL via Prisma"]
  Upload --> S3["S3 / Local Files"]
  Verify --> Bedrock["Bedrock / Local Mode"]
```

## Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant API as Backend API
  participant DB as PostgreSQL

  U->>FE: Submit email and password
  FE->>API: POST /auth/register or /auth/login
  API->>DB: Lookup or create user
  API->>API: Hash/compare password with bcrypt
  API-->>FE: Set httpOnly JWT cookies
  FE->>API: GET /auth/me
  API-->>FE: Return authenticated user
```

### Security Notes

- Access and refresh tokens are stored in httpOnly cookies.
- Passwords are hashed with bcrypt.
- API routes are protected with auth middleware.
- Zod validates request payloads.
- Rate limiting is applied to auth, game, and upload routes.

## Game Persistence Flow

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant API as Backend
  participant DB as PostgreSQL

  FE->>API: POST /game/start
  API->>DB: Find latest session or create one
  API-->>FE: Return session and board state

  FE->>API: POST /game/roll
  API->>DB: Read active game session
  API->>API: Roll dice and resolve tile effect
  API->>DB: Update tile/status and create assigned task if needed
  API-->>FE: Return dice result and updated session
```

The session is stored in `GameSession`, so users can close the browser and return later.

## Image Upload Flow

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Frontend
  participant API as Backend
  participant Storage as S3 or Local Storage
  participant DB as PostgreSQL

  U->>FE: Upload proof image
  FE->>API: POST /game/verify-proof multipart/form-data
  API->>API: Validate auth, pending task, MIME type, and file signature
  API->>Storage: Store proof image
  API->>API: Run AI/local verification
  API->>DB: Save MediaGallery record if verified
  API->>DB: Mark AssignedTask as VERIFIED
  API->>DB: Unlock GameSession
  API-->>FE: Return verification result
```

## AI Verification Flow

```mermaid
sequenceDiagram
  participant API as Backend
  participant Bedrock as Amazon Bedrock
  participant Claude as Claude 3.5 Sonnet

  API->>Bedrock: InvokeModel with task prompt and image
  Bedrock->>Claude: Multimodal reasoning
  Claude-->>Bedrock: JSON verification result
  Bedrock-->>API: { verified, reason, confidence }
  API->>API: Validate JSON with Zod
```

Expected model output:

```json
{
  "verified": true,
  "reason": "The image shows evidence matching the assigned task.",
  "confidence": 0.92
}
```

## Local Development Mode

For fast local testing without AWS:

```bash
STORAGE_DRIVER=local
VERIFICATION_DRIVER=local
```

For production cloud mode:

```bash
STORAGE_DRIVER=s3
VERIFICATION_DRIVER=bedrock
```
