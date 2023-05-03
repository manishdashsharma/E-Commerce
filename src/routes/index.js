import { Router } from "express";
import authRoutes from "./auth.route.js"
import collectionRoutes from "./collection.route.js"
import couponRoutes from "./coupon.route.js"
import orderRoutes from "./order.route.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/collection", collectionRoutes)
router.use("/coupon", couponRoutes)
router.use("/order", orderRoutes)



export default router