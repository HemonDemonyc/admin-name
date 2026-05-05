import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, landingPageTable } from "@workspace/db";
import { UpdateLandingBody, GetLandingResponse } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateLanding() {
  const rows = await db.select().from(landingPageTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(landingPageTable).values({ title: "Meu App" }).returning();
  return created;
}

router.get("/landing", async (req, res): Promise<void> => {
  const landing = await getOrCreateLanding();
  res.json(GetLandingResponse.parse(landing));
});

router.put("/admin/landing", async (req, res): Promise<void> => {
  if (!req.session.authenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = UpdateLandingBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid landing update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const landing = await getOrCreateLanding();
  const [updated] = await db
    .update(landingPageTable)
    .set(parsed.data)
    .where(eq(landingPageTable.id, landing.id))
    .returning();
  res.json(GetLandingResponse.parse(updated));
});

export default router;
