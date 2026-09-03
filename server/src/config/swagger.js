import swaggerJsdoc from "swagger-jsdoc";
import config from "../config/index.js";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TaskFlow Organization Management API",
      version: "1.0.0",
      description:
        "Enterprise Multi-Tenant SaaS Task Management — Organization Management backend (Company, Department, User, Role, Subscription).",
      contact: { name: "TaskFlow API Support", email: "support@taskflow.com" },
    },
    servers: [
      { url: "/api/v1", description: "Default API Server" },
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
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
            meta: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" },
                hasNextPage: { type: "boolean" },
                hasPrevPage: { type: "boolean" },
              },
            },
          },
        },
        Company: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            companyName: { type: "string" },
            companyCode: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            website: { type: "string" },
            address: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            postalCode: { type: "string" },
            industry: { type: "string" },
            logo: { type: "string" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Department: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            departmentName: { type: "string" },
            departmentCode: { type: "string" },
            description: { type: "string" },
            status: { type: "string" },
            companyId: { type: "string", format: "uuid" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            employeeId: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            designation: { type: "string" },
            status: { type: "string" },
            companyId: { type: "string", format: "uuid" },
            departmentId: { type: "string", format: "uuid" },
            roleId: { type: "string", format: "uuid" },
          },
        },
        Role: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", enum: ["SUPER_ADMIN", "MAIN_ADMIN", "SUB_ADMIN", "EMPLOYEE"] },
            description: { type: "string" },
            status: { type: "string" },
          },
        },
        SubscriptionPlan: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            planName: { type: "string" },
            description: { type: "string" },
            monthlyPrice: { type: "number" },
            yearlyPrice: { type: "number" },
            duration: { type: "string" },
            maxEmployees: { type: "integer" },
            maxDepartments: { type: "integer" },
            maxActiveTasks: { type: "integer" },
            features: { type: "array", items: { type: "string" } },
            status: { type: "string" },
          },
        },
        CompanySubscription: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            companyId: { type: "string", format: "uuid" },
            subscriptionPlanId: { type: "string", format: "uuid" },
            startDate: { type: "string", format: "date-time" },
            expiryDate: { type: "string", format: "date-time" },
            subscriptionStatus: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
