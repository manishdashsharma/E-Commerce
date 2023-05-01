import { Router } from "express";
import authRoutes from "./auth.route.js"
import collectionRoutes from "./collection.route.js"
import couponSchema from "../models/coupon.schema.js";

const router = Router()
router.use("/auth", authRoutes)
router.use("/collection", collectionRoutes)
router.use("/coupon", couponSchema)



export default router