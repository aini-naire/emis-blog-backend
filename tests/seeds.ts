import { User } from "@blog/database/schema.js";
import { CreateNavRequest, CreatePostRequest, CreateTagRequest } from "@blog/schemas/cemise.js";

export const navSeed: CreateNavRequest = {
    EN: {
        text: "test",
        url: "test",
        enabled: true,
        order: 1
    },
    PT: {
        text: "teste",
        url: "teste",
        enabled: true,
        order: 1
    },
}

export const navSeedDisabled: CreateNavRequest = {
    EN: {
        text: "test2",
        url: "test2",
        enabled: false,
        order: 1
    },
    PT: {
        text: "teste2",
        url: "teste2",
        enabled: false,
        order: 1
    },
}

export const userSeed: Partial<User> = {
    fullName: "test",
    id: "potato",
    password: "potato"
}

export const tagSeed: CreateTagRequest = {
    EN: {
        title: "test title",
        url: "test",
        tagline: "test tagline",
    },
    PT: {
        title: "teste title",
        url: "teste",
        tagline: "test tagline",
    },
}

export const postSeed: CreatePostRequest = {
    content: {
        EN: {
            url: "test",
            content: "test",
            title: "test",
            tagline: "test",
            hidden: false,
            showAuthor: false,
            private: false,
            page: false,
        },
        PT: {
            url: "teste",
            content: "teste",
            title: "teste",
            tagline: "teste",
            hidden: false,
            showAuthor: false,
            private: false,
            page: false,
        }
    },
    tags: []
}