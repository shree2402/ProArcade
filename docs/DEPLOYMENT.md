# Deployment Guide

Recommended production deployment:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Render PostgreSQL, Neon, Supabase, or AWS RDS
- Media: AWS S3
- AI: Amazon Bedrock Claude 3.5 Sonnet

## Frontend Deployment: Vercel

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set root directory to:

```text
frontend
```

4. Configure build:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add environment variable:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

6. Deploy.

## Backend Deployment: Render

1. Create a new Render Web Service.
2. Connect the GitHub repository.
3. Set root directory:

```text
backend
```

4. Configure commands:

```text
Build Command: npm install && npm run build
Start Command: npm run start
```

5. Add production environment variables from `.env.example`.

Important production values:

```bash
NODE_ENV=production
PORT=10000
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
STORAGE_DRIVER=s3
VERIFICATION_DRIVER=bedrock
API_PUBLIC_URL=https://your-render-backend.onrender.com
```

## PostgreSQL Deployment

Options:

- Render PostgreSQL
- Neon
- Supabase
- AWS RDS PostgreSQL

After creating a database, copy the connection string into:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Run migrations:

```bash
npx prisma migrate deploy --schema ../schema.prisma
```

If Render root is `backend`, update the command path according to your deployment layout.

## AWS S3 Setup

1. Create an S3 bucket.
2. Keep bucket name globally unique.
3. Use the same region as `AWS_REGION`.
4. Configure IAM permissions:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject",
    "s3:ListBucket"
  ],
  "Resource": [
    "arn:aws:s3:::YOUR_BUCKET_NAME",
    "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  ]
}
```

5. Set:

```bash
AWS_REGION=us-east-1
AWS_S3_BUCKET=YOUR_BUCKET_NAME
STORAGE_DRIVER=s3
```

## Amazon Bedrock Setup

1. Open AWS Console.
2. Go to Amazon Bedrock.
3. Open Model Access.
4. Enable Anthropic Claude 3.5 Sonnet.
5. Ensure the backend IAM principal can invoke Bedrock:

```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "*"
}
```

6. Set:

```bash
VERIFICATION_DRIVER=bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

## Secrets Management

Never commit `.env`.

Store secrets in:

- Vercel Project Settings for frontend variables
- Render Environment tab for backend variables
- AWS IAM role or environment variables for AWS credentials

Production secrets:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `BEDROCK_MODEL_ID`

## Production Checklist

- `NODE_ENV=production`
- `CLIENT_ORIGIN` points to the deployed frontend
- `COOKIE_DOMAIN` configured if using a custom shared domain
- Strong JWT secrets
- PostgreSQL migrations applied
- S3 bucket created
- Bedrock model access enabled
- CORS configured for frontend origin
- Local drivers disabled:

```bash
STORAGE_DRIVER=s3
VERIFICATION_DRIVER=bedrock
```
