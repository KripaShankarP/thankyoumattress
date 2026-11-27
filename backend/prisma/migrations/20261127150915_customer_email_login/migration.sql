-- CreateEnum
CREATE TYPE "OtpChannel" AS ENUM ('SMS', 'EMAIL');

-- DropIndex
DROP INDEX "OtpCode_phone_createdAt_idx";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OtpCode" DROP COLUMN "phone",
ADD COLUMN     "channel" "OtpChannel" NOT NULL,
ADD COLUMN     "target" TEXT NOT NULL;

-- Emails become a sign-in identity: normalise them and keep only the first customer per email
UPDATE "Customer" SET "email" = NULLIF(lower(trim("email")), '') WHERE "email" IS NOT NULL;
UPDATE "Customer" c SET "email" = NULL
WHERE "email" IS NOT NULL AND "id" <> (SELECT min(d."id") FROM "Customer" d WHERE d."email" = c."email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "OtpCode_channel_target_createdAt_idx" ON "OtpCode"("channel", "target", "createdAt");

