import swaggerJsdoc, { Options } from 'swagger-jsdoc';

// Define the root documentation options using the OpenAPI Specification (OAS) 3.0
const options: Options = {
    definition: {
        openapi: '3.0.0', // Specify the OpenAPI version
        info: {
            title: 'EduMate API Documentation',
            version: '1.0.0',
            description: 'Interactive documentation for all EduMate backend services, covering Authentication, Messaging, Sessions, and Administration.',
            contact: {
                name: 'EduMate Support',
                url: 'https://www.edumate.io/support',
            },
        },
        // Reusable components like security schemes
        components: {
            securitySchemes: {
                // Define the security method used for protected routes (JWT Bearer Token)
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        // Apply Bearer Auth as a default requirement for ALL endpoints unless overridden
        security: [{
            bearerAuth: [],
        }],
        // Define the server URL(s)
        servers: [
            {
                // This is your live Azure backend URL, assuming your API base path is '/api'.
                url: 'https://edumate-api-group-bsgkdyffhja8dwcb.southafricanorth-01.azurewebsites.net/api', 
                description: 'Azure Production Server',
            },
            {
                // Standard local development URL for Express apps
                url: 'http://localhost:3000/api', 
                description: 'Local Development Server',
            },
        ],
    },
    // **CRUCIAL:** Glob pattern to find the JSDoc comments in your route files.
    apis: ['./src/routes/*.ts'], 
};

export const swaggerSpec = swaggerJsdoc(options);