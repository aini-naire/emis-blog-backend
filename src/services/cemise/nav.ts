import { Nav, navTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateNavRequest, EnumLanguage, Language, NavResponse, NavsResponse } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";


export const NavService = {
    add: async function (navData: CreateNavRequest): Promise<Record<Language, Nav> | null> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreateNavRequest;
            for (k in navData) {
                let record: Nav = navData[k] as Nav;
                record.id = uuid;
                record.language = EnumLanguage[k];
                await tx.insert(navTable).values(record).returning()
            }
        }).then(() => true);

        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<NavsResponse> {
        const navs = await database.select().from(navTable);

        const navsObj: NavsResponse = {};
        navs.forEach((navItem) => {
            if (!(navItem.id in navsObj)) navsObj[navItem.id] = {} as NavResponse;
            navsObj[navItem.id][navItem.language] = navItem;
        });
        return navsObj;
    },

    get: async function (id: string): Promise<NavResponse | null> {
        const nav = await database.select().from(navTable).where(eq(navTable.id, id));

        if (nav.length) {
            const navObj = {} as NavResponse;
            nav.forEach((navItem) => {
                navObj[navItem.language] = navItem;
            });
            return navObj;
        }
        return null;
    },

    update: async function (navData: CreateNavRequest, id: string): Promise<Record<Language, Nav> | null> {
        const updateTx = await database.transaction(async (tx) => {
            let k: keyof CreateNavRequest;
            for (k in navData) {
                let record: Partial<Nav> = navData[k]
                record.language = EnumLanguage[k];
                await tx.update(navTable).set(record).where(and(eq(navTable.id, id), eq(navTable.language, record.language)));
            }
        }).then(() => true);

        return updateTx ? this.get(id) : null;
    },
}