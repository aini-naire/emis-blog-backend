import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import {
    text,
    integer,
    sqliteTable,
    primaryKey,
} from "drizzle-orm/sqlite-core";

export const post = sqliteTable(
    "posts",
    {
        id: text("id").$defaultFn(() => randomUUID()),
        hidden: integer("hidden", { mode: "boolean" }),
        authorId: text("author_Id").references(() => users.id),
        created: text("created").default(sql`(CURRENT_TIMESTAMP)`),
        modified: text("modified")
            .default(sql`(CURRENT_TIMESTAMP)`)
            .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
        language: text("language", { enum: ["en", "pt"] }).notNull(),
        url: text("url").notNull(),
        title: text("title").notNull(),
        tagline: text("tagline").notNull(),
        content: text("content").notNull(),
        showAuthor: integer("showAuthor", { mode: "boolean" }),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.language] }),
        };
    }
);

export const postRelations = relations(post, ({ many, one }) => ({
    postTags: many(postTags),
    author: one(users, { fields: [post.authorId], references: [users.id] }),
}));

export const postTags = sqliteTable("post_tags", {
    postid: text("post_id").references(() => post.id),
    tagid: text("tag_id").references(() => tag.id),
    language: text("language", { enum: ["en", "pt"] }),
});

export const tag = sqliteTable(
    "tags",
    {
        id: text("id").$defaultFn(() => randomUUID()),
        language: text("language", { enum: ["en", "pt"] }).notNull(),
        title: text("title").notNull(),
        tagline: text("tagline").notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.language] }),
        };
    }
);

export const tagRelations = relations(tag, ({ many }) => ({
    postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
    tag: one(tag, {
        fields: [postTags.tagid, postTags.language],
        references: [tag.id, tag.language],
    }),
    post: one(post, {
        fields: [postTags.postid, postTags.language],
        references: [post.id, post.language],
    }),
}));

export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    username: text("username"),
    password: text("password"),
    email: text("email"),
    fullName: text("full_name"),
});

export type Post = typeof post.$inferSelect;
export type User = typeof users.$inferSelect;
export type Tag = typeof tag.$inferSelect;