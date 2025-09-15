const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sickdays API",
    version: "1.0.0",
    description: "API documentation for Sickdays backend",
  },
  servers: [{ url: "http://localhost:8000/api" }],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management" },
    { name: "Tickets", description: "Ticket management" },
    { name: "Media", description: "File upload / media" },
    { name: "Prooves", description: "Prove file serving" },
    { name: "Groups", description: "Group management" },
    { name: "Course", description: "Course management" },
    { name: "Excel", description: "Excel export" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: { error: { type: "string" } },
        example: { error: "Что-то пошло не так, попробуйте позже" },
      },

      // Auth
      LoginCredentials: {
        type: "object",
        properties: { login: { type: "string" }, password: { type: "string" } },
        required: ["login", "password"],
        example: { login: "student1", password: "secret" },
      },
      TokenResponse: {
        type: "object",
        properties: { accessToken: { type: "string" }, refreshToken: { type: "string" } },
        required: ["accessToken", "refreshToken"],
      },

      // User
      UserRole: { type: "string", enum: ["ADMIN", "STUDENT", "PROFESSOR"] },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          login: { type: "string" },
          name: { type: "string" },
          role: { type: "array", items: { $ref: "#/components/schemas/UserRole" } },
          courseId: { type: "string", nullable: true },
          groupId: { type: "string", nullable: true },
        },
      },
      CreateUserPayload: {
        type: "object",
        properties: {
          login: { type: "string" },
          password: { type: "string" },
          name: { type: "string" },
          role: { type: "array", items: { $ref: "#/components/schemas/UserRole" } },
          courseId: { type: "string" },
          groupId: { type: "string" },
        },
        required: ["login", "password", "name"],
      },
      UpdateUserPayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "array", items: { $ref: "#/components/schemas/UserRole" } },
          courseId: { type: "string" },
          groupId: { type: "string" },
        },
      },

      // Pagination / list wrapper
      PaginationMeta: {
        type: "object",
        properties: { total: { type: "integer" }, page: { type: "integer" }, perPage: { type: "integer" } },
      },
      ListWithMeta: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "object" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },

      // Groups / Course
      Group: {
        type: "object",
        properties: { id: { type: "string" }, identifier: { type: "string" }, courseId: { type: "string" } },
      },
      Course: {
        type: "object",
        properties: { id: { type: "string" }, name: { type: "string" }, identifier: { type: "integer" } },
      },

      // Prove / Files
      Prove: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          path: { type: "string" },
          ticketId: { type: "string" },
        },
      },
      FileUploadResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          file: {
            type: "object",
            properties: {
              originalName: { type: "string" },
              filename: { type: "string" },
              path: { type: "string" },
              size: { type: "integer" },
              mimetype: { type: "string" },
            },
          },
        },
      },

      // Tickets
      TicketReason: { type: "string", enum: ["SICKDAY", "FAMILY", "COMPETITION"] },
      TicketStatus: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          reason: { $ref: "#/components/schemas/TicketReason" },
          status: { $ref: "#/components/schemas/TicketStatus" },
          userId: { type: "string" },
          prooves: { type: "array", items: { $ref: "#/components/schemas/Prove" } },
        },
      },
      CreateTicketPayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          reason: { $ref: "#/components/schemas/TicketReason" },
        },
        required: ["name", "startDate", "endDate", "reason"],
      },
      UpdateTicketPayload: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          reason: { $ref: "#/components/schemas/TicketReason" },
        },
      },
      ChangeStatusTicketPayload: {
        type: "object",
        properties: { status: { $ref: "#/components/schemas/TicketStatus" }, comment: { type: "string" } },
        required: ["status"],
      },

      // Excel export response hint
      ExcelExportResponse: { type: "string", format: "binary" },
    },
  },

  security: [{ bearerAuth: [] }],

  paths: {
    // Auth
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginCredentials" } } },
        },
        responses: {
          "200": {
            description: "Tokens",
            content: { "application/json": { schema: { $ref: "#/components/schemas/TokenResponse" } } },
          },
          "400": {
            description: "Bad request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (invalidate refresh cookie)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Logged out" },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    // Users
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Get users list",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "perPage", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "List of users with pagination",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: { $ref: "#/components/schemas/User" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Create user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUserPayload" } } },
        },
        responses: {
          "201": {
            description: "User created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    "/users/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Users"],
        summary: "Get user by id",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateUserPayload" } } },
        },
        responses: {
          "200": {
            description: "Updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          "400": { description: "Validation error" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        responses: { "204": { description: "Deleted" }, "404": { description: "Not found" } },
      },
    },

    // Tickets
    "/tickets": {
      get: {
        tags: ["Tickets"],
        summary: "Get ticket list",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "perPage", in: "query", schema: { type: "integer", default: 20 } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
        ],
        responses: {
          "200": {
            description: "Tickets list with meta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: { $ref: "#/components/schemas/Ticket" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tickets"],
        summary: "Create ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTicketPayload" } } },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
          "400": { description: "Validation error" },
        },
      },
    },

    "/tickets/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Tickets"],
        summary: "Get ticket by id",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Ticket",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
          "404": { description: "Not found" },
        },
      },
      put: {
        tags: ["Tickets"],
        summary: "Update ticket",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTicketPayload" } } },
        },
        responses: {
          "200": {
            description: "Updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
        },
      },
    },

    "/tickets/{id}/status": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      patch: {
        tags: ["Tickets"],
        summary: "Change ticket status (admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ChangeStatusTicketPayload" } } },
        },
        responses: {
          "200": {
            description: "Status changed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } },
          },
          "403": { description: "Forbidden" },
        },
      },
    },

    // Media / upload
    "/media/upload": {
      post: {
        tags: ["Media"],
        summary: "Upload single file",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { type: "object", properties: { file: { type: "string", format: "binary" } } },
              encoding: { file: { contentType: "image/*,application/pdf,application/octet-stream" } },
            },
          },
        },
        responses: {
          "201": {
            description: "Uploaded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/FileUploadResponse" } } },
          },
          "400": {
            description: "Bad request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    // Prooves static/protected serve
    "/prooves/{filename}": {
      parameters: [{ name: "filename", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Prooves"],
        summary: "Get prove file by filename (public or protected depending on implementation)",
        responses: {
          "200": {
            description: "File binary (image/pdf)",
            content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } },
          },
          "404": {
            description: "Not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    // Groups
    "/groups": {
      get: {
        tags: ["Groups"],
        summary: "List groups",
        responses: {
          "200": {
            description: "Groups list",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Group" } } },
            },
          },
        },
      },
    },

    // Course
    "/course": {
      get: {
        tags: ["Course"],
        summary: "List courses",
        responses: {
          "200": {
            description: "Courses list",
            content: {
              "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Course" } } },
            },
          },
        },
      },
    },

    // Excel export
    "/excel": {
      get: {
        tags: ["Excel"],
        summary: "Export tickets to excel / table (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "format", in: "query", schema: { type: "string", enum: ["xlsx", "csv"], default: "xlsx" } },
          { name: "status", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "File stream",
            content: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "400": { description: "Bad request" },
          "403": { description: "Forbidden" },
        },
      },
    },
  },
}

export default swaggerSpec
