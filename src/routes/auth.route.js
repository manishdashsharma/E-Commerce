import { Router } from "express";
import { getProfile, login, logout, signUp, forgotPassword, resetPassword, updateUserRole } from "../controllers/auth.controller.js";
import {  isLoggedIn , authorize } from "../middlewares/auth.middleware.js";
import AuthRole from "../utils/authRole.js";


const router = Router()

router.post("/signup", signUp)
router.post("/login", login)
router.get("/logout", logout)
router.get("/profile", isLoggedIn, getProfile)
router.post("/password/forgot", forgotPassword)
router.post("/password/reset/:token", resetPassword)
router.put("/updateUserRole",isLoggedIn,updateUserRole)

export default router;