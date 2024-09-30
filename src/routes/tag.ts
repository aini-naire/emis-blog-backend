import { ErrorResponse, PostBase, PostListResponse, Tag } from "@blog/schemas/blog.js";
import { EnumLanguage } from "@blog/schemas/cemise.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function tagRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/tag/:tagURL/:page", {
        schema: {
            tags: ["PUBLIC"],
            params: {
                type: 'object',
                properties: {
                    language: {
                        type: "string",
                        enum: Object.values(EnumLanguage)
                    },
                    page: {
                        type: "number"
                    }
                }
            },
            response: {
                200: PostListResponse,
                404: ErrorResponse,
            }
        },
        handler: async (request, response) => {
            const { tagURL, page } = request.params;
            let posts = await BlogService.listPostsByTag(tagURL, page, 5);

            if (posts) {
                const [postList, postCount] = posts;
                response.send(<PostListResponse>{ posts: postList, pages: Math.ceil(postCount / 5), page: page ? page : 1 });
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });

    server.get("/tag/:tagURL", {
        schema: {
            tags: ["PUBLIC"],
            params: {
                type: 'object',
                properties: {
                    tagURL: {
                        type: "string"
                    },
                }
            },
            response: {
                200: Tag,
                404: ErrorResponse,
            }
        },
        handler: async (request, response) => {
            const { tagURL } = request.params;
            const tag = await BlogService.getTag(tagURL);

            if (tag) {
                response.send(tag);
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });
}
