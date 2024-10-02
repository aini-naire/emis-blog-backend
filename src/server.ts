import { buildServer } from "./app.js";

const main = async () => {

    const server = await buildServer();

    server.log.info("Listening on port " + server.config.PORT);
    await server.listen({ host: server.config.HOST, port: server.config.PORT });
}

await main();
