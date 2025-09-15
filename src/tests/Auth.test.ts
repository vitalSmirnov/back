// tests/userController.test.ts
import { describe, it } from "node:test"
import request from "supertest"
import { app } from "../index"

describe("User Controller", () => {
  it("GET /users should return a list of users", async () => {
    const response = await request(app).get("/api/users")
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
})
