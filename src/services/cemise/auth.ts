import { usersTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { LoginRequest } from "@blog/schemas/cemise.js";
import { eq } from "drizzle-orm";


export const AuthService = {
    login: async function (userCredentials: LoginRequest): Promise<typeof usersTable.$inferSelect | null> {
        return database
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, userCredentials.username))
            .then(async (user) => {
                if (user.length) {
                    if (await Bun.password.verify(userCredentials.password, user[0].password)) {
                        return user[0];
                    }
                }
                return null;
            }).catch(async (e) => {
                const password = await Bun.password.verify(userCredentials.password, "potato");
                return null;
            });
    },
}