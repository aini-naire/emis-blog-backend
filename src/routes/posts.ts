import { ErrorResponse, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/posts", {
        schema: {
            tags: ["PUBLIC"],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer' },
                    results: { type: 'integer' }
                }
            },
            response: {
                200: PostsResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const {page, results} = request.query;
            response.send(await BlogService.listPosts(page, results));
        },
    });

    server.get("/posts/:postIdOrUrl", {
        schema: {
            tags: ["PUBLIC"],
            response: {
                200: PostResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postIdOrUrl } = request.params;
            const posts = await BlogService.getPost(postIdOrUrl);

            if (posts.length) {
                response.send(posts);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
