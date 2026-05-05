import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable, landingPageTable, galleryTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }
  const { email, password, name, username } = parsed.data;
  const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (!slug) {
    res.status(400).json({ error: "Nome de usuário inválido" });
    return;
  }
  const existing = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.username, slug)))
    .limit(1);
  if (existing.length > 0) {
    const conflict = existing[0].email === email ? "email" : "username";
    res.status(409).json({ error: conflict === "email" ? "Este email já está em uso" : "Este nome de usuário já está em uso" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, name, username: slug }).returning();
  await db.insert(landingPageTable).values({ userId: user.id, title: name, template: "vivid" });
  await db.insert(galleryTable).values({ userId: user.id, items: [] });
  req.session.userId = user.id;
  res.status(201).json({ id: user.id, email: user.email, name: user.name, username: user.username });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Email ou senha incorretos" });
    return;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Email ou senha incorretos" });
    return;
  }
  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, name: user.name, username: user.username });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({});
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.userId ?? usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    req.session.destroy(() => {});
    res.json({ user: null });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name, username: user.username } });
});

export default router;
