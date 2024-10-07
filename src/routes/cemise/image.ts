import { CreateNavRequest, ImagesResponse, NavResponse } from "@blog/schemas/cemise.js";
import { ImageService } from "@blog/services/cemise/image.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function navRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    fastify.get("/images", {
        schema: {
            tags: ["CEMISE IMAGE"],
            consumes: ['multipart/form-data'],
            response: { 200: ImagesResponse },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const imgs = await ImageService.list();
            response.send(imgs);
        },
    });

    server.post("/images", {
        schema: {
            tags: ["CEMISE IMAGE"],
            consumes: ['multipart/form-data'],body: {
                type: "array",
                required: ["myField"],
                properties: {
                  myField: { type: "array", items: {type: "string", format: "binary"} },
                },
              },
            response: {
                201: NavResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const parts = request.files();
            for await (const part of parts) {
                const upl = await ImageService.add(part, "POST");
                console.log(upl)
            }
            response.send();
        },
    });
}
