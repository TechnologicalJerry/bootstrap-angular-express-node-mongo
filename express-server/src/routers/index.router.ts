import { Router, Request, Response } from "express";
import usersRouter from "./users.router";
import authRouter from "./auth.router";
import productsRouter from "./products.router";

const router = Router();

// Health check endpoint
router.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

// Mount routers
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);

export default router;
