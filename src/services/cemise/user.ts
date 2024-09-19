import { User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import * as bcrypt from "bcrypt";

export const UserService = {
    add: async function (userData: User): Promise<User[]> {
        userData.password = await bcrypt.hash(userData.password, 10);
        return database.insert(users).values(userData).returning();
    },

    list: async function (): Promise<User[]> {
        return database.query.users.findMany();
    },
}