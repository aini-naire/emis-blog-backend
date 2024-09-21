import { Post, PostTag } from "@blog/database/schema.js";
import { PostBase, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";

export default {
    basePost: function (post: Post): PostBase {
        let postResp: PostBase = post;
        postResp.tags = [];
        let tag: PostTag;
        post.postTags?.forEach((tag) => {
            postResp.tags.push(tag.tag)
        });
        return postResp;
    },

    postItem: function (posts: Post[]): PostResponse {
        const resp: PostResponse = {};
        posts.forEach((post) => resp[post.language] = this.basePost(post));
        return resp;
    },
    posts: function (posts: Post[]): PostsResponse {
        const resp: PostsResponse = {};
        posts.forEach((post) => {
            if (!(post.id in resp)) resp[post.id] = {};
            resp[post.id][post.language] = this.basePost(post)
        })
        return resp;
    }
}