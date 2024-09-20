import { User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { LoginRequest, PostBase, Tag, TagResponse } from "@blog/schemas/cemise.js";
import { and, eq } from "drizzle-orm";

export const AuthService = {
    login: async function (userCredentials: LoginRequest): Promise<User | null> {
        return database
            .select()
            .from(users)
            .where(eq(users.username, userCredentials.username))
            .then((user) => {
                if (user.length) {
                    if (Bun.password.verifySync(userCredentials.password, user[0].password)) {
                        return user[0];
                    }
                }
                return null;
            }).catch((e) => {
                const password = Bun.password.verifySync(userCredentials.password, "potato");
                return null;
            });
    },
}