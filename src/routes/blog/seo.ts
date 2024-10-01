import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import { PostListService } from "@blog/services/blog/post.js";
import { TagService } from "@blog/services/blog/tag.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

function renderHTML(title: string, desc: string) {
    return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="description" content="`+ desc + `">
    <title>emi's blog - `+ title + `</title>
  </head>
</html>`
}

export default async function seoRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

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
            }
        },
        handler: async (request, response) => {
            const { postURL } = request.params as { postURL: string };
            const post = await PostListService.getPost(postURL);

            if (post) {
                response.type("text/html")
                response.send(renderHTML(post.title, post.tagline));
            } else {
                response.status(404).send({ message: "post_not_found" });
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
            }
        },
        handler: async (request, response) => {
            const { tagURL } = request.params as { tagURL: string };
            const tag = await TagService.getTag(tagURL);

            if (tag) {
                response.type("text/html")
                response.send(renderHTML(tag.title, tag.tagline));
            } else {
                response.status(404).send({ message: "tag_not_found" });
            }
        },
    });

    server.get("/", {
        schema: {
            tags: ["PUBLIC"],
            response: {
            }
        },
        handler: async (request, response) => {
            response.type("text/html");
            response.send(renderHTML("main", "Ramblings about tech, fashion, photography, etc."));
        },
    });
}
