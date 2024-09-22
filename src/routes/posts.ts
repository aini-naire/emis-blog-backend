import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/posts/:language/:page", {
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
                200: PostListResponse,
            }
        },
        handler: async (request, response) => {
            const { language, page } = request.params;
            const [ posts, postCount ] = await BlogService.listPosts(language, page, 5);
            response.send(<PostListResponse>{ posts: posts, pages: Math.ceil(postCount / 5 ), page: page ? page : 1 });
        },
    });

    server.get("/post/:postIdOrUrl", {
        schema: {
            tags: ["PUBLIC"],
            response: {
                200: PostBase,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postIdOrUrl } = request.params;
            const post = await BlogService.getPost(postIdOrUrl);

            if (post) {
                response.send(post);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
