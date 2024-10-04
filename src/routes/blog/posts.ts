import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import { EnumLanguage, Language } from "@blog/schemas/cemise.js";
import { PostListService } from "@blog/services/blog/post.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

interface LanguagePaginator {
    language: Language;
    page: number;
}

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/posts/:language/:page", {
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
            }
        },
        handler: async (request, response) => {
            const { language, page } = request.params as LanguagePaginator;
            const [posts, postCount] = await PostListService.listPosts(language, page, 5);
            response.send({ posts: posts, pages: Math.max(1, (Math.ceil(postCount / 5))), page: page ? page : 1 } as PostListResponse);
        },
    });

    server.get("/post/:postURL", {
        schema: {
            tags: ["PUBLIC"],
            params: {
                type: 'object',
                properties: {
                    postURL: {
                        type: "string"
                    },
                }
            },
            response: {
                200: PostBase,
                404: ErrorResponse,
            }
        },
        handler: async (request, response) => {
            const { postURL } = request.params as {postURL: string};
            const post = await PostListService.getPost(postURL);

            if (post) {
                response.send(post);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
