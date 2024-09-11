import { User, NewUser } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
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
                    items: User,
                },
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            console.log(await CemiseService.listUsers());
            response.send(await CemiseService.listUsers());
        },
    });

    server.post("/users", {
        schema: {
            tags: ["CEMISE USERS"],
            body: NewUser,
            response: {
                200: User,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const userData: NewUser = request.body;
            const ns = await CemiseService.addUser(userData);
            return ns[0];
        },
    });
}
