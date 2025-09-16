import prisma from "../src/prisma"
import { fileURLToPath } from "url"
const { resolve } = require("path")
const fs = require("fs")

export async function main() {
  console.log("[seed] started")
  // helper: deterministic-ish password hash (salt:hash)

  async function upsertAdmin() {
    const admins = seed.Admins || []
    if (!admins.length) {
      console.warn("[seed] no admin candidates found in seed.Admins")
      return
    }

    const tried = []
    let lastErr = null

    for (const admin of admins) {
      // try a few possible unique keys depending on your schema
      const whereCandidates = []
      if (admin.id) whereCandidates.push({ id: admin.id })
      if (admin.login) whereCandidates.push({ login: admin.login })
      if (admin.email) whereCandidates.push({ email: admin.email })

      // fallback: try using login if nothing else available
      if (!whereCandidates.length && admin.login) whereCandidates.push({ login: admin.login })

      for (const where of whereCandidates) {
        tried.push(where)
        try {
          await prisma.user.upsert({
            where,
            update: admin,
            create: admin,
          })
          console.log("[seed] admin upserted with where:", where)
          return
        } catch (err) {
          lastErr = err
          console.warn("[seed] admin upsert failed for where:", where, "err:", err?.message || err)
          // try next where
        }
      }
    }

    console.error("[seed] failed to upsert any admin. tried:", tried, "lastErr:", lastErr?.message || lastErr)
  }

  try {
    await upsertAdmin()
  } catch (err) {
    console.warn("[seed] Unexpected error while creating admin:", err)
  }

  // Courses
  const coursesSeed = seed.Courses || []
  if (!coursesSeed.length) console.warn("[seed] no courses in seed.Courses")

  // create courses
  for (const course of coursesSeed) {
    try {
      await prisma.course.upsert({
        where: { identifier: course.identifier },
        update: { name: course.name },
        create: course,
      })
      console.log(`[seed] course upserted: ${course.identifier}`)
    } catch (err) {
      console.warn(`[seed] course upsert failed for ${course.identifier}:`, err?.message || err)
    }
  }

  // derive identifiers used below
  const courseIdentifiers = coursesSeed.map(c => c.identifier)

  // fetch created courses
  let createdCourses = []
  try {
    createdCourses = await prisma.course.findMany({
      where: { identifier: { in: courseIdentifiers } },
    })
    console.log(`[seed] found ${createdCourses.length} created courses`)
  } catch (err) {
    console.warn("[seed] failed to find created courses:", err?.message || err)
  }

  const groupsSeed = seed.Groups || []
  for (const course of createdCourses) {
    for (const group of groupsSeed) {
      if (group.courseIdentifier !== course.identifier) continue
      try {
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
        console.log(`[seed] group upserted: ${group.identifier} for course ${course.identifier}`)
      } catch (err) {
        console.warn(`[seed] group upsert failed for ${group.identifier}:`, err?.message || err)
      }
    }
  }

  console.log("Seeding complete")
}

// run when executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then(async () => {
      await prisma.$disconnect()
      console.log("[seed] finished")
    })
    .catch(async err => {
      console.error("Seed script failed:", err)
      await prisma.$disconnect()
      process.exit(1)
    })
}

async function run() {
  try {
    // load ESM seed data
    const seedModule = await import(resolve(__dirname, "initialSchemas.mjs"))
    const { default: seed } = seedModule

    // require Prisma client (must be generated / installed)
    const { PrismaClient } = require("@prisma/client")
    const prisma = new PrismaClient()

    console.log("[seed-runner] started")

    // Admins: use login === email if login missing (login is unique in your schema)
    const admins = seed.Admins || []
    for (const a of admins) {
      const login = a.login || a.email
      if (!login) {
        console.warn("[seed-runner] skipping admin without login/email:", a)
        continue
      }
      try {
        const existing = await prisma.user.findUnique({ where: { login } })
        if (existing) {
          await prisma.user.update({
            where: { login },
            data: {
              name: a.name ?? existing.name,
              password: a.password ?? existing.password,
              role: a.role ?? existing.role,
              courseId: a.courseId ?? existing.courseId,
              groupId: a.groupId ?? existing.groupId,
            },
          })
          console.log(`[seed-runner] updated admin ${login}`)
        } else {
          await prisma.user.create({
            data: {
              login,
              name: a.name || login,
              password: a.password || "",
              role: a.role || ["ADMIN"],
              courseId: a.courseId ?? null,
              groupId: a.groupId ?? null,
            },
          })
          console.log(`[seed-runner] created admin ${login}`)
        }
      } catch (err) {
        console.warn("[seed-runner] admin upsert failed:", err?.message || err)
      }
    }

    // Courses: upsert by identifier
    const courses = seed.Courses || []
    for (const c of courses) {
      try {
        await prisma.course.upsert({
          where: { identifier: c.identifier },
          update: { name: c.name },
          create: { name: c.name, identifier: c.identifier },
        })
        console.log(`[seed-runner] upserted course ${c.identifier}`)
      } catch (err) {
        console.warn("[seed-runner] course upsert failed:", err?.message || err)
      }
    }

    // Groups: link to course by identifier
    const groups = seed.Groups || []
    for (const g of groups) {
      try {
        const course = await prisma.course.findUnique({ where: { identifier: g.courseIdentifier } })
        if (!course) {
          console.warn(`[seed-runner] skip group ${g.identifier}: course ${g.courseIdentifier} not found`)
          continue
        }
        await prisma.group.upsert({
          where: { identifier: g.identifier },
          update: { courseId: course.id },
          create: { identifier: g.identifier, courseId: course.id },
        })
        console.log(`[seed-runner] upserted group ${g.identifier}`)
      } catch (err) {
        console.warn("[seed-runner] group upsert failed:", err?.message || err)
      }
    }

    console.log("[seed-runner] finished")
    await prisma.$disconnect()
    process.exit(0)
  } catch (err) {
    console.error("[seed-runner] failed:", err)
    process.exit(1)
  }
}

run()
