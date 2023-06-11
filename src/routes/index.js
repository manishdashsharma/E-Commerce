import { Router } from "express";
import authRoutes from "./auth.route.js"
import collectionRoutes from "./collection.route.js"
import productRoute from "./product.route.js"
import couponRoute from "./coupon.route.js";
import orderRoute from "./order.route.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/collection", collectionRoutes)
router.use("/product", productRoute)
router.use("/coupon", couponRoute)
router.use("/order", orderRoute)

export default router