import { ErrorResponse, PostBase, PostListResponse } from "@blog/schemas/blog.js";
import BlogService from "@blog/services/blog.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

    server.get("/post/:postURL", {
        schema: {
            tags: ["PUBLIC"],
            response: {
            }
        },
        handler: async (request, response) => {
            const { postURL } = request.params;
            const post = await BlogService.getPost(postURL);

            if (post) {
                response.type("text/html")
                response.send(`<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="description" content="`+ post.tagline + `">
    <title>emi's blog - `+ post.title + `</title>
  </head>
</html>`);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
