import { nav, post, Post, postTags, tag, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { LanguageLink, PostBase, TagLink } from "@blog/schemas/blog.js";
import { Language, Tag } from "@blog/schemas/cemise.js";
import { aliasedTable, and, asc, count, desc, eq, not } from "drizzle-orm";

function postQueryReducer(posts) {
    return Object.values(posts.reduce((arr, row) => {
        const post = row.post;
        const tag = row.tags;

        if (!arr[post.id]) {
            arr[post.id] = { ...post, tags: [] }
        }

        if (tag) {
            arr[post.id].tags.push(tag)
        }

        return arr;
    }, [])).sort((a, b) => new Date(b.created) - new Date(a.created));
}

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
        const postsQuery = database.select({
            id: post.id,
            language: post.language,
            created: post.created,
            url: post.url,
            title: post.title,
            tagline: post.tagline,
            showAuthor: post.showAuthor,
            author: { fullName: users.fullName }
        })
            .from(post)
            .fullJoin(users, eq(post.authorId, users.id))
            .where(and(eq(post.language, language), eq(post.hidden, false), eq(post.page, false), eq(post.private, false)))
            .offset((page - 1) * results)
            .limit(results)
            .orderBy(desc(post.created)).as("post");

        const tagsQuery = database.select()
            .from(postTags)
            .rightJoin(postsQuery, and(eq(postTags.postid, postsQuery.id), eq(postTags.language, language)))
            .leftJoin(tag, and(eq(postTags.tagid, tag.id), eq(tag.language, language)));

        const countQuery = database.select({ posts: count() }).from(post).where(and(eq(post.language, language), eq(post.hidden, false), eq(post.page, false), eq(post.private, false)));
        const [posts, postCount] = await Promise.all([tagsQuery, countQuery]);
        return [postQueryReducer(posts), postCount[0].posts];
    },

    listPostsByTag: async function (tagURL: string, page: number = 1, results: number = 10) {
        const selectedTag = await this.getTag(tagURL);
        if (!selectedTag) return null;

        const postsQuery = database.select({
            id: post.id,
            language: post.language,
            created: post.created,
            showAuthor: post.showAuthor,
            url: post.url,
            title: post.title,
            tagline: post.tagline,
            author: { fullName: users.fullName }
        })
            .from(postTags)
            .innerJoin(post, and(eq(postTags.postid, post.id), eq(postTags.language, post.language)))
            .innerJoin(users, eq(post.authorId, users.id))
            .where(and(eq(postTags.tagid, selectedTag.id), eq(postTags.language, selectedTag.language), eq(post.hidden, false), eq(post.page, false), eq(post.private, false)))
            .offset((page - 1) * results)
            .limit(results)
            .orderBy(desc(post.created)).as("post");

        const tagsQuery = database.select()
            .from(postTags)
            .rightJoin(postsQuery, and(eq(postTags.postid, postsQuery.id), eq(postTags.language, selectedTag.language)))
            .leftJoin(tag, and(eq(postTags.tagid, tag.id), eq(tag.language, selectedTag.language)));

        const countQuery = database.select({ posts: count() })
            .from(postTags)
            .innerJoin(post, and(eq(postTags.postid, post.id), eq(postTags.language, post.language)))
            .where(and(eq(postTags.tagid, selectedTag.id), eq(postTags.language, selectedTag.language), eq(post.hidden, false), eq(post.page, false), eq(post.private, false)));

        const [posts, postCount] = await Promise.all([tagsQuery, countQuery]);
        return [postQueryReducer(posts), postCount[0].posts];
    },

    getNav: async function (language: Language) {
        const navs = await database.select().from(nav).where(and(eq(nav.enabled, true), eq(nav.language, language))).orderBy(asc(nav.order));
        return navs;
    },

    getPost: async function (url: string): Promise<PostBase | null> {
        const postQuery = await database.query.post.findMany({
            where: (post, { eq, and }) => (and(eq(post.url, url), eq(post.private, false))),
            with: { author: true }
        });


        if (postQuery.length) {
            const postObj = <PostBase>postQuery[0];
            const postID = postQuery[0].id;

            const langQuery = database.select({ language: post.language, url: post.url }).from(post).where(and(eq(post.id, postID), eq(post.private, false), eq(post.hidden, false), not(eq(post.language, postObj.language))))
            const tagsQuery = database.select({ title: tag.title, url: tag.url }).from(postTags)
                .where(and(eq(postTags.postid, postID), eq(postTags.language, postObj.language)))
                .fullJoin(tag, and(eq(postTags.tagid, tag.id), eq(postTags.language, tag.language)));
            const [lang, tags]: [LanguageLink[], TagLink[]] = await Promise.all([langQuery, tagsQuery]);
            postObj.languages = lang;
            postObj.tags = tags;
            return postObj;
        }
        return null;
    },
};
