/*
  Warnings:

  - You are about to drop the column `course` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `User` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "course",
DROP COLUMN "group",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_identifier_key" ON "public"."Group"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Course_identifier_key" ON "public"."Course"("identifier");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
