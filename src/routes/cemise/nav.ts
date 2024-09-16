import { CreateNavRequest, CreateTagRequest, ErrorResponse, NavResponse, NavsResponse, PostsResponse, TagResponse, TagsResponse } from "@blog/schemas/cemise.js";
import { NavService } from "@blog/services/cemise/nav.js";
import { PostService } from "@blog/services/cemise/post.js";
import { TagService } from "@blog/services/cemise/tag.js";
import { serializePosts } from "@blog/util/post.js";
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
            const resp: NavsResponse = {};
            navs.forEach((nav) => {
                if (!(nav.id in resp)) resp[nav.id] = {};
                resp[nav.id][nav.language] = nav;
            })
            response.send(resp);
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
            const navs = await NavService.get(navId);

            if (navs.length) {
                const resp: NavResponse = {};
                navs.forEach((nav) => {
                    resp[nav.language] = nav;
                })
                response.send(resp);
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
            console.log(navData)
            const nav = await NavService.update(navData, navId);

            if (Object.keys(nav).length) {
                response.send(nav);
            } else {
                response.status(404).send({ message: "nav_not_found" });
            }
        },
    });
}
