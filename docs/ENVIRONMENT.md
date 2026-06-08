# Environment Variables

Copy `.env.example` to `.env` for local development.

```bash
cp .env.example .env
```

## Required Variables

### `DATABASE_URL`

PostgreSQL connection string used by Prisma.

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/productivity_arcade?schema=public"
```

### `PORT`

Backend API port.

```bash
PORT=4000
```

### `NODE_ENV`

Runtime mode.

```bash
NODE_ENV=development
```

Use `production` in deployed environments.

### `CLIENT_ORIGIN`

Allowed frontend origins for CORS.

```bash
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
```

In production:

```bash
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

### `JWT_ACCESS_SECRET`

Secret used to sign short-lived access tokens.

Use a long random value in production.

### `JWT_REFRESH_SECRET`

Secret used to sign refresh tokens.

Use a different long random value from `JWT_ACCESS_SECRET`.

### `COOKIE_DOMAIN`

Optional cookie domain.

Leave empty locally.

For custom production domains, configure according to your domain strategy.

### `AWS_REGION`

AWS region for S3 and Bedrock.

```bash
AWS_REGION=us-east-1
```

### `AWS_S3_BUCKET`

S3 bucket for verified proof uploads in production.

```bash
AWS_S3_BUCKET=your-unique-bucket-name
```

### `BEDROCK_MODEL_ID`

Bedrock model id for Claude 3.5 Sonnet.

```bash
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

### `STORAGE_DRIVER`

Controls proof image storage.

```bash
STORAGE_DRIVER=local
```

Options:

- `local`: saves files to `backend/uploads`
- `s3`: uploads files to AWS S3

### `VERIFICATION_DRIVER`

Controls proof verification mode.

```bash
VERIFICATION_DRIVER=local
```

Options:

- `local`: accepts proof in local development
- `bedrock`: calls Amazon Bedrock Claude

### `API_PUBLIC_URL`

Public URL used when generating local media URLs.

```bash
API_PUBLIC_URL=http://localhost:4000
```

Production:

```bash
API_PUBLIC_URL=https://your-backend-domain.com
```

## Optional AWS Credential Variables

When not using an IAM role, set:

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

Do not commit these values.
