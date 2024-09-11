import { Post, post, tag, User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { Tag, UserCredentials } from "@blog/schemas/cemise.js";
import * as bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";

export default {
    addTag: async function (tagData: Tag, user: User): Promise<Tag[]> {
        return database.insert(tag).values(tagData).returning();
    },

    listTags: async function (): Promise<Tag[]> {
        return database.query.tag.findMany().execute();
    },

    getTag: async function (id: string): Promise<Post[]> {
        return database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) }).execute();
    },

    updateTag: async function (tagData: Post, id: string): Promise<Post[]> {
        return database.update(tag).set(tagData).where(and(eq(tag.id, id), eq(tag.language, tagData.language))).returning();
    },

    addPost: async function (postData: Post, user: User): Promise<Post[]> {
        postData.authorId = user.id;
        return database.insert(post).values(postData).returning();
    },

    listPosts: async function (): Promise<Post[]> {
        return database.query.post.findMany({ with: { author: true, postTags: true } }).execute();
    },

    getPost: async function (id: string): Promise<Post[]> {
        return database.query.post.findMany({ where: (post, { eq }) => (eq(post.id, id)), with: { author: true } }).execute();
    },

    updatePost: async function (postData: Post, id: string): Promise<Post[]> {
        return database.update(post).set(postData).where(and(eq(post.id, id), eq(post.language, postData.language))).returning();
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
