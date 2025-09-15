import prisma from "../src/prisma"
import { fileURLToPath } from "url"
import { Admins, Courses, Groups } from "./initialSchemas"

export async function main() {
  // helper: deterministic-ish password hash (salt:hash)

  // 1) Create admin user (idempotent / tolerant)

  // Try several common field shapes to match different user schemas
  async function upsertAdmin() {
    // candidate create payloads in order of preference
    const admins = Admins

    for (const admin of admins) {
      try {
        // use any typings to avoid compile-time model assumptions
        // 'where' uses unique email
        // update will set role/name when available

        await prisma.user.upsert({
          where: { email: admin.email },
          update: admin,
          create: admin,
        })
        return
      } catch (err) {
        console.error("Admin upsert attempt failed with payload keys:", admin)
        // try next candidate if model shape mismatch
        // keep errors quiet for each attempt, but log last error if all fail
        // (no rethrow here)
      }
    }

    // if we reach here, log a helpful message
    console.warn("Failed to upsert admin user. Check your Prisma schema for a User model with a unique 'email' field.")
  }

  try {
    await upsertAdmin()
  } catch (err) {
    console.warn("Unexpected error while creating admin:", err)
  }

  // 2) Create 6 courses (idempotent)
  const coursesSeed = Courses

  for (const course of coursesSeed) {
    await prisma.course.upsert({
      where: { identifier: course.identifier },
      update: { name: course.name },
      create: course,
    })
  }

  const createdCourses = await prisma.course.findMany({
    where: { identifier: { in: courseIdentifiers } },
  })

  const groupsSeed = Groups

  // 3) For each course create 2-3 groups (idempotent)
  for (const course of createdCourses) {
    for (const group of groupsSeed) {
      if (group.courseIdentifier !== course.identifier) continue
      await prisma.group.upsert({
        where: { identifier: group.identifier },
        update: {
          id: group.id,
          courseId: course.id,
          identifier: group.identifier,
        },
        create: {
          id: group.id,
          courseId: course.id,
          identifier: group.identifier,
        },
      })
    }
  }

  console.log("Seeding complete")
}

// run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async err => {
      console.error("Seed script failed:", err)
      await prisma.$disconnect()
      process.exit(1)
    })
}
