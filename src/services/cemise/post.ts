import { Post, postsTable, PostTag, postTagsTable, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreatePostRequest, EnumLanguage, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
import PostSerializer from "@blog/util/PostSerializer.js";
import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";


export const PostService = {
    add: async function (postData: CreatePostRequest, user: User): Promise<PostResponse | null> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Partial<Post> = postData.content[k];
                record.id = uuid;
                record.authorId = user.id;
                record.language = EnumLanguage[k];
                await tx.insert(postsTable).values(record as Post).returning();
            }

            postData.tags.map(async (tagID) => {
                for (k in postData.content) {
                    let record: PostTag = { postid: uuid, tagid: tagID, language: k };
                    await tx.insert(postTagsTable).values(record).returning();
                }
            });
        }).then(() => true);
        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<PostsResponse> {
        const posts = await database.query.postsTable.findMany({ orderBy:(post, { desc }) => [desc(post.created)], with: { author: true, postTags: { with: { tag: true } } } });
        return PostSerializer.posts(posts);
    },

    listByTag: async function (tagID: string): Promise<PostsResponse> {
        const posts = await database.query.postTagsTable.findMany({
            where: (postTag, { eq }) => eq(postTag.tagid, tagID),
            with: { post: { with: { author: true, postTags: { with: { tag: true } } } } }
        });
        return PostSerializer.posts(posts.map((post) => post.post));
    },

    get: async function (id: string): Promise<PostResponse | null> {
        const post = await database.query.postsTable.findMany({
            where: (post, { eq }) => (eq(post.id, id)),
            with: { author: true, postTags: { with: { tag: true } } }
        });
        return post.length ? PostSerializer.postItem(post) : null;
    },

    update: async function (postData: CreatePostRequest, id: string, user: User): Promise<PostResponse | null> {
        /** TODO need to handle errors */
        const updateTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Partial<Post> = postData.content[k];
                record.language = EnumLanguage[k];
                let te = await tx.update(postsTable).set(record).where(and(eq(postsTable.id, id), eq(postsTable.language, record.language))).returning();

                // language added
                if (!te.length) {
                    record.id = id;
                    record.authorId = user.id;
                    await tx.insert(postsTable).values(record as Post).returning();
                }

                const currentTags = await tx.select().from(postTagsTable).where(and(eq(postTagsTable.postid, id), eq(postTagsTable.language, EnumLanguage[k])));
                if (currentTags.length != postData.tags.length) {
                    await tx.delete(postTagsTable).where(and(eq(postTagsTable.postid, id), eq(postTagsTable.language, EnumLanguage[k])));

                    postData.tags.map(async (tagID) => {
                        let record: PostTag = { postid: id, tagid: tagID, language: k };
                        await tx.insert(postTagsTable).values(record).returning();
                    });
                }
            }
        }).then(() => true);
        return updateTx ? this.get(id) : null;
    },
}
