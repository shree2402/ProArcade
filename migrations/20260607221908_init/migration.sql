-- CreateEnum
CREATE TYPE "TaskPreferenceType" AS ENUM ('FAVORITE', 'PRODUCTIVE');

-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('ACTIVE', 'LOCKED_BY_LADDER', 'LOCKED_BY_SNAKE');

-- CreateEnum
CREATE TYPE "AssignedTaskStatus" AS ENUM ('PENDING', 'VERIFIED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TaskPreferenceType" NOT NULL,
    "name" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,

    CONSTRAINT "TaskPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentTile" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedTask" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "AssignedTaskStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaGallery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "TaskPreference_userId_type_idx" ON "TaskPreference"("userId", "type");

-- CreateIndex
CREATE INDEX "GameSession_userId_status_idx" ON "GameSession"("userId", "status");

-- CreateIndex
CREATE INDEX "GameSession_createdAt_idx" ON "GameSession"("createdAt");

-- CreateIndex
CREATE INDEX "AssignedTask_gameSessionId_status_idx" ON "AssignedTask"("gameSessionId", "status");

-- CreateIndex
CREATE INDEX "AssignedTask_createdAt_idx" ON "AssignedTask"("createdAt");

-- CreateIndex
CREATE INDEX "MediaGallery_userId_uploadedAt_idx" ON "MediaGallery"("userId", "uploadedAt");

-- AddForeignKey
ALTER TABLE "TaskPreference" ADD CONSTRAINT "TaskPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedTask" ADD CONSTRAINT "AssignedTask_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaGallery" ADD CONSTRAINT "MediaGallery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
