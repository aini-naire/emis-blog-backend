import { CreateNavRequest, ErrorResponse, NavResponse, NavsResponse } from "@blog/schemas/cemise.js";
import { NavService } from "@blog/services/cemise/nav.js";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyInstance } from "fastify";

export default async function navRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<TypeBoxTypeProvider>();
    server.addHook("onRequest", server.auth);

    fastify.get("/nav", {
        schema: {
            tags: ["CEMISE NAV"],
            response: { 200: NavsResponse },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const navs = await NavService.list();
            response.send(navs);
        },
    });

    server.post("/nav", {
        schema: {
            tags: ["CEMISE NAV"],
            body: CreateNavRequest,
            response: {
                201: NavResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const nav: CreateNavRequest = request.body;
            const addedNav = await NavService.add(nav, request.user);
            response.status(201).send(addedNav);
        },
    });

    server.get("/nav/:navId", {
        schema: {
            tags: ["CEMISE NAV"],
            response: {
                200: NavResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { navId } = request.params;
            const nav = await NavService.get(navId);

            if (nav) {
                response.send(nav);
            } else {
                response.status(404).send({ message: "nav_not_found" });
            }
        },
    });

    server.put("/nav/:navId", {
        schema: {
            tags: ["CEMISE NAV"],
            body: CreateNavRequest,
            response: {
                200: NavResponse,
                404: ErrorResponse,
            },
            security: [{ "CemiseAuth": [] }]
        },
        handler: async (request, response) => {
            const { navId } = request.params;
            const navData: CreateNavRequest = request.body;
            const nav = await NavService.update(navData, navId);

            //TODO error handling
            if (nav) {
                response.send(nav);
            } else {
                response.status(404).send({ message: "nav_not_found" });
            }
        },
    });
}
