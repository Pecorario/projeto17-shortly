import { Router } from "express";
import usersRouter from './users.routes.js';
import linksRouter from './links.routes.js';

const router = Router();
router.use(usersRouter);
router.use(linksRouter);

export default router;