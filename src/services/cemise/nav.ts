import { nav, Nav, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateNavRequest, EnumLanguage, Language, NavResponse, NavsResponse } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const NavService = {
    add: async function (navData: CreateNavRequest, user: User): Promise<Record<string, Nav> | null> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreateNavRequest;
            for (k in navData) {
                let record: Nav = <Nav>navData[k]
                record.id = uuid;
                record.language = EnumLanguage[k];
                await database.insert(nav).values(record).returning()
            }
        }).then(() => true);

        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<NavsResponse> {
        const navs: Nav[] = await database.query.nav.findMany();

        const navsObj: NavsResponse = {};
        navs.forEach((nav) => {
            if (!(nav.id in navsObj)) navsObj[nav.id] = <NavResponse>{};
            navsObj[nav.id][nav.language] = nav;
        });
        return navsObj;
    },

    get: async function (id: string): Promise<NavResponse | null> {
        const nav = await database.query.nav.findMany({ where: (nav, { eq }) => (eq(nav.id, id)) });

        if (nav.length) {
            const navObj = <NavResponse>{};
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
                await database.update(nav).set(record).where(and(eq(nav.id, id), eq(nav.language, record.language))).returning();
            }
        }).then(() => true);

        return updateTx ? this.get(id) : null;
    },
}