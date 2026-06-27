-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'friend',
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "sentences" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'sunrise',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "wishId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "thumbnailFilename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "wishId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" SERIAL NOT NULL,
    "wishId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Photo_wishId_idx" ON "Photo"("wishId");

-- CreateIndex
CREATE INDEX "Reaction_wishId_idx" ON "Reaction"("wishId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_wishId_emoji_key" ON "Reaction"("wishId", "emoji");

-- CreateIndex
CREATE INDEX "Stat_wishId_idx" ON "Stat"("wishId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

