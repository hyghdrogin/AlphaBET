import { Router } from "express";
import UserController from "../controllers/user";
import Authentication from "../middlewares/authentication";
import validator from "../middlewares/validator";
import parser from "../middlewares/upload";

import { validateSignup, validateLogin } from "../validations/user";

const router = Router();
const { verifyToken } = Authentication;
const {
  createUser, loginUser, verifyAccount, getProfile, updateProfile, uploadPhoto, deactivateUser, reactivateUser, welcomeBack
} = UserController;

router.post("/register", validator(validateSignup), createUser);
router.post("/verify", verifyAccount);
router.post("/login", validator(validateLogin), loginUser);
router.post("/reactivation", welcomeBack);
router.post("/reactivate", reactivateUser);

router.get("/profile", verifyToken, getProfile);
router.get("/deactivate", verifyToken, deactivateUser);

router.patch("/profile", verifyToken, updateProfile);
router.patch("/picture", verifyToken, parser.single("photo"), uploadPhoto);

export default router;
