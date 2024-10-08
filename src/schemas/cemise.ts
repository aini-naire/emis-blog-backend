import { Type, Static } from '@sinclair/typebox'

export enum EnumLanguage {
    EN = 'EN',
    PT = 'PT'
}

export type Language = Static<typeof Language>
export const Language = Type.Enum(EnumLanguage)

export type Author = Static<typeof Author>
export const Author = Type.Object({
    fullName: Type.String()
})

export type Nav = Static<typeof Nav>
export const Nav = Type.Object({
    id: Type.String({ type: 'uuid' }),
    text: Type.String(),
    language: Language,
    url: Type.String(),
    enabled: Type.Boolean(),
    external: Type.Boolean(),
    order: Type.Number()
})

export type NewNav = Static<typeof NewNav>
export const NewNav = Type.Object({
    text: Type.String(),
    url: Type.String(),
    enabled: Type.Boolean(),
    external: Type.Boolean(),
    order: Type.Number()
})

export type CreateNavRequest = Static<typeof CreateNavRequest>
export const CreateNavRequest = Type.Record(Language, NewNav)

export type NavResponse = Static<typeof NavResponse>
export const NavResponse = Type.Record(Language, Nav)

export type NavsResponse = Static<typeof NavsResponse>
export const NavsResponse = Type.Record(Type.String(), NavResponse)

export type Tag = Static<typeof Tag>
export const Tag = Type.Object({
    id: Type.String({ type: 'uuid' }),
    title: Type.String(),
    language: Language,
    tagline: Type.String(),
    url: Type.String()
})

export type NewTag = Static<typeof NewTag>
export const NewTag = Type.Object({
    title: Type.String(),
    tagline: Type.String(),
    url: Type.String()
})

export type CreateTagRequest = Static<typeof CreateTagRequest>
export const CreateTagRequest = Type.Record(Language, NewTag)

export type TagResponse = Static<typeof TagResponse>
export const TagResponse = Type.Record(Language, Tag)

export type TagsResponse = Static<typeof TagsResponse>
export const TagsResponse = Type.Record(Type.String(), TagResponse)

export type PostBase = Static<typeof PostBase>
export const PostBase = Type.Object({
    id: Type.String({ type: 'uuid' }),
    url: Type.String(),
    content: Type.String(),
    title: Type.String(),
    language: Language,
    tagline: Type.String(),
    hidden: Type.Boolean(),
    authorId: Type.String(),
    created: Type.String({ type: 'date' }),
    modified: Type.String({ type: 'date' }),
    showAuthor: Type.Boolean(),
    private: Type.Boolean(),
    page: Type.Boolean(),
    listInTagOnly: Type.Boolean(),
    author: Author,
    tags: Type.Optional(Type.Array(Tag))
})

export type NewPost = Static<typeof NewPost>
export const NewPost = Type.Object({
    url: Type.String(),
    content: Type.String(),
    title: Type.String(),
    tagline: Type.String(),
    hidden: Type.Boolean(),
    showAuthor: Type.Boolean(),
    private: Type.Boolean(),
    page: Type.Boolean(),
    listInTagOnly: Type.Boolean()
})

export type CreatePostRequest = Static<typeof CreatePostRequest>
export const CreatePostRequest = Type.Object({
    content: Type.Partial(Type.Record(Language, NewPost), { minProperties: 1 }),
    tags: Type.Array(Type.String())
})

export type PostResponse = Static<typeof PostResponse>
export const PostResponse = Type.Partial(Type.Record(Language, PostBase))

export type PostsResponse = Static<typeof PostsResponse>
export const PostsResponse = Type.Record(Type.String(), PostResponse)

export type CreateUserRequest = Static<typeof CreateUserRequest>
export const CreateUserRequest = Type.Object({
    email: Type.String({ type: 'email' }),
    username: Type.String(),
    fullName: Type.String(),
    password: Type.String()
})

export type UserResponse = Static<typeof UserResponse>
export const UserResponse = Type.Object({
    id: Type.String({ type: 'uuid' }),
    email: Type.String({ type: 'email' }),
    username: Type.String(),
    fullName: Type.String()
})

export enum EnumImageType {
    POST = 'POST',
    LOG = 'LOG'
}

export type ImageType = Static<typeof ImageType>
export const ImageType = Type.Enum(EnumImageType)

export type ImageBase = Static<typeof ImageBase>
export const ImageBase = Type.Object({
    id: Type.String({ type: 'uuid' }),
    originalFilename: Type.String(),
    filename: Type.String(),
    type: ImageType,
    created: Type.String({ type: 'date' })
})

export type ImagesResponse = Static<typeof ImagesResponse>
export const ImagesResponse = Type.Array(ImageBase)

export type LoginRequest = Static<typeof LoginRequest>
export const LoginRequest = Type.Object({
    username: Type.String(),
    password: Type.String()
})

export type LoginResponse = Static<typeof LoginResponse>
export const LoginResponse = Type.Object({
    accessToken: Type.String()
})

export type ErrorResponse = Static<typeof ErrorResponse>
export const ErrorResponse = Type.Object({
    message: Type.String()
})
