import { navTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { Language } from "@blog/schemas/cemise.js";
import { and, asc, eq } from "drizzle-orm";

const NavService = {
    getNav: async function (language: Language) {
        const navs = await database.select().from(navTable).where(and(eq(navTable.enabled, true), eq(navTable.language, language))).orderBy(asc(navTable.order));
        return navs;
    }
}

export { NavService }
