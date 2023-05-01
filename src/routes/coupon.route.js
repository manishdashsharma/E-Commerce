import { Router } from "express"
import { createCoupon, deleteCoupon, updateCoupon, getAllCoupons } from "../controllers/coupon.controller.js"
import { isLoggedIn , authorize } from "../middlewares/auth.middleware.js"
import AuthRoles from "../utils/authRole.js"

const router = Router()

router.post('/', isLoggedIn , authorize(AuthRoles.ADMIN , AuthRoles.MODERATOR) , createCoupon)
router.put("/:id", isLoggedIn , authorize(AuthRoles.ADMIN) , updateCoupon)
router.delete("/:id", isLoggedIn, authorize(AuthRoles.ADMIN) , deleteCoupon)
router.get("/all-coupon", isLoggedIn, authorize(AuthRoles.USER) , getAllCoupons)