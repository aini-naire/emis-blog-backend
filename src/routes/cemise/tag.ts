import type { FastifyInstance } from "fastify";

export default async function tagRoutes(fastify: FastifyInstance) {
  fastify.get("/tags", async (request, response) => {});
}
