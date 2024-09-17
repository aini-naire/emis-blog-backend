import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/posts/:language", {
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
            const { language } = request.params;
            const { page, results } = request.query;
            console.log(BlogService.listPosts(language, page, results))
            await Promise.all(BlogService.listPosts(language, page, results)).then(([posts, count]) => {
                response.send(<PostListResponse>{ posts: posts, pages: Math.ceil(count[0].posts / (results ? results : 10) ), page: page ? page : 1 });
            })
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
            const posts = await BlogService.getPost(postIdOrUrl);

            if (posts.length) {
                response.send(posts[0]);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
