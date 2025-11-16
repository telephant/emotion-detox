/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Mood" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Urge" ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTime" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
