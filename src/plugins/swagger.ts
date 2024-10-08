import Swagger from "@fastify/swagger";
import SwaggerUI from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function swaggerGenerator(fastify: FastifyInstance) {
    await fastify.register(Swagger, {
        openapi: {
            openapi: "3.0.0",
            info: {
                title: "Emi's Blog",
                description: "",
            },
            host: "localhost",
            schemes: ["http"],
            consumes: ["application/json"],
            produces: ["application/json"],
            components: {
                securitySchemes: {
                    CemiseAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            }
        },
        exposeRoute: fastify.config.NODE_ENV !== "production",
    });

    await fastify.register(SwaggerUI, {
        uiConfig: {
            displayRequestDuration: true,
            persistAuthorization: true,
        },
        routePrefix: "/swagger",
    });
}

export default fp(swaggerGenerator, {
    name: "swaggerGenerator",
});
