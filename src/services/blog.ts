import { } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { and, eq } from "drizzle-orm";

export default {
    listTags: async function (): Promise<Tag[]> {
        return database.query.tag.findMany().execute();
    },

    getTag: async function (id: string): Promise<Post[]> {
        return database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) }).execute();
    },

    listPosts: async function (page: number = 1, results: number = 10): Promise<Post[]> {
        return database.query.post.findMany({
            offset: (page - 1) * results,
            limit: results,
            where: (post, { eq }) => (eq(post.hidden, false)),
            with: { author: true }
        }).execute();
    },

    getPost: async function (id: string): Promise<Post[]> {
        return database.query.post.findMany({
            where: (post, { or, eq }) => (or(eq(post.id, id), eq(post.url, id))),
            with: { author: true }
        }).execute();
    },
};
