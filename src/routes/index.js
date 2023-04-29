import { Router } from "express";
import authRoutes from "./auth.route.js"
import collectionRoutes from "./collection.route.js"

const router = Router()
router.use("/auth", authRoutes)
router.use("/collection", collectionRoutes)



export default router