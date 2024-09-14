import { Post, post, PostTag, postTags, tag, User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreatePostRequest, CreateTagRequest, EnumLanguage, PostBase, Tag, TagResponse } from "@blog/schemas/cemise.js";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export default {
    addTag: async function (tagData: CreateTagRequest, user: User): Promise<Record<string, Tag>> {
        const uuid = randomUUID();

        return database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            let response: Record<string, Tag> = {};
            for (k in tagData) {
                let record: Tag = tagData[k]
                record.id = uuid;
                record.language = EnumLanguage[k];
                let result: Tag[] = await database.insert(tag).values(record).returning()
                response[k] = result[0];
            }
            return response;
        });
    },

    listTags: async function (): Promise<Tag[]> {
        return database.query.tag.findMany().execute();
    },

    getTag: async function (id: string): Promise<Tag[]> {
        return database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) }).execute();
    },

    updateTag: async function (tagData: CreateTagRequest, id: string): Promise<Record<string, Tag>> {
        return database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            let response: Record<string, Tag> = {};
            for (k in tagData) {
                let record: Partial<Tag> = tagData[k]
                let result: Tag[] = await database.update(tag).set(record).where(and(eq(tag.id, id), eq(tag.language, record.language))).returning();
                response[k] = result[0];
            }
            return response;
        });
        return database.update(tag).set(tagData).where(and(eq(tag.id, id), eq(tag.language, tagData.language))).returning();
    },

    addPost: async function (postData: CreatePostRequest, user: User): Promise<Record<string, PostBase>> {
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
        if (insertTx) return this.getPost(uuid);
    },

    listPosts: async function (): Promise<Post[]> {
        return database.query.post.findMany({ with: { author: true, postTags: { with: { tag: true } } } }).execute();
    },

    getPost: async function (id: string): Promise<Post[]> {
        return database.query.post.findMany({
            where: (post, { eq }) => (eq(post.id, id)),
            with: { author: true, postTags: { with: { tag: true } } }
        }).execute();
    },

    updatePost: async function (postData: CreatePostRequest, id: string): Promise<Post[]> {
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
        if (updateTx) return this.getPost(id);
    },

    addUser: async function (userData: User): Promise<User[]> {
        userData.password = await bcrypt.hash(userData.password, 10);
        return database.insert(users).values(userData).returning();
    },

    listUsers: async function (): Promise<User[]> {
        return database.query.users.findMany().execute();
    },

    login: async function (userCredentials: UserCredentials): Promise<User | null> {
        return database
            .select()
            .from(users)
            .where(eq(users.username, userCredentials.username))
            .then((user) => {
                if (user.length) {
                    if (bcrypt.compareSync(userCredentials.password, user[0].password)) {
                        return user[0];
                    }
                }
                return null;
            }).catch((e) => {
                const password = bcrypt.compareSync(userCredentials.password, "potato");
                return null;
            });
    },
};
