import { ErrorResponse, PostBase, PostListResponse, NavResponse } from "@blog/schemas/blog.js";
import { EnumLanguage, Language } from "@blog/schemas/cemise.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function navRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/nav/:language", {
        schema: {
            tags: ["PUBLIC"],
            params: {
                type: 'object',
                properties: {
                    language: {
                        type: "string",
                        enum: Object.values(EnumLanguage)
                    }
                }
            },
            response: {
                200: NavResponse,
            }
        },
        handler: async (request, response) => {
            const { language } = request.params;
            response.send(await BlogService.getNav(language))
        },
    });
}
