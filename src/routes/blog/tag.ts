import { ErrorResponse, PostBase, PostListResponse, Tag } from "@blog/schemas/blog.js";
import { EnumLanguage } from "@blog/schemas/cemise.js";
import { PostListService } from "@blog/services/blog/post.js";
import { TagService } from "@blog/services/blog/tag.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

interface TagPaginator {
    tagURL: string;
    page: number;
}

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
            const { tagURL, page } = request.params as TagPaginator;
            let posts = await PostListService.listPostsByTag(tagURL, page, 5);

            if (posts) {
                const [postList, postCount] = posts;
                response.send({ posts: postList, pages: Math.ceil(postCount / 5), page: page ? page : 1 } as PostListResponse);
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
            const { tagURL } = request.params as { tagURL: string };
            const tag = await TagService.getTag(tagURL);

            if (tag) {
                response.send(tag);
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });
}
