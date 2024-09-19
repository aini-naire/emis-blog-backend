import { tag, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreateTagRequest, EnumLanguage, Language, Tag, TagResponse, TagsResponse } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const TagService = {
    add: async function (tagData: CreateTagRequest, user: User): Promise<Record<string, Tag>> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreateTagRequest;
            for (k in tagData) {
                let record: Tag = tagData[k]
                record.id = uuid;
                record.language = EnumLanguage[k];
                await database.insert(tag).values(record).returning()
            }
        }).then(() => true);

        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<TagsResponse> {
        const tags: Tag[] = await database.query.tag.findMany();

        const tagsObj: TagsResponse = {};
        tags.forEach((tag) => {
            if (!(tag.id in tagsObj)) tagsObj[tag.id] = <TagResponse>{};
            tagsObj[tag.id][tag.language] = tag;
        });
        return tagsObj;
    },

    get: async function (id: string): Promise<TagResponse | null> {
        const tag = await database.query.tag.findMany({ where: (tag, { eq }) => (eq(tag.id, id)) });
        if (tag.length) {
            const tagObj = <TagResponse>{};
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
            let response: Record<string, Tag> = {};
            for (k in tagData) {
                let record: Partial<Tag> = tagData[k]
                record.language = EnumLanguage[k];
                await database.update(tag).set(record).where(and(eq(tag.id, id), eq(tag.language, record.language)));
            }
        }).then(() => true);

        return updateTx ? this.get(id) : null;
    },
}