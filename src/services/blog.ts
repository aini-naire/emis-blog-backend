import { nav, post, Post, postTags, tag, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { PostBase } from "@blog/schemas/blog.js";
import { Language, Tag } from "@blog/schemas/cemise.js";
import { and, asc, count, desc, eq } from "drizzle-orm";

export default {
    listTags: async function (): Promise<Tag[]> {
        return database.query.tag.findMany();
    },

    getTag: async function (url: string): Promise<Tag | null> {
        const tag = await database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.url, url)) });
        if (tag.length) return tag[0]
        return null
    },

    listPosts: async function (language: Language, page: number = 1, results: number = 10) {
        const postsQuery = database.query.post.findMany({
            columns: {
                content: false
            },
            offset: (page - 1) * results,
            limit: results,
            orderBy: desc(post.created),
            where: (post, { eq, and }) => and(eq(post.hidden, false), eq(post.page, false), eq(post.language, language)),
            with: { author: true }
        });
        const countQuery = database.select({ posts: count() }).from(post).where(and(eq(post.hidden, false), eq(post.page, false), eq(post.language, language)));
        const [posts, postCount] = await Promise.all([postsQuery, countQuery])
        return [posts, postCount[0].posts];
    },

    listPostsByTag: async function (tagURL: string, page: number = 1, results: number = 10) {
        const selectedTag = await this.getTag(tagURL);
        if (!selectedTag) return null;
        
        const postsQuery = await database.select({
            id: post.id,
            language: post.language,
            created: post.created,
            url: post.url,
            title: post.title,
            tagline: post.tagline,
            author: { fullName: users.fullName }
        })
            .from(postTags)
            .innerJoin(post, eq(postTags.postid, post.id))
            .innerJoin(users, eq(post.authorId, users.id))
            .where(and(eq(postTags.tagid, selectedTag.id), eq(postTags.language, selectedTag.language), eq(post.hidden, 0), eq(post.page, 0), eq(post.private, 0)))
            .offset((page - 1) * results)
            .limit(results)
            .orderBy(desc(post.created));

        const countQuery = database.select({ posts: count() })
            .from(postTags)
            .innerJoin(post, eq(postTags.postid, post.id))
            .where(and(eq(postTags.tagid, selectedTag.id), eq(postTags.language, selectedTag.language), eq(post.hidden, 0), eq(post.page, 0), eq(post.private, 0)));
        
        const [posts, postCount] = await Promise.all([postsQuery, countQuery]);
        return [posts, postCount[0].posts];
    },

    getNav: async function (language: Language) {
        const navs = await database.select().from(nav).where(and(eq(nav.enabled, true), eq(nav.language, language))).orderBy(asc(nav.order));
        return navs;
    },

    getPost: async function (id: string): Promise<PostBase | null> {
        const post = await database.query.post.findMany({
            where: (post, { or, eq }) => (or(eq(post.id, id), eq(post.url, id))),
            with: { author: true }
        });
        return post.length ? post[0] : null;
    },
};
