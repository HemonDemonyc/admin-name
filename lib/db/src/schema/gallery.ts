import { pgTable, serial, text, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryCommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  timestamp: z.string(),
});

export const galleryItemSchema = z.object({
  id: z.string(),
  objectPath: z.string(),
  type: z.enum(["photo", "video"]),
  title: z.string().nullish(),
  caption: z.string().nullish(),
  order: z.number(),
  likes: z.number().default(0),
  comments: z.array(galleryCommentSchema).default([]),
});

export const galleryTable = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  description: text("description"),
  items: jsonb("items").$type<z.infer<typeof galleryItemSchema>[]>().default([]),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({ id: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Gallery = typeof galleryTable.$inferSelect;
