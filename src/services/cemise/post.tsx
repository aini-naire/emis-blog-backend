import { Post, post, PostTag, postTags, tag, User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreatePostRequest, CreateTagRequest, EnumLanguage, PostBase, Tag, TagResponse } from "@blog/schemas/cemise.js";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const PostService = {
    add: async function (postData: CreatePostRequest, user: User): Promise<Record<string, PostBase>> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Post = postData.content[k]
                record.id = uuid;
                record.authorId = user.id;
                record.language = EnumLanguage[k];
                let result: PostBase[] = await database.insert(post).values(record).returning()
            }

            postData.tags.map(async (tagID) => {
                for (k in postData.content) {
                    let record: PostTag = { postid: uuid, tagid: tagID, language: k };
                    await database.insert(postTags).values(record).returning()
                }
            })
            return true;
        });
        if (insertTx) return this.get(uuid);
    },

    list: async function (): Promise<Post[]> {
        return database.query.post.findMany({ with: { author: true, postTags: { with: { tag: true } } } }).execute();
    },

    listByTag: async function (tagID: string): Promise<PostTag[]> {
        return database.query.postTags.findMany({
            where: (postTag, { eq }) => eq(postTag.tagid, tagID),
            with: { post: { with: { author: true, postTags: { with: { tag: true } } } } }
        }).execute();
    },

    get: async function (id: string): Promise<Post[]> {
        return database.query.post.findMany({
            where: (post, { eq }) => (eq(post.id, id)),
            with: { author: true, postTags: { with: { tag: true } } }
        }).execute();
    },

    update: async function (postData: CreatePostRequest, id: string): Promise<Post[]> {
        /** TODO need to handle errors */
        const updateTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Partial<Post> = postData.content[k]
                console.log(record)
                //TODO tags
                let result: Post[] = await database.update(post).set(record).where(and(eq(post.id, id), eq(post.language, record.language))).returning();
            }
            return true;
        });
        if (updateTx) return this.get(id);
    },
}
