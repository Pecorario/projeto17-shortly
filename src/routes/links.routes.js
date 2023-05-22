import { Router } from "express";
import { createShortenLink, getLinkById } from "../controllers/links.controller.js";

import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { authValidation } from "../middlewares/auth.middleware.js";

import { linkSchema } from "../schemas/links.schema.js";

const linksRouter = Router();

linksRouter.post("/urls/shorten", validateSchema(linkSchema), authValidation, createShortenLink);
linksRouter.get("/urls/:id", getLinkById);

export default linksRouter;