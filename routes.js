import { Router } from "express";
import { login, register } from './express-handlers';
const router = Router();
const subRouter = Router();

subRouter.use("/register", register);
subRouter.use("/login", login);
router.use("/sub", subRouter);
export default router;
