import { UserRole } from "@prisma/client"

export const Admins = [
  {
    email: "admin@example.com",
    password: "admin",
    name: "Admin",
    role: [UserRole.ADMIN],
  },
]

export const Courses = [
  {
    name: "1 курс Бакалавриата",
    identifier: 1,
  },
  {
    name: "2 курс Бакалавриата",
    identifier: 2,
  },
  {
    name: "3 курс Бакалавриата",
    identifier: 3,
  },
  {
    name: "4 курс Бакалавриата",
    identifier: 4,
  },
  {
    name: "1 курс Магистратуры",
    identifier: 5,
  },
  {
    name: "2 курс Магистратуры",
    identifier: 6,
  },
]

export const Groups = [
  {
    identifier: "972501",
    courseIdentifier: 1,
  },
  {
    identifier: "972502",
    courseIdentifier: 1,
  },
  {
    identifier: "972503",
    courseIdentifier: 1,
  },
  {
    identifier: "972504",
    courseIdentifier: 1,
  },
  {
    identifier: "972401",
    courseIdentifier: 2,
  },
  {
    identifier: "972402",
    courseIdentifier: 2,
  },
  {
    identifier: "972403",
    courseIdentifier: 2,
  },
  {
    identifier: "972301",
    courseIdentifier: 3,
  },
  {
    identifier: "972302",
    courseIdentifier: 3,
  },
  {
    identifier: "972303",
    courseIdentifier: 3,
  },
  {
    identifier: "972201",
    courseIdentifier: 4,
  },
  {
    identifier: "972202",
    courseIdentifier: 4,
  },
  {
    identifier: "972203",
    courseIdentifier: 4,
  },
  {
    identifier: "982501",
    courseIdentifier: 5,
  },
  {
    identifier: "982401",
    courseIdentifier: 6,
  },
]
