import { ErrorResponse, LoginRequest } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function authRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.post("/login", {
        schema: {
            tags: ["CEMISE USERS"],
            body: LoginRequest,
            response: {
                200: LoginRequest,
                401: ErrorResponse,
            },
        },
        handler: async (request, response) => {
            const credentials: LoginRequest = request.body;
            const user = await CemiseService.login(credentials);
            if (user) {
                const token = fastify.jwt.sign(user as User)
                return { accessToken: token };
            } else {
                return response.code(401).send({
                    message: 'auth_error',
                })
            }
        },
    });
}
