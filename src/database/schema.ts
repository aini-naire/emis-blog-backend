import { Language } from "@blog/schemas/cemise.js";
import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import {
    text,
    integer,
    sqliteTable,
    primaryKey,
} from "drizzle-orm/sqlite-core";

const postsTable = sqliteTable("posts",
    {
        id: text("id").notNull().$defaultFn(() => randomUUID()),
        hidden: integer("hidden", { mode: "boolean" }).notNull(),
        authorId: text("author_Id").notNull().references(() => usersTable.id),
        created: text("created").default(sql`(CURRENT_TIMESTAMP)`),
        modified: text("modified")
            .default(sql`(CURRENT_TIMESTAMP)`)
            .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
        language: text("language", { enum: ["EN", "PT"] }).notNull(),
        url: text("url").notNull().unique(),
        title: text("title").notNull(),
        tagline: text("tagline").notNull(),
        content: text("content").notNull(),
        showAuthor: integer("showAuthor", { mode: "boolean" }),
        page: integer("page", { mode: "boolean" }),
        private: integer("private", { mode: "boolean" }),
        listInTagOnly: integer("listInTagOnly", { mode: "boolean" }),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.language] }),
        };
    }
);

const postRelations = relations(postsTable, ({ many, one }) => ({
    postTags: many(postTagsTable),
    author: one(usersTable, { fields: [postsTable.authorId], references: [usersTable.id] }),
}));

const postTagsTable = sqliteTable("post_tags", {
    postid: text("post_id").references(() => postsTable.id),
    tagid: text("tag_id").references(() => tagsTable.id),
    language: text("language", { enum: ["EN", "PT"] }),
});

const tagsTable = sqliteTable(
    "tags",
    {
        id: text("id").$defaultFn(() => randomUUID()),
        language: text("language", { enum: ["EN", "PT"] }).notNull().$type<Language>(),
        title: text("title").notNull(),
        tagline: text("tagline").notNull(),
        url: text("url").notNull().unique(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.language] }),
        };
    }
);

const tagRelations = relations(tagsTable, ({ many }) => ({
    postTags: many(postTagsTable),
}));

const postTagsRelations = relations(postTagsTable, ({ one }) => ({
    tag: one(tagsTable, {
        fields: [postTagsTable.tagid, postTagsTable.language],
        references: [tagsTable.id, tagsTable.language],
    }),
    post: one(postsTable, {
        fields: [postTagsTable.postid, postTagsTable.language],
        references: [postsTable.id, postsTable.language],
    }),
}));

const usersTable = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => randomUUID()),
    username: text("username"),
    password: text("password"),
    email: text("email"),
    fullName: text("full_name"),
});

const navTable = sqliteTable("nav", {
    id: text("id")
        .$defaultFn(() => randomUUID()),
    language: text("language", { enum: ["EN", "PT"] }).notNull().$type<Language>(),
    url: text("url"),
    text: text("text"),
    enabled: integer("enabled", { mode: "boolean" }),
    external: integer("external", { mode: "boolean" }),
    order: integer("order"),
},
    (table) => {
        return {
            pk: primaryKey({ columns: [table.id, table.language] }),
        };
    });

type User = typeof usersTable.$inferSelect;
type Post = typeof postsTable.$inferSelect;
type PostTag = typeof postTagsTable.$inferSelect;
type Nav = typeof navTable.$inferSelect;
type Tag = typeof tagsTable.$inferSelect;

export { postsTable, postTagsTable, tagsTable, navTable, usersTable, tagRelations, postRelations, postTagsRelations, User, Post, PostTag, Nav, Tag }