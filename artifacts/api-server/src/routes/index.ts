import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import landingRouter from "./landing";
import galleryRouter from "./gallery";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(landingRouter);
router.use(galleryRouter);
router.use(storageRouter);

export default router;
