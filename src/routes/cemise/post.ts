import { Post, PostTag } from "@blog/database/schema.js";
import { CreatePostRequest, ErrorResponse, PostBase, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    const serializePostBase = function (post: Post) {
        let postResp: PostBase = post;
        postResp.tags = [];
        let tag: PostTag;
        post.postTags.forEach((tag) => {
            postResp.tags.push(tag.tag)
        });
        return postResp;
    }

    const serializePost = function (posts: Post[]) {
        const resp: PostResponse = {};
        posts.forEach((post) => resp[post.language] = serializePostBase(post));
        return resp;
    }
    const serializePosts = function (posts: Post[]) {
        const resp: PostsResponse = {};
        posts.forEach((post) => {
            if (!(post.id in resp)) resp[post.id] = {};
            resp[post.id][post.language] = serializePostBase(post)
        })
        return resp;
    }

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
            response.send(serializePosts(posts));
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
            response.status(201).send(serializePost(ns));
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
                response.send(serializePost(posts));
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
                response.send(serializePost(post));
            } else {
                response.status(404).send({ message: "post_not_found" });
            }
        },
    });
}
