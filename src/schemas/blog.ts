import { Type, Static } from '@sinclair/typebox'

export enum EnumLanguage {
  EN = 'EN',
  PT = 'PT'
}

export type Nav = Static<typeof Nav>
export const Nav = Type.Object({
  text: Type.String(),
  url: Type.String()
})

export type NavResponse = Static<typeof NavResponse>
export const NavResponse = Type.Array(Nav)

export type Language = Static<typeof Language>
export const Language = Type.Enum(EnumLanguage)

export type Author = Static<typeof Author>
export const Author = Type.Object({
  fullName: Type.String()
})

export type Tag = Static<typeof Tag>
export const Tag = Type.Object({
  id: Type.String({ type: 'uuid' }),
  title: Type.String(),
  language: Language,
  tagline: Type.String()
})

export type PostMeta = Static<typeof PostMeta>
export const PostMeta = Type.Object({
  id: Type.String({ type: 'uuid' }),
  url: Type.String(),
  title: Type.String(),
  language: Language,
  tagline: Type.String(),
  author: Author
})

export type PostListResponse = Static<typeof PostListResponse>
export const PostListResponse = Type.Object({
  posts: Type.Array(PostMeta),
  page: Type.Number(),
  pages: Type.Number()
})

export type PostBase = Static<typeof PostBase>
export const PostBase = Type.Object({
  id: Type.String({ type: 'uuid' }),
  url: Type.String(),
  content: Type.String(),
  title: Type.String(),
  language: Language,
  tagline: Type.String(),
  created: Type.String({ type: 'date' }),
  modified: Type.String({ type: 'date' }),
  showAuthor: Type.Boolean(),
  page: Type.Boolean(),
  author: Author,
  tags: Type.Optional(Type.Array(Tag))
})

export type ErrorResponse = Static<typeof ErrorResponse>
export const ErrorResponse = Type.Object({
  message: Type.String()
})
