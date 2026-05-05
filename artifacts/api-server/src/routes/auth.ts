import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
  }
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  req.session.authenticated = true;
  res.json({ authenticated: true });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {});
  res.json({ authenticated: false });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  res.json({ authenticated: !!req.session.authenticated });
});

export default router;
