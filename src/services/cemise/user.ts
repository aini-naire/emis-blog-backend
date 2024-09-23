import { User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";

export const UserService = {
    add: async function (userData: User): Promise<User[]> {
        userData.password = await Bun.password.hashSync(userData.password, {algorithm: "bcrypt", cost: 12});
        return database.insert(users).values(userData).returning();
    },

    list: async function (): Promise<User[]> {
        return database.query.users.findMany();
    },
}