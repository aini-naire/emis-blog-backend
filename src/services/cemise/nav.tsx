import { nav, Nav, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateNavRequest, EnumLanguage } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const NavService =  {
    add: async function (navData: CreateNavRequest, user: User): Promise<Record<string, Nav>> {
        const uuid = randomUUID();

        return database.transaction(async (tx) => {
            let k: keyof CreateNavRequest;
            let response: Record<string, Nav> = {};
            for (k in navData) {
                let record: Nav = navData[k]
                record.id = uuid;
                record.language = EnumLanguage[k];
                let result: Nav[] = await database.insert(nav).values(record).returning()
                response[k] = result[0];
            }
            return response;
        });
    },

    list: async function (): Promise<Nav[]> {
        return database.query.nav.findMany().execute();
    },

    get: async function (id: string): Promise<Nav[]> {
        return database.query.nav.findMany({ where: (nav, { eq }) => (eq(nav.id, id)) }).execute();
    },

    update: async function (navData: CreateNavRequest, id: string): Promise<Record<string, Nav>> {
        return database.transaction(async (tx) => {
            let k: keyof CreateNavRequest;
            let response: Record<string, Nav> = {};
            for (k in navData) {
                let record: Partial<Nav> = navData[k]
                record.language = EnumLanguage[k];
                let result: Nav[] = await database.update(nav).set(record).where(and(eq(nav.id, id), eq(nav.language, record.language))).returning();
                response[k] = result[0];
            }
            return response;
        });
    },
}