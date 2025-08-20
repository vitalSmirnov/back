/*
  Warnings:

  - The values [SICKNESS,OTHER] on the enum `TicketReason` will be removed. If these variants are still used in the database, this will fail.
  - The values [OPEN,CLOSED] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Admin,Student,Professor] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `course` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `group` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."TicketReason_new" AS ENUM ('SICKDAY', 'FAMILY', 'COMPETITION');
ALTER TABLE "public"."Ticket" ALTER COLUMN "reason" TYPE "public"."TicketReason_new" USING ("reason"::text::"public"."TicketReason_new");
ALTER TYPE "public"."TicketReason" RENAME TO "TicketReason_old";
ALTER TYPE "public"."TicketReason_new" RENAME TO "TicketReason";
DROP TYPE "public"."TicketReason_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TicketStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Ticket" ALTER COLUMN "status" TYPE "public"."TicketStatus_new" USING ("status"::text::"public"."TicketStatus_new");
ALTER TYPE "public"."TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "public"."TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('ADMIN', 'STUDENT', 'PROFESSOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "course" INTEGER NOT NULL,
ADD COLUMN     "group" TEXT NOT NULL;
