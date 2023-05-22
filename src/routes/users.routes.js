import { Router } from "express";
import { createUser, getAllUsers, login, logout } from "../controllers/users.controller.js";

import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { validateCreateUser } from "../middlewares/users.middleware.js";
import { authValidation } from "../middlewares/auth.middleware.js";

import { userSchema } from "../schemas/users.schema.js";
import { loginSchema } from "../schemas/login.schema.js";

const usersRouter = Router();

usersRouter.get("/users", getAllUsers);
usersRouter.post("/signup", validateSchema(userSchema), validateCreateUser, createUser);
usersRouter.post("/signin", validateSchema(loginSchema), login);
usersRouter.post("/logout", authValidation, logout);

export default usersRouter;