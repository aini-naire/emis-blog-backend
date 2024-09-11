import { NewPost, Post } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    server.get("/posts", {
        schema: {
            tags: ["CEMISE POSTS"],
            response: {
                200: {
                    type: "array",
                    items: Post,
                },
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            console.log(await CemiseService.listPosts());
            response.send(await CemiseService.listPosts());
        },
    });

    server.post("/posts", {
        schema: {
            tags: ["CEMISE POSTS"],
            body: NewPost,
            response: {
                201: Post,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const post: NewPost = request.body;
            const ns = await CemiseService.addPost(post, request.user);
            console.log(ns)
            response.status(201).send(ns[0]);
        },
    });
}
