import { Router } from 'express';
import { addProduct, getProductByCollectionId, getProductById, getProduct, deleteProduct, addFavorite } from '../controllers/product.controller.js'
import {  isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRole.js";


const router = Router()

router.post("/", isLoggedIn, authorize(AuthRoles.ADMIN), addProduct)
router.get("/", isLoggedIn, authorize(AuthRoles.ADMIN), getProduct)
router.get("/:id", isLoggedIn, authorize(AuthRoles.ADMIN), getProductById)
router.delete("/delete-product/:id", isLoggedIn, authorize(AuthRoles.ADMIN), deleteProduct)
router.get("/get-by-collection/:id", isLoggedIn, authorize(AuthRoles.ADMIN), getProductByCollectionId)
router.put("/favorites/:id",isLoggedIn, addFavorite)

export default router