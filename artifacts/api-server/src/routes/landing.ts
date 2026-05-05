import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, landingPageTable, usersTable } from "@workspace/db";
import { UpdateMyLandingBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): boolean {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/my/landing", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const [row] = await db.select().from(landingPageTable).where(eq(landingPageTable.userId, req.session.userId!)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  res.json({ ...row, username: user?.username ?? "" });
});

router.put("/my/landing", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;
  const parsed = UpdateMyLandingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [existing] = await db.select().from(landingPageTable).where(eq(landingPageTable.userId, req.session.userId!)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db
    .update(landingPageTable)
    .set(parsed.data)
    .where(eq(landingPageTable.id, existing.id))
    .returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  res.json({ ...updated, username: user?.username ?? "" });
});

router.get("/pages/:username", async (req, res): Promise<void> => {
  const { username } = req.params;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const [row] = await db.select().from(landingPageTable).where(eq(landingPageTable.userId, user.id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...row, username: user.username });
});

export default router;
