import { test, expect, beforeEach, beforeAll } from "bun:test";
import { database } from '@blog/plugins/database.js';
import { buildServer } from "@blog/app.js";
import { UserService } from "@blog/services/cemise/user.js";
import { userSeed } from "./seeds.js";
const supertest = require('supertest');

const server = await buildServer();
await server.ready();

beforeEach(async () => {
    const tables = Object.values(database._.tableNamesMap);
    tables.forEach(async (table) => {
        await database.delete(database._.fullSchema[table]);
    });
})

test('test auth', async () => {
    let resp: Response;
    await UserService.add(Object.assign({}, userSeed));
    await supertest(server.server)
    .post("/cemise/login")
    .send({"username": userSeed.username, "password": userSeed.password})
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(200);

    await supertest(server.server)
    .post("/cemise/login")
    .send({"username": userSeed.username, "password": "123"})
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .expect(401);
})