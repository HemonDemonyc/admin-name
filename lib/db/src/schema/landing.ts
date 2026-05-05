import { pgTable, serial, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
  label: z.string(),
});

export const landingPhotoSchema = z.object({
  objectPath: z.string(),
  caption: z.string().nullish(),
});

export const landingPageTable = pgTable("landing_page", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Meu App"),
  subtitle: text("subtitle"),
  description: text("description"),
  appFileObjectPath: text("app_file_object_path"),
  tutorialVideoObjectPath: text("tutorial_video_object_path"),
  tutorialVideoUrl: text("tutorial_video_url"),
  buttonText: text("button_text"),
  photos: jsonb("photos").$type<z.infer<typeof landingPhotoSchema>[]>().default([]),
  socialLinks: jsonb("social_links").$type<z.infer<typeof socialLinkSchema>[]>().default([]),
});

export const insertLandingPageSchema = createInsertSchema(landingPageTable).omit({ id: true });
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type LandingPage = typeof landingPageTable.$inferSelect;
