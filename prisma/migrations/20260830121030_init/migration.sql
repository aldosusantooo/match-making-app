-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "GenderRule" AS ENUM ('MIXED', 'SAME_GENDER_ONLY', 'SINGLES_ONLY');

-- CreateEnum
CREATE TYPE "SkillTier" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "genderRule" "GenderRule" NOT NULL DEFAULT 'MIXED',
    "skillMatchmakingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
    "skillTier" "SkillTier" NOT NULL DEFAULT 'UNKNOWN',
    "rating" DOUBLE PRECISION NOT NULL,
    "status" "PlayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "side" "Side" NOT NULL,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("matchId","playerId")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "matchId" TEXT NOT NULL,
    "winningSide" "Side" NOT NULL,
    "score" TEXT,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("matchId")
);

-- CreateIndex
CREATE INDEX "Player_sessionId_idx" ON "Player"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_sessionId_matchNumber_key" ON "Match"("sessionId", "matchNumber");

-- CreateIndex
CREATE INDEX "MatchPlayer_playerId_idx" ON "MatchPlayer"("playerId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
