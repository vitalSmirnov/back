import express from "express"
import routes from "./routes.js"
import cookieParser from "cookie-parser"

import cors from "cors"

const app = express()
const PORT = process.env.PORT || 8000
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
app.use("/api", routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
