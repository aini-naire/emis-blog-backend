import { Type, Static } from '@sinclair/typebox'

enum EnumLanguage {
    EN = "EN",
    PT = "PT"
}

type Language = Static<typeof Language>
const Language = Type.Enum(EnumLanguage)

export type NewPost = Static<typeof NewPost>
export const NewPost = Type.Object({
    id: Type.Optional(Type.String({ 'format': 'uuid' })),
    hidden: Type.Boolean(),
    language: Language,
    url: Type.String(),
    title: Type.String(),
    tagline: Type.String(),
    content: Type.String(),
    showAuthor: Type.Boolean()

})

export type Author = Static<typeof Author>
export const Author = Type.Object({
    fullName: Type.String()
})

export type Post = Static<typeof Post>
export const Post = Type.Object({
    id: Type.String({ 'format': 'uuid' }),
    hidden: Type.Boolean(),
    authorId: Type.String({ 'format': 'uuid' }),
    created: Type.String(),
    modified: Type.String(),
    language: Language,
    url: Type.String(),
    title: Type.String(),
    tagline: Type.String(),
    content: Type.String(),
    author: Type.Optional(Author),
    showAuthor: Type.Boolean()
})

export type Tag = Static<typeof Tag>
export const Tag = Type.Object({
    id: Type.Optional(Type.String({ 'format': 'uuid' })),
    language: Language,
    title: Type.String(),
    tagline: Type.String()
})

export type User = Static<typeof User>
export const User = Type.Object({
    id: Type.String({ 'format': 'uuid' }),
    username: Type.String(),
    email: Type.String(),
    fullName: Type.String()
})

export type NewUser = Static<typeof NewUser>
export const NewUser = Type.Object({
    username: Type.String(),
    email: Type.String(),
    password: Type.String(),
    fullName: Type.String()
})

export type UserCredentials = Static<typeof UserCredentials>
export const UserCredentials = Type.Object({
    username: Type.String(),
    password: Type.String(),
})

export type UserAccessToken = Static<typeof UserAccessToken>
export const UserAccessToken = Type.Object({
    accessToken: Type.String(),
})

export type Error = Static<typeof Error>
export const Error = Type.Object({
    message: Type.String(),
})