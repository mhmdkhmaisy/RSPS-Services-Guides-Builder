import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const guides = sqliteTable("guides", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content", { mode: 'json' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  color: text("color").default('#58a6ff'),
});

export const guideTags = sqliteTable("guide_tags", {
  guideId: text("guide_id").notNull().references(() => guides.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

// Relations
export const guidesRelations = relations(guides, ({ many }) => ({
  guideTags: many(guideTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  guideTags: many(guideTags),
}));

export const guideTagsRelations = relations(guideTags, ({ one }) => ({
  guide: one(guides, {
    fields: [guideTags.guideId],
    references: [guides.id],
  }),
  tag: one(tags, {
    fields: [guideTags.tagId],
    references: [tags.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type GuideTag = typeof guideTags.$inferSelect;

// Extended types with relations
export type GuideWithTags = Guide & {
  tags: Tag[];
};