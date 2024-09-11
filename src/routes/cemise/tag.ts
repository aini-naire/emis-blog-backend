import { Tag } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function tagRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    fastify.get("/tags", {
        schema: {
            tags: ["CEMISE TAGS"],
            response: {
                200: {
                    type: "array",
                    items: Tag,
                },
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            console.log(await CemiseService.listTags());
            response.send(await CemiseService.listTags());
        },
    });
    server.post("/tags", {
        schema: {
            tags: ["CEMISE TAGS"],
            body: Tag,
            response: {
                201: Tag,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const tag: Tag = request.body;
            const addedTag = await CemiseService.addTag(tag, request.user);
            console.log(addedTag)
            response.status(201).send(addedTag[0]);
        },
    });
}
