import { fastify, FastifyReply, FastifyRequest } from "fastify";
import Env from "@fastify/env";

import { databasePlugin } from "@blog/plugins/database.js";
import swagger from "@blog/plugins/swagger.js";
import { FastifyJWT, JWT, fastifyJwt } from "@fastify/jwt";
import cors from '@fastify/cors'
import { Static, Type } from "@fastify/type-provider-typebox";
import { User } from "./database/schema.js";
import { fastifyMultipart } from "@fastify/multipart";

type ConfigSchema = Static<typeof ConfigSchema>
const ConfigSchema = Type.Object({
    NODE_ENV: Type.Union([Type.Literal('dev'), Type.Literal('production'), Type.Literal('test')]),
    PORT: Type.Number(),
    JWT_SECRET: Type.String(),
    CEMISE_URL: Type.String(),
    BLOG_URL: Type.String(),
    HOST: Type.String(),
    UPLOAD_FOLDER: Type.String(),
})

declare module "fastify" {
    interface FastifyInstance {
        jwt: JWT;
        config: ConfigSchema
        auth: any
    }
}

const buildServer = async () => {
    const logger = {
        transport: {
            pipeline: [{
                target: '@blog/plugins/logger.ts',
                options: { destination: 1 }
            }]
        },
    }

    const server = fastify({ logger: true });

    server.log.info("Setting up plugins");
    await server.register(Env, { schema: ConfigSchema, dotenv: true });
    await server.register(cors, {
        origin: [server.config.BLOG_URL, server.config.CEMISE_URL]
    });
    server.register(databasePlugin);
    server.register(fastifyJwt, {
        secret: server.config.JWT_SECRET
    });
    server.decorate('auth', async (request: FastifyRequest, response: FastifyReply) => {
        const token = request.headers.authorization

        if (token) {
            const payload: Partial<User> = server.jwt.verify<FastifyJWT['user']>(token.replace("Bearer ", ""))
            request.user = payload
        } else {
            return response.code(401).send({ message: 'auth_required' })
        }
    });

    server.register(fastifyMultipart, {limits: {fileSize: 10000000}});

    if (server.config.NODE_ENV !== "production") {
        server.register(swagger);
    }

    server.log.info("Registering routes");
    await server.register(import("@blog/routes/blog/nav.js"), {});
    await server.register(import("@blog/routes/blog/posts.js"), {});
    await server.register(import("@blog/routes/blog/tag.js"), {});
    await server.register(import("@blog/routes/blog/rss.js"), {});
    await server.register(import("@blog/routes/blog/seo.js"), { prefix: "/seo" });
    await server.register(import("@blog/routes/cemise/auth.js"), { prefix: "/cemise" });
    await server.register(import("@blog/routes/cemise/image.js"), { prefix: "/cemise" });
    await server.register(import("@blog/routes/cemise/nav.js"), { prefix: "/cemise" });
    await server.register(import("@blog/routes/cemise/post.js"), { prefix: "/cemise" });
    await server.register(import("@blog/routes/cemise/tag.js"), { prefix: "/cemise" });
    await server.register(import("@blog/routes/cemise/user.js"), { prefix: "/cemise" });


    return server;
};

export { buildServer }