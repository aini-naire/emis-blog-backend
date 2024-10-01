import { CreateUserRequest, UserResponse } from "@blog/schemas/cemise.js";
import { UserService } from "@blog/services/cemise/user.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function userRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth)

    server.get("/users", {
        schema: {
            tags: ["CEMISE USERS"],
            response: {
                200: {
                    type: "array",
                    items: UserResponse,
                },
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            response.send(await UserService.list());
        },
    });

    server.get("/users/me", {
        schema: {
            tags: ["CEMISE USERS"],
            response: {
                200: UserResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            response.send(<UserResponse>request.user);
        },
    });

    server.post("/users", {
        schema: {
            tags: ["CEMISE USERS"],
            body: CreateUserRequest,
            response: {
                200: UserResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const userData: CreateUserRequest = request.body;
            const ns = await UserService.add(userData);
            return ns[0];
        },
    });
}
