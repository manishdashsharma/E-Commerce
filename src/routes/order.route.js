import { Router } from "express";
import { createOrder, placeOrder, getAllOrders, getMyOrders, updateOrderStatus } from '../controllers/order.controller.js'
import {  isLoggedIn , authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRole.js"

const router = Router()

router.post("/create-order", isLoggedIn, createOrder)
router.post("/place-order", isLoggedIn, placeOrder)
router.get("/", isLoggedIn, authorize(AuthRoles.ADMIN), getAllOrders)
router.get("/:id",isLoggedIn,getMyOrders)
router.patch("/:id",isLoggedIn,authorize(AuthRoles.ADMIN),updateOrderStatus)


export default router;