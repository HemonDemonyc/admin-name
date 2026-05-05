import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, galleryTable } from "@workspace/db";
import { UpdateGalleryBody, GetGalleryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateGallery() {
  const rows = await db.select().from(galleryTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(galleryTable).values({ title: "Galeria", items: [] }).returning();
  return created;
}

router.get("/gallery", async (req, res): Promise<void> => {
  const gallery = await getOrCreateGallery();
  res.json(GetGalleryResponse.parse(gallery));
});

router.put("/admin/gallery", async (req, res): Promise<void> => {
  if (!req.session.authenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateGalleryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid gallery update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const gallery = await getOrCreateGallery();
  const [updated] = await db
    .update(galleryTable)
    .set(parsed.data)
    .where(eq(galleryTable.id, gallery.id))
    .returning();
  res.json(GetGalleryResponse.parse(updated));
});

export default router;
