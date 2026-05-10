const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PrimeTradeAI Internship Backend API",
      version: "1.0.0",
      description: "Simple internship assignment backend with auth, tasks, caching and Docker support.",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            password: { type: "string", example: "pass1234" },
            role: { type: "string", example: "user" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@example.com" },
            password: { type: "string", example: "admin1234" },
          },
        },
        TaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Finish assignment" },
            description: { type: "string", example: "Complete backend APIs and README" },
            completed: { type: "boolean", example: false },
          },
        },
        TaskUpdateInput: {
          type: "object",
          properties: {
            title: { type: "string", example: "Update task title" },
            description: { type: "string", example: "Update task description" },
            completed: { type: "boolean", example: true },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
