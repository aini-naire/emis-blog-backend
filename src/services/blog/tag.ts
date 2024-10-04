import { database } from "@blog/plugins/database.js";
import { Tag } from "@blog/schemas/blog.js";


const TagService = {
    getTag: async function (url: string): Promise<Tag | null> {
        const tag = await database.query.tagsTable.findMany({ where: (tag, { eq }) => (eq(tag.url, url)) });

        if (tag.length) return tag[0]
        return null
    }
}

export { TagService }
