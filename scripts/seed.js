import { UserRole } from "@prisma/client"
import prisma from "../src/prisma.js"
import { fileURLToPath } from "url"

export async function main() {
  // helper: deterministic-ish password hash (salt:hash)

  // 1) Create admin user (idempotent / tolerant)
  const adminEmail = "admin@example.com"
  const passwordHash = "admin"
  const adminName = "Admin"

  // Try several common field shapes to match different user schemas
  async function upsertAdmin() {
    // candidate create payloads in order of preference
    const candidates = [{ email: adminEmail, name: adminName, role: [UserRole.ADMIN], password: passwordHash }]

    for (const createPayload of candidates) {
      try {
        // use any typings to avoid compile-time model assumptions
        // 'where' uses unique email
        // update will set role/name when available
        const updatePayload = {}
        if ("role" in createPayload) updatePayload.role = createPayload.role
        if ("name" in createPayload) updatePayload.name = createPayload.name

        await prisma.user.upsert({
          where: { email: adminEmail },
          update: updatePayload,
          create: createPayload,
        })
        console.log("Admin upsert succeeded with payload keys:", Object.keys(createPayload).join(", "))
        return
      } catch (err) {
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
  const coursesPayload = Array.from({ length: 6 }, (_, i) => ({
    name: `Course ${i + 1}`,
    identifier: i + 1,
  }))

  for (const c of coursesPayload) {
    await prisma.course.upsert({
      where: { identifier: c.identifier },
      update: { identifier: c.identifier, name: c.name },
      create: c,
    })
  }

  // fetch courses to get their DB ids
  const courses = await prisma.course.findMany({
    where: { identifier: { in: coursesPayload.map(c => c.identifier) } },
  })

  // 3) For each course create 2-3 groups (idempotent)
  for (const course of courses) {
    // random 2-3 groups per course
    const count = 2 + Math.floor(Math.random() * 2) // 2 or 3
    const groupsPayload = Array.from({ length: count }, (_, j) => ({
      identifier: `Group ${j + 1} - ${course.name}`,
      courseId: course.id,
    }))

    for (const g of groupsPayload) {
      await prisma.group.upsert({
        where: { identifier: g.identifier },
        update: { identifier: g.identifier, courseId: g.courseId },
        create: g,
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
