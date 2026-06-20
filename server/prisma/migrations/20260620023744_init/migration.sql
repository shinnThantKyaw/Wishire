-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "birthMonth" INTEGER NOT NULL,
    "birthDay" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "sentences" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wishId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "thumbnailFilename" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wishId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Reaction_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wishId" TEXT NOT NULL,
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Stat_wishId_fkey" FOREIGN KEY ("wishId") REFERENCES "Wish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Photo_wishId_idx" ON "Photo"("wishId");

-- CreateIndex
CREATE INDEX "Reaction_wishId_idx" ON "Reaction"("wishId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_wishId_emoji_key" ON "Reaction"("wishId", "emoji");

-- CreateIndex
CREATE INDEX "Stat_wishId_idx" ON "Stat"("wishId");
