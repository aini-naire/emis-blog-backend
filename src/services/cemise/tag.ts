import { Tag, tagsTable, usersTable } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateTagRequest, EnumLanguage, Language, TagResponse, TagsResponse } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";


export const TagService = {
    add: async function (tagData: CreateTagRequest): Promise<Record<Language, Tag>> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            for (k in tagData) {
                let record: Partial<Tag> = tagData[k];
                record.id = uuid;
                record.language = EnumLanguage[k];
                await tx.insert(tagsTable).values(record as Tag).returning()
            }
        }).then(() => true);

        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<TagsResponse> {
        const tags = await database.select().from(tagsTable);

        const tagsObj: TagsResponse = {};
        tags.forEach((tag) => {
            if (!(tag.id in tagsObj)) tagsObj[tag.id] = {} as TagResponse;
            tagsObj[tag.id][tag.language] = tag;
        });
        return tagsObj;
    },

    get: async function (id: string): Promise<TagResponse | null> {
        const tag = await database.query.tagsTable.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) });
        if (tag.length) {
            const tagObj = {} as TagResponse;
            tag.forEach((tagItem) => {
                tagObj[tagItem.language] = tagItem;
            });
            return tagObj
        }
        return null;
    },

    update: async function (tagData: CreateTagRequest, id: string): Promise<Record<Language, Tag> | null> {
        const updateTx = await database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            for (k in tagData) {
                let record: Partial<Tag> = tagData[k];
                record.language = EnumLanguage[k];
                await tx.update(tagsTable).set(record).where(and(eq(tagsTable.id, id), eq(tagsTable.language, record.language)));
            }
        }).then(() => true);

        return updateTx ? this.get(id) : null;
    },
}