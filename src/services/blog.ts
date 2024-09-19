import { nav, post, Post } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { PostBase } from "@blog/schemas/blog.js";
import { Language, Tag } from "@blog/schemas/cemise.js";
import { and, asc, count, eq } from "drizzle-orm";

export default {
    listTags: async function (): Promise<Tag[]> {
        return database.query.tag.findMany();
    },

    getTag: async function (id: string): Promise<Post[]> {
        return database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) });
    },

    listPosts: async function (language: Language, page: number = 1, results: number = 10) {
        const postsQuery = database.query.post.findMany({
            columns: {
                content: false
            },
            offset: (page - 1) * results,
            limit: results,
            where: (post, { eq, and }) => and(eq(post.hidden, false), eq(post.language, language)),
            with: { author: true }
        });
        const countQuery = database.select({posts: count()}).from(post).where(and(eq(post.hidden, false), eq(post.language, language)));
        const [posts, postCount] = await Promise.all([postsQuery, countQuery])
        return [posts, postCount[0].posts];
    },

    getNav: async function (language: Language) {
        const navs = await database.select().from(nav).where(and(eq(nav.enabled, true), eq(nav.language, language))).orderBy(asc(nav.order));
        return navs;
    },

    getPost: async function (id: string): Promise<PostBase|null> {
        const post = await database.query.post.findMany({
            where: (post, { or, eq }) => (or(eq(post.id, id), eq(post.url, id))),
            with: { author: true }
        });
        return post.length ? post[0] : null;
    },
};
