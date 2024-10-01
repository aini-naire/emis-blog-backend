import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import { EnumLanguage, Language } from "@blog/schemas/cemise.js";
import { PostListService } from "@blog/services/blog/post.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";
import RSS from "rss";

const options = {
    title: "emi's blog",
    feed_url: "https://blog.emicaval.tech/rss/",
    site_url: "https://blog.emicaval.tech",
}

export default async function RSSRoute(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/rss/:language", {
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
            }
        },
        handler: async (request, response) => {
            const { language } = request.params as {language: Language};
            const [posts, postCount] = await PostListService.listPosts(language, 1, 20);
            const feed = new RSS(options);
            posts.forEach((post) => {
                feed.item({
                    title: post.title,
                    description: post.tagline,
                    url: "https://blog.emicaval.tech/post/" + post.url,
                    date: post.created
                })
            });
            response.type("application/xml");
            response.send(feed.xml({ indent: true }));
        },
    });
}
