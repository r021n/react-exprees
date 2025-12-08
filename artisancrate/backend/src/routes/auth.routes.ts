import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema, loginSchema } from "../validators/authValidators";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post("/logout", AuthController.logout);

export default router;
