import { Post, post, User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { UserCredentials } from "@blog/schemas/cemise.js";
import * as bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";

export default {
    addTag: async function () { },

    listTags: async function () { },

    addPost: async function (postData: Post): Promise<Post[]> {
        return database.insert(post).values(postData).returning();
    },

    listPosts: async function (): Promise<Post[]> {
        return database.query.post.findMany({ with: { author: true } }).execute();
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
