/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Urge` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Urge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `updateTime` to the `Urge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateTime` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- First add the new columns without dropping the old ones

-- AlterTable for User
ALTER TABLE "User" 
ADD COLUMN "createTime" TIMESTAMP(6),
ADD COLUMN "updateTime" TIMESTAMP(6);

-- AlterTable for Urge
ALTER TABLE "Urge" 
ADD COLUMN "createTime" TIMESTAMP(6),
ADD COLUMN "updateTime" TIMESTAMP(6);

-- Copy data from old columns to new columns
UPDATE "User" SET 
  "createTime" = "createdAt",
  "updateTime" = "updatedAt";

UPDATE "Urge" SET 
  "createTime" = "createdAt",
  "updateTime" = "updatedAt";

-- Set NOT NULL constraints and default values
ALTER TABLE "User" 
ALTER COLUMN "createTime" SET NOT NULL,
ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTime" SET NOT NULL;

ALTER TABLE "Urge" 
ALTER COLUMN "createTime" SET NOT NULL,
ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updateTime" SET NOT NULL;

-- Finally drop the old columns
ALTER TABLE "User" DROP COLUMN "createdAt";
ALTER TABLE "User" DROP COLUMN "updatedAt";

ALTER TABLE "Urge" DROP COLUMN "createdAt";
ALTER TABLE "Urge" DROP COLUMN "updatedAt";
