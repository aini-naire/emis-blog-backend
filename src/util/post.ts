import { Post, PostTag } from "@blog/database/schema.js";
import { PostBase, PostResponse, PostsResponse } from "@blog/schemas/cemise.js";

export const serializePostBase = function (post: Post) {
    let postResp: PostBase = post;
    postResp.tags = [];
    let tag: PostTag;
    post.postTags.forEach((tag) => {
        postResp.tags.push(tag.tag)
    });
    return postResp;
}

export const serializePost = function (posts: Post[]) {
    const resp: PostResponse = {};
    posts.forEach((post) => resp[post.language] = serializePostBase(post));
    return resp;
}
export const serializePosts = function (posts: Post[]) {
    const resp: PostsResponse = {};
    posts.forEach((post) => {
        if (!(post.id in resp)) resp[post.id] = {};
        resp[post.id][post.language] = serializePostBase(post)
    })
    return resp;
}