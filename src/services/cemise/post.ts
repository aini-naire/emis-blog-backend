import { Post, post, PostTag, postTags, User } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreatePostRequest, EnumLanguage, PostBase, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";
import PostSerializer from "@blog/Util/PostSerializer.js";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";


export const PostService = {
    add: async function (postData: CreatePostRequest, user: User): Promise<PostResponse|null> {
        const uuid = randomUUID();

        const insertTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Post = postData.content[k]
                record.id = uuid;
                record.authorId = user.id;
                record.language = EnumLanguage[k];
                await database.insert(post).values(record).returning();
            }

            postData.tags.map(async (tagID) => {
                for (k in postData.content) {
                    let record: PostTag = { postid: uuid, tagid: tagID, language: k };
                    await database.insert(postTags).values(record).returning();
                }
            })
        }).then(() => true);
        return insertTx ? this.get(uuid) : null;
    },

    list: async function (): Promise<PostsResponse> {
        const posts = await database.query.post.findMany({ with: { author: true, postTags: { with: { tag: true } } } });
        return PostSerializer.posts(posts);
    },

    listByTag: async function (tagID: string): Promise<PostsResponse> {
        const posts = await database.query.postTags.findMany({
            where: (postTag, { eq }) => eq(postTag.tagid, tagID),
            with: { post: { with: { author: true, postTags: { with: { tag: true } } } } }
        });
        return PostSerializer.posts(posts);
    },

    get: async function (id: string): Promise<PostResponse|null> {
        const post = await database.query.post.findMany({
            where: (post, { eq }) => (eq(post.id, id)),
            with: { author: true, postTags: { with: { tag: true } } }
        });
        return post.length ? PostSerializer.postItem(post) : null;
    },

    update: async function (postData: CreatePostRequest, id: string): Promise<PostResponse|null> {
        /** TODO need to handle errors */
        const updateTx = await database.transaction(async (tx) => {
            let k: keyof CreatePostRequest['content'];
            for (k in postData.content) {
                let record: Partial<Post> = postData.content[k]
                console.log(record)
                //TODO tags
                await database.update(post).set(record).where(and(eq(post.id, id), eq(post.language, record.language))).returning();
            }
        }).then(() => true);
        return updateTx ? this.get(id) : null;
    },
}
