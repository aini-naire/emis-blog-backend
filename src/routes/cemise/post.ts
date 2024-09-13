import { CreatePostRequest, ErrorResponse, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
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
                200: PostsResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            
            const posts = await CemiseService.listPosts();
            const resp: PostsResponse = {};
            posts.forEach((post) => {
                if (!(post.id in resp)) resp[post.id] = {};
                resp[post.id][post.language] = post;
            })
            response.send(resp);
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
            const ns = await CemiseService.addPost(post, request.user);
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
            const posts = await CemiseService.getPost(postId);

            if (posts.length) {
                const resp: PostResponse = {};
                posts.forEach((post) => resp[post.language] = post);
                response.send(resp);
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
            const post = await CemiseService.updatePost(postData, postId);

            if (Object.keys(post).length) {
                response.send(post);
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
