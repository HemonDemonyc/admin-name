import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryTable, usersTable } from "@workspace/db";
import { UpdateMyGalleryBody } from "@workspace/api-zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
const AddCommentBody = z.object({ author: z.string(), text: z.string() });

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session.userId) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

router.get("/my/gallery", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const [row] = await db.select().from(galleryTable).where(eq(galleryTable.userId, req.session.userId!)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.put("/my/gallery", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const parsed = UpdateMyGalleryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [existing] = await db.select().from(galleryTable).where(eq(galleryTable.userId, req.session.userId!)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db.update(galleryTable).set(parsed.data).where(eq(galleryTable.id, existing.id)).returning();
  res.json(updated);
});

router.get("/pages/:username/gallery", async (req, res): Promise<void> => {
  const { username } = req.params;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.select().from(galleryTable).where(eq(galleryTable.userId, user.id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.post("/pages/:username/gallery/:itemId/like", async (req, res): Promise<void> => {
  const { username, itemId } = req.params;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [gallery] = await db.select().from(galleryTable).where(eq(galleryTable.userId, user.id)).limit(1);
  if (!gallery) { res.status(404).json({ error: "Not found" }); return; }
  const items = (gallery.items as any[]) ?? [];
  const idx = items.findIndex((it) => it.id === itemId);
  if (idx === -1) { res.status(404).json({ error: "Item not found" }); return; }
  items[idx] = { ...items[idx], likes: (items[idx].likes ?? 0) + 1 };
  await db.update(galleryTable).set({ items }).where(eq(galleryTable.id, gallery.id));
  res.json({ likes: items[idx].likes });
});

router.post("/pages/:username/gallery/:itemId/comments", async (req, res): Promise<void> => {
  const { username, itemId } = req.params;
  const parsed = AddCommentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [gallery] = await db.select().from(galleryTable).where(eq(galleryTable.userId, user.id)).limit(1);
  if (!gallery) { res.status(404).json({ error: "Not found" }); return; }
  const items = (gallery.items as any[]) ?? [];
  const idx = items.findIndex((it) => it.id === itemId);
  if (idx === -1) { res.status(404).json({ error: "Item not found" }); return; }
  const comment = { id: uuidv4(), author: parsed.data.author, text: parsed.data.text, timestamp: new Date().toISOString() };
  items[idx] = { ...items[idx], comments: [...(items[idx].comments ?? []), comment] };
  const [updated] = await db.update(galleryTable).set({ items }).where(eq(galleryTable.id, gallery.id)).returning();
  res.json(updated);
});

export default router;
