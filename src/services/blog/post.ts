import { Post, postsTable, postTagsTable, Tag, tagsTable, usersTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { LanguageLink, TagLink, PostBase } from "@blog/schemas/blog.js";
import { Language } from "@blog/schemas/cemise.js";
import { and, count, desc, eq, not } from "drizzle-orm";
import { TagService } from "./tag.js";


const postSelect = {
    id: postsTable.id,
    language: postsTable.language,
    created: postsTable.created,
    url: postsTable.url,
    title: postsTable.title,
    tagline: postsTable.tagline,
    showAuthor: postsTable.showAuthor,
    author: { fullName: usersTable.fullName }
}

function postQueryReducer(posts: any): PostBase[] {
    return Object.values(posts.reduce((arr: Record<string, PostBase>, row: {post: Post, tags: Tag}) => {
        const post = row.post;
        const tag = row.tags;

        if (!arr[post.id]) {
            arr[post.id] = { ...post, tags: [] };
        }

        if (tag) {
            arr[post.id].tags.push(tag);
        }

        return arr;
    }, [])).sort((a, b) => new Date(b.created) - new Date(a.created));
}

const PostListService = {
    listPosts: async function (language: Language, page: number = 1, results: number = 10): Promise<[PostBase[], number]> {
        const postsQuery = database.select(postSelect)
            .from(postsTable)
            .fullJoin(usersTable, eq(postsTable.authorId, usersTable.id))
            .where(and(eq(postsTable.language, language), eq(postsTable.hidden, false), eq(postsTable.page, false), eq(postsTable.private, false)))
            .offset((page - 1) * results)
            .limit(results)
            .orderBy(desc(postsTable.created)).as("post");

        const tagsQuery = database.select()
            .from(postTagsTable)
            .rightJoin(postsQuery, and(eq(postTagsTable.postid, postsQuery.id), eq(postTagsTable.language, language)))
            .leftJoin(tagsTable, and(eq(postTagsTable.tagid, tagsTable.id), eq(tagsTable.language, language)));

        const countQuery = database.select({ posts: count() }).from(postsTable).where(and(eq(postsTable.language, language), eq(postsTable.hidden, false), eq(postsTable.page, false), eq(postsTable.private, false)));
        const [posts, postCount] = await Promise.all([tagsQuery, countQuery]);
        return [postQueryReducer(posts), postCount[0].posts];
    },

    listPostsByTag: async function (tagURL: string, page: number = 1, results: number = 10): Promise<[PostBase[], number]>  {
        const selectedTag = await TagService.getTag(tagURL);
        if (!selectedTag) return null;

        const postsQuery = database.select(postSelect)
            .from(postTagsTable)
            .innerJoin(postsTable, and(eq(postTagsTable.postid, postsTable.id), eq(postTagsTable.language, postsTable.language)))
            .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
            .where(and(eq(postTagsTable.tagid, selectedTag.id), eq(postTagsTable.language, selectedTag.language), eq(postsTable.hidden, false), eq(postsTable.page, false), eq(postsTable.private, false)))
            .offset((page - 1) * results)
            .limit(results)
            .orderBy(desc(postsTable.created)).as("post");

        const tagsQuery = database.select()
            .from(postTagsTable)
            .rightJoin(postsQuery, and(eq(postTagsTable.postid, postsQuery.id), eq(postTagsTable.language, selectedTag.language)))
            .leftJoin(tagsTable, and(eq(postTagsTable.tagid, tagsTable.id), eq(tagsTable.language, selectedTag.language)));

        const countQuery = database.select({ posts: count() })
            .from(postTagsTable)
            .innerJoin(postsTable, and(eq(postTagsTable.postid, postsTable.id), eq(postTagsTable.language, selectedTag.language)))
            .where(and(eq(postTagsTable.tagid, selectedTag.id), eq(postTagsTable.language, selectedTag.language), eq(postsTable.hidden, false), eq(postsTable.page, false), eq(postsTable.private, false)));

        const [posts, postCount] = await Promise.all([tagsQuery, countQuery]);
        return [postQueryReducer(posts), postCount[0].posts];
    },

     getPost: async function (url: string): Promise<PostBase | null> {
        const postQuery = await database.query.postsTable.findMany({
            where: (post, { eq, and }) => (and(eq(post.url, url), eq(post.private, false))),
            with: { author: true }
        });
    
    
        if (postQuery.length) {
            const postObj = postQuery[0] as Partial<PostBase>;
            const postID = postQuery[0].id;
    
            const langQuery = database.select({ language: postsTable.language, url: postsTable.url }).from(postsTable).where(and(eq(postsTable.id, postID), eq(postsTable.private, false), eq(postsTable.hidden, false), not(eq(postsTable.language, postObj.language))))
            const tagsQuery = database.select({ title: tagsTable.title, url: tagsTable.url }).from(postTagsTable)
                .where(and(eq(postTagsTable.postid, postID), eq(postTagsTable.language, postObj.language)))
                .fullJoin(tagsTable, and(eq(postTagsTable.tagid, tagsTable.id), eq(postTagsTable.language, tagsTable.language)));
                
            const [lang, tags]: [LanguageLink[], TagLink[]] = await Promise.all([langQuery, tagsQuery]);
            postObj.languages = lang;
            postObj.tags = tags;
            return postObj as PostBase;
        }
        return null;
    }
}

export { PostListService }