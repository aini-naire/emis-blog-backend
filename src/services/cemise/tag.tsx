import { tag, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateTagRequest, EnumLanguage, Tag } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const TagService = {
    add: async function (tagData: CreateTagRequest, user: User): Promise<Record<string, Tag>> {
        const uuid = randomUUID();

        return database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            let response: Record<string, Tag> = {};
            for (k in tagData) {
                let record: Tag = tagData[k]
                record.id = uuid;
                record.language = EnumLanguage[k];
                let result: Tag[] = await database.insert(tag).values(record).returning()
                response[k] = result[0];
            }
            return response;
        });
    },

    list: async function (): Promise<Tag[]> {
        return database.query.tag.findMany().execute();
    },

    get: async function (id: string): Promise<Tag[]> {
        return database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) }).execute();
    },

    update: async function (tagData: CreateTagRequest, id: string): Promise<Record<string, Tag>> {
        return database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            let response: Record<string, Tag> = {};
            for (k in tagData) {
                let record: Partial<Tag> = tagData[k]
                let result: Tag[] = await database.update(tag).set(record).where(and(eq(tag.id, id), eq(tag.language, record.language))).returning();
                response[k] = result[0];
            }
            return response;
        });
        return database.update(tag).set(tagData).where(and(eq(tag.id, id), eq(tag.language, tagData.language))).returning();
    },
}