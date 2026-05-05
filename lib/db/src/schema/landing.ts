import { pgTable, serial, text, integer, jsonb, boolean } from "drizzle-orm/pg-core";
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

export const landingSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  icon: z.string().nullish(),
});

export const landingPageTable = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  template: text("template").notNull().default("vivid"),
  title: text("title").notNull().default("Meu App"),
  subtitle: text("subtitle"),
  description: text("description"),
  appFileObjectPath: text("app_file_object_path"),
  tutorialVideoObjectPath: text("tutorial_video_object_path"),
  tutorialVideoUrl: text("tutorial_video_url"),
  buttonText: text("button_text"),
  photos: jsonb("photos").$type<z.infer<typeof landingPhotoSchema>[]>().default([]),
  socialLinks: jsonb("social_links").$type<z.infer<typeof socialLinkSchema>[]>().default([]),
  sections: jsonb("sections").$type<z.infer<typeof landingSectionSchema>[]>().default([]),
  // Custom colors
  heroGradientFrom: text("hero_gradient_from"),
  heroGradientTo: text("hero_gradient_to"),
  heroBgType: text("hero_bg_type").default("gradient"),
  heroBgColor: text("hero_bg_color"),
  heroBgImageObjectPath: text("hero_bg_image_object_path"),
  heroTextDark: boolean("hero_text_dark").default(false),
  ctaBgColor: text("cta_bg_color"),
  ctaTextColor: text("cta_text_color"),
  pageBgColor: text("page_bg_color"),
  pageTextColor: text("page_text_color"),
  accentColor: text("accent_color"),
  logoObjectPath: text("logo_object_path"),
  faviconObjectPath: text("favicon_object_path"),
});

export const insertLandingPageSchema = createInsertSchema(landingPageTable).omit({ id: true });
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type LandingPage = typeof landingPageTable.$inferSelect;
