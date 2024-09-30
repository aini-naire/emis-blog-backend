import { CreatePostRequest, ErrorResponse, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
import { PostService } from "@blog/services/cemise/post.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";


export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    server.get("/posts", {
        schema: {
            tags: ["CEMISE POSTS"],
            response: {
                200: PostsResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const posts = await PostService.list();
            response.send(posts);
        },
    });

    server.post("/posts", {
        schema: {
            tags: ["CEMISE POSTS"],
            body: CreatePostRequest,
            response: {
                201: PostResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const post: CreatePostRequest = request.body;
            const ns = await PostService.add(post, request.user);
            response.status(201).send(ns);
        },
    });

    server.get("/posts/:postId", {
        schema: {
            tags: ["CEMISE POSTS"],
            response: {
                200: PostResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postId } = request.params;
            const posts = await PostService.get(postId);

            if (posts) {
                response.send(posts);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });

    server.put("/posts/:postId", {
        schema: {
            tags: ["CEMISE POSTS"],
            body: CreatePostRequest,
            response: {
                200: PostResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { postId } = request.params;
            const postData: CreatePostRequest = request.body;
            const post = await PostService.update(postData, postId, request.user);

            if (post) {
                response.send(post);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
