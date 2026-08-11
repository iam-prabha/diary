-- AlterTable
ALTER TABLE "users" ADD COLUMN "googleId" TEXT,
ADD COLUMN "avatarUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
