-- This is an empty migration.

-- Ensure User timestamps are correct
ALTER TABLE "User" 
  ALTER COLUMN "createTime" TYPE TIMESTAMP(6) WITH TIME ZONE,
  ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updateTime" TYPE TIMESTAMP(6) WITH TIME ZONE;

-- Ensure Urge timestamps are correct
ALTER TABLE "Urge" 
  ALTER COLUMN "createTime" TYPE TIMESTAMP(6) WITH TIME ZONE,
  ALTER COLUMN "createTime" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updateTime" TYPE TIMESTAMP(6) WITH TIME ZONE;