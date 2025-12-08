import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/userValidators";

const router = Router();

router.use(authMiddleware);

router.get("/", UserController.getMe);
router.put("/", validateRequest(updateProfileSchema), UserController.updateMe);

router.get("/addresses", UserController.getMyAddresses);
router.post(
  "/addresses",
  validateRequest(createAddressSchema),
  UserController.createMyAddress
);
router.put(
  "/addresses",
  validateRequest(updateAddressSchema),
  UserController.updateMyAddress
);
router.delete("/addresses/:id", UserController.deleteMyAddress);

export default router;
