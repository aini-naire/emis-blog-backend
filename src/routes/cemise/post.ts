import {  } from "@blog/database/schema.js";
import { NewPost, Post } from "@blog/schemas/cemise.js";
import CemiseService from "@blog/services/cemise.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function postRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  server.get("/posts", {
    schema: {
      tags: ["CEMISE POSTS"],
      response: {
        200: {
          type: "array",
          items: Post,
        },
      },
    },
    handler: async (request, response) => {
      console.log( await CemiseService.listPosts());
      response.send(await CemiseService.listPosts());
    },
  });

  server.post("/post", {
    schema: {
      tags: ["CEMISE POSTS"],
      body: NewPost,
      response: {
        200: Post,
      },
    },
    handler: async (request, response) => {
      const post: NewPost = request.body;
      const ns = await CemiseService.addPost(post);
      return ns[0];
    },
  });
}
