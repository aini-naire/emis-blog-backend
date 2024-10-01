import { CreateTagRequest, ErrorResponse, PostsResponse, TagResponse, TagsResponse } from "@blog/schemas/cemise.js";
import { PostService } from "@blog/services/cemise/post.js";
import { TagService } from "@blog/services/cemise/tag.js";
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
            const tags = await TagService.list();
            response.send(tags);
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
            const addedTag = await TagService.add(tag);
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
            const { tagId } = request.params as {tagId : string};
            const tag = await TagService.get(tagId);

            if (tag) {
                response.send(tag);
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
            const { tagId } = request.params as {tagId : string};
            const tagData: CreateTagRequest = request.body;
            const tag = await TagService.update(tagData, tagId);

            if (tag) {
                response.send(tag);
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });

    server.get("/tags/:tagId/posts", {
        schema: {
            tags: ["CEMISE TAGS"],
            response: {
                200: PostsResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { tagId } = request.params as {tagId : string};
            const posts = await PostService.listByTag(tagId);
            
            response.send(posts);
        },
    });
}
