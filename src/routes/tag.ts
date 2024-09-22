import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/tag/:tagURL/:page", {
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
            const { tagURL, page } = request.params;
            console.log(tagURL, page)
            const [ posts, postCount ] = await BlogService.listPostsByTag(tagURL, page, 5);
            response.send(<PostListResponse>{ posts: posts, pages: Math.ceil(postCount / 5 ), page: page ? page : 1 });
        },
    });
}
