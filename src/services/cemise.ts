import { NewPost, Post, post } from "@blog/database/schema.js";
import {database} from "@blog/plugins/database.js";

export default {
    addTag: function () {},

    listTags: function () {},

    addPost: function (postData: NewPost): Post[] {
        return database.insert(post).values(postData).returning();
    },

    listPosts: function (): Post[] {
        return database.query.post.findMany({with: {author: true}}).execute();
    },
}