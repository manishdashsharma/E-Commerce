import { Router } from "express"
import { createCoupon, deleteCoupon, updateCoupon, getAllCoupons , getAllActiveCoupon , disableCopuon } from "../controllers/coupon.controller.js"
import { isLoggedIn , authorize } from "../middlewares/auth.middleware.js"
import AuthRoles from "../utils/authRole.js"

const router = Router()

router.post('/', isLoggedIn , authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR) , createCoupon)
router.put("/:id", isLoggedIn , authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR) , updateCoupon)
router.delete("/:id", isLoggedIn, authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR) , deleteCoupon)
router.get("/", isLoggedIn, authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR) , getAllCoupons)
router.get("/getAllActiveCoupon", getAllActiveCoupon);
router.put("/disableCopuon/:id", disableCopuon);

export default router