import { Error, NewPost, Post } from "@blog/schemas/cemise.js";
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

    server.get("/posts/:postId", {
        schema: {
            tags: ["CEMISE POSTS"],
            response: {
                200: {
                    type: "array",
                    items: Post,
                },
                404: Error,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postId } = request.params;
            const posts = await CemiseService.getPost(postId);
            if (posts.length) {
                response.send(posts);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }

        },
    });

    server.put("/posts/:postId", {
        schema: {
            tags: ["CEMISE POSTS"],
            body: NewPost,
            response: {
                200: {
                    type: "array",
                    items: Post,
                },
                404: Error,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postId } = request.params;
            const postData: NewPost = request.body;
            const post = await CemiseService.updatePost(postData, postId);
            if (post.length) {
                response.send(post[0]);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }

        },
    });
}
