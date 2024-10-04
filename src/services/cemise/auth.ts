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