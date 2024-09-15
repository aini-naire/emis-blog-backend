import { Post, post, PostTag, postTags, tag, User, users } from "@blog/database/schema.js";
import { database } from "@blog/plugins/database.js";
import { CreatePostRequest, CreateTagRequest, EnumLanguage, PostBase, Tag, TagResponse } from "@blog/schemas/cemise.js";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";

export const NavService =  {}