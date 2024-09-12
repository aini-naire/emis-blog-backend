import { CreateTagRequest, ErrorResponse, TagResponse, TagsResponse } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function tagRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    fastify.get("/tags", {
        schema: {
            tags: ["CEMISE TAGS"],
            response: { 200: TagsResponse },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const tags = await CemiseService.listTags();
            const resp: TagsResponse = {};
            tags.forEach((tag) => {
                if (!(tag.id in resp)) resp[tag.id] = {};
                resp[tag.id][tag.language] = tag;
            })
            response.send(resp);
        },
    });

    server.post("/tags", {
        schema: {
            tags: ["CEMISE TAGS"],
            body: CreateTagRequest,
            response: {
                201: TagResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const tag: CreateTagRequest = request.body;
            const addedTag = await CemiseService.addTag(tag, request.user);
            response.status(201).send(addedTag);
        },
    });

    server.get("/tags/:tagId", {
        schema: {
            tags: ["CEMISE TAGS"],
            response: {
                200: TagResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { tagId } = request.params;
            const tags = await CemiseService.getTag(tagId);

            if (tags.length) {
                const resp: TagResponse = {};
                tags.forEach((tag) => {
                    resp[tag.language] = tag;
                })
                response.send(resp);
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });

    server.put("/tags/:tagId", {
        schema: {
            tags: ["CEMISE TAGS"],
            body: CreateTagRequest,
            response: {
                200: TagResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { tagId } = request.params;
            const tagData: CreateTagRequest = request.body;
            const tag = await CemiseService.updateTag(tagData, tagId);

            if (Object.keys(tag).length) {
                response.send(tag);
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });
}
