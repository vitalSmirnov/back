"use strict"

import express from "express"
import routes from "./routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
const PORT = parseInt(process.env.PORT || "8000")
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
)

app.use(express.json())

app.use(
  "/uploads",
  cors({
    origin: "http://localhost:3000",
  }),
  express.static("uploads")
)

// fix the /api middleware signature to call next()
app.use(
  "/api",
  (req, res, next) => {
    console.log(req.path)
    next()
  },
  routes
)

app.listen(PORT, "0.0.0.0", 0, () => {
  console.log(`Server running on port ${PORT}`)
})
