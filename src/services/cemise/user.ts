import { User, usersTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateUserRequest } from "@blog/schemas/cemise.js";


export const UserService = {
    add: async function (userData: CreateUserRequest): Promise<User[]> {
        userData.password = await Bun.password.hashSync(userData.password, { algorithm: "bcrypt", cost: 12 });
        return database.insert(usersTable).values(userData).returning();
    },

    list: async function (): Promise<User[]> {
        const users = await database.select().from(usersTable);
        return users;
    },
}