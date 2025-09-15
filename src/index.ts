"use strict"

import express from "express"
import routes from "./routes.js"
import cookieParser from "cookie-parser"
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./swagger.js"
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

app.use(
  "/api",
  (req, res, next) => {
    console.log(req.path)
    next()
  },
  routes
)

// Swagger UI setup, default route is localhost:8000/api/documentation
app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(PORT, "0.0.0.0", 0, () => {
  console.log(`Server running on port ${PORT}`)
})
