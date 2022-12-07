import { Router } from "express";
import UserController from "../controllers/user";
import Authentication from "../middlewares/authentication";
import validator from "../middlewares/validator";
import parser from "../middlewares/upload";

import { validateSignup, validateLogin } from "../validations/user";

const router = Router();
const { verifyToken } = Authentication;
const {
  createUser, loginUser, verifyAccount, deactivateUser, reactivateUser
} = UserController;

router.post("/register", validator(validateSignup), parser.single("photo"), createUser);
router.post("/verify", verifyAccount);
router.post("/login", validator(validateLogin), loginUser);

router.get("/deactivate", verifyToken, deactivateUser);
router.get("/reactivate", reactivateUser);

export default router;
