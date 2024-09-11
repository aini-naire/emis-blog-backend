import { User, NewUser, UserCredentials, Error, UserAccessToken } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function authRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.post("/login", {
        schema: {
            tags: ["CEMISE USERS"],
            body: UserCredentials,
            response: {
                200: UserAccessToken,
                401: Error,
            },
        },
        handler: async (request, response) => {
            const credentials: UserCredentials = request.body;
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
