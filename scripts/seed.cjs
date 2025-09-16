const { PrismaClient } = require("@prisma/client")
const { resolve } = require("path")
const fs = require("fs")

const prisma = new PrismaClient()

async function main() {
  const jsonPath = resolve(__dirname, "initialSchemas.json")
  if (!fs.existsSync(jsonPath)) {
    console.error("Seed file not found:", jsonPath)
    process.exit(1)
  }

  const seed = JSON.parse(fs.readFileSync(jsonPath, "utf8"))

  console.log("[seed] started")

  // Admins (use login or email as unique key)
  const admins = seed.Admins || []
  for (const a of admins) {
    const login = a.login || a.email
    if (!login) {
      console.warn("[seed] skipping admin without login/email", a)
      continue
    }
    try {
      await prisma.user.upsert({
        where: { login },
        update: {
          name: a.name ?? undefined,
          password: a.password ?? undefined,
          role: a.role ?? undefined,
          courseId: a.courseId ?? undefined,
          groupId: a.groupId ?? undefined,
        },
        create: {
          login,
          name: a.name ?? login,
          password: a.password ?? "",
          role: a.role ?? ["ADMIN"],
          courseId: a.courseId ?? null,
          groupId: a.groupId ?? null,
        },
      })
      console.log(`[seed] admin upserted: ${login}`)
    } catch (err) {
      console.warn(`[seed] admin upsert failed (${login}):`, err.message || err)
    }
  }

  // Courses
  const courses = seed.Courses || []
  for (const c of courses) {
    try {
      await prisma.course.upsert({
        where: { identifier: c.identifier },
        update: { name: c.name },
        create: { name: c.name, identifier: c.identifier },
      })
      console.log(`[seed] course upserted: ${c.identifier}`)
    } catch (err) {
      console.warn(`[seed] course upsert failed (${c.identifier}):`, err.message || err)
    }
  }

  // Groups (link by courseIdentifier)
  const groups = seed.Groups || []
  for (const g of groups) {
    try {
      const course = await prisma.course.findUnique({ where: { identifier: g.courseIdentifier } })
      if (!course) {
        console.warn(`[seed] skipping group ${g.identifier}: course ${g.courseIdentifier} not found`)
        continue
      }
      await prisma.group.upsert({
        where: { identifier: g.identifier },
        update: { courseId: course.id },
        create: { identifier: g.identifier, courseId: course.id },
      })
      console.log(`[seed] group upserted: ${g.identifier}`)
    } catch (err) {
      console.warn(`[seed] group upsert failed (${g.identifier}):`, err.message || err)
    }
  }

  console.log("[seed] finished")
}

main()
  .catch(err => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
