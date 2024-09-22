// types source file. schemas are generated from this in the typebox workbench
export enum Language {
    EN = "EN",
    PT = "PT",
}

export type Author = {
    fullName: string;
}

export type Nav = {
    /**
     * @type uuid
     */
    id: string;
    text: string;
    language: Language;
    url: string;
    enabled: boolean;
    order: number;
}

export type NewNav = {
    text: string;
    url: string;
    enabled: boolean;
    order: number;
}

export type CreateNavRequest = Record<Language, NewNav>;

export type NavResponse = Record<Language, Nav>;

export type NavsResponse = Record<string, NavResponse>;


export type Tag = {
    /**
     * @type uuid
     */
    id: string;
    title: string;
    language: Language;
    tagline: string;
    url: string;
}

export type NewTag = {
    title: string;
    tagline: string;
    url: string;
}

export type CreateTagRequest = Record<Language, NewTag>;

export type TagResponse = Record<Language, Tag>;

export type TagsResponse = Record<string, TagResponse>;

export type PostBase = {
    /**
     * @type uuid
     */
    id: string;
    url: string;
    content: string;
    title: string;
    language: Language;
    tagline: string;
    hidden: boolean;
    authorId: string;
    /**
     * @type date-time
     */
    created: string;
    /**
     * @type date-time
     */
    modified: string;
    showAuthor: boolean;
    private: boolean;
    page: boolean;
    author: Author,
    tags?: Tag[];
}

export type NewPost = {
    url: string;
    content: string;
    title: string;
    tagline: string;
    hidden: boolean;
    showAuthor: boolean;
    private: boolean;
    page: boolean;
}

export type CreatePostRequest = {
    /**
     * @minProperties 1
     */
    content: Partial<Record<Language, NewPost>>;
    tags: string[];
}

export type PostResponse = Partial<Record<Language, PostBase>>;

export type PostsResponse = Record<string, PostResponse>;

export type CreateUserRequest = {
    /**
     * @type email
     */
    email: string;
    username: string;
    fullName: string;
    password: string;
}

export type UserResponse = {
    /**
     * @type uuid
     */
    id: string;
    /**
     * @type email
     */
    email: string;
    username: string;
    fullName: string;
}

export type LoginRequest = {
    username: string;
    password: string;
}

export type LoginResponse = {
    accessToken: string;
}

export type ErrorResponse = {
    message: string;
}
