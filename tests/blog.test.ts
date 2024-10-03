import { buildServer } from '@blog/app.js'
import { database } from '@blog/plugins/database.js';
import { NavService } from '@blog/services/cemise/nav.js';
import { test, expect, beforeEach, beforeAll } from "bun:test";
import { navSeed, navSeedDisabled, postSeed, userSeed } from './seeds.js';
import { PostService } from '@blog/services/cemise/post.js';
import { UserService } from '@blog/services/cemise/user.js';
const supertest = require('supertest');

const server = await buildServer();
await server.ready();

beforeEach(async () => {
    const tables = Object.values(database._.tableNamesMap);
    tables.forEach(async (table) => {
        await database.delete(database._.fullSchema[table]);
    });
})

test('test nav', async () => {
    let resp: Response;
    await supertest(server.server)
    .get("/nav/EN")
    .expect(200, []);

    await NavService.add(navSeed);
    await NavService.add(navSeedDisabled);
    resp = await supertest(server.server)
    .get("/nav/EN")
    .expect(200);

    expect(resp.body.length).toBe(1);

    resp = await supertest(server.server)
    .get("/nav/PT")
    .expect(200);

    expect(resp.body.length).toBe(1);
});

test('test post listing', async () => {
    let resp: Response;
    resp = await supertest(server.server)
    .get("/posts/EN/1")
    .expect(200);

    expect(resp.body.page).toBe(1);
    expect(resp.body.pages).toBe(1);
    expect(resp.body.posts.length).toBe(0);


    await UserService.add(userSeed);
    await PostService.add(postSeed, userSeed);

    
    resp = await supertest(server.server)
    .get("/posts/EN/1")
    .expect(200);

    expect(resp.body.page).toBe(1);
    expect(resp.body.pages).toBe(1);
    expect(resp.body.posts.length).toBe(1);
});