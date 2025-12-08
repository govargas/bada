// backend/src/swagger.ts
import swaggerUi from "swagger-ui-express";
import { Router } from "express";

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "BADA API",
    version: "1.0.0",
    description: `
API for BADA - Find Safe Beaches in Sweden.

This API provides access to EU-classified bathing water data from the Swedish Agency for Marine and Water Management (HaV), 
along with user authentication and favorites management.

## Authentication
Protected endpoints require a JWT token in the Authorization header:
\`Authorization: Bearer <token>\`
    `,
    contact: {
      name: "BADA Project",
      url: "https://github.com/govargas/bada",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "/api",
      description: "API Base URL",
    },
  ],
  tags: [
    { name: "Health", description: "Health check endpoints" },
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Beaches", description: "Beach data from HaV API" },
    { name: "Favorites", description: "User favorites management (requires auth)" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        description: "Returns the health status of the API",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                    env: { type: "string", example: "production" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Create a new user account with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 8, example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Authenticate with email and password to receive a JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string", description: "JWT token valid for 7 days" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",
        description: "Returns the authenticated user's information",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        sub: { type: "string", description: "User ID" },
                        email: { type: "string", format: "email" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/beaches": {
      get: {
        tags: ["Beaches"],
        summary: "List all beaches",
        description: "Returns GeoJSON data for all EU-classified beaches in Sweden from HaV API",
        responses: {
          200: {
            description: "GeoJSON FeatureCollection of beaches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "GeoJSON FeatureCollection",
                },
              },
            },
          },
          500: {
            description: "Server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/beaches/{id}": {
      get: {
        tags: ["Beaches"],
        summary: "Get beach details",
        description: "Returns detailed information about a specific beach including water quality data",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Beach ID from HaV",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Beach details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BeachDetail" },
              },
            },
          },
          404: {
            description: "Beach not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List user favorites",
        description: "Returns all favorite beaches for the authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of favorites",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Favorite" },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Favorites"],
        summary: "Add a favorite",
        description: "Add a beach to the user's favorites",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["beachId"],
                properties: {
                  beachId: { type: "string", description: "Beach ID from HaV" },
                  note: { type: "string", maxLength: 500, description: "Optional note about the beach" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Favorite created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Favorite" },
              },
            },
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Beach already favorited",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/favorites/{id}": {
      delete: {
        tags: ["Favorites"],
        summary: "Remove a favorite by ID",
        description: "Remove a favorite using its MongoDB document ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Favorite document ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Favorite removed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Favorite not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/favorites/by-beach/{beachId}": {
      delete: {
        tags: ["Favorites"],
        summary: "Remove a favorite by beach ID",
        description: "Remove a favorite using the beach ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "beachId",
            in: "path",
            required: true,
            description: "Beach ID from HaV",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Favorite removed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Favorite not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/favorites/reorder": {
      patch: {
        tags: ["Favorites"],
        summary: "Reorder favorites",
        description: "Update the display order of user's favorites",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["order"],
                properties: {
                  order: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of beach IDs in desired order",
                  },
                },
              },
            },
          },
        },
        responses: {
          204: {
            description: "Order updated successfully",
          },
          400: {
            description: "Invalid request body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from /auth/login",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error code" },
          message: { type: "string", description: "Error message (development only)" },
          details: { type: "object", description: "Validation error details" },
        },
      },
      Favorite: {
        type: "object",
        properties: {
          _id: { type: "string", description: "MongoDB document ID" },
          userId: { type: "string", description: "Owner user ID" },
          beachId: { type: "string", description: "Beach ID from HaV" },
          note: { type: "string", description: "User note about the beach" },
          order: { type: "number", description: "Display order" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      BeachDetail: {
        type: "object",
        description: "Beach detail from HaV API with additional fields",
        properties: {
          id: { type: "string" },
          locationName: { type: "string", description: "Beach name" },
          locationArea: { type: "string", description: "Municipality" },
          classification: { type: "number", description: "Water quality classification (1-4)" },
          classificationText: { type: "string", description: "Classification in Swedish" },
          latestSampleDate: { type: "string", format: "date-time", nullable: true },
          algalBloom: { type: "string", nullable: true },
          latitude: { type: "number" },
          longitude: { type: "number" },
          contactMail: { type: "string", nullable: true },
          contactPhone: { type: "string", nullable: true },
          contactUrl: { type: "string", nullable: true },
        },
      },
    },
  },
};

export const swaggerRouter = Router();

swaggerRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-size: 2rem }
  `,
  customSiteTitle: "BADA API Documentation",
}));

// Also expose the raw OpenAPI spec
swaggerRouter.get("/docs/openapi.json", (_req, res) => {
  res.json(swaggerDocument);
});

