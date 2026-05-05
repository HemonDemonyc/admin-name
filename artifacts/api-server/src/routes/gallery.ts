import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryTable, usersTable } from "@workspace/db";
import { UpdateMyGalleryBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
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
  const [updated] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, existing.id))
    .returning();
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

export default router;
