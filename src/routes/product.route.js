import { Router } from 'express';
import { addProduct, getProductByCollectionId, getProductById, getProduct, deleteProduct, addFavorite, searchProduct } from '../controllers/product.controller.js'
import {  isLoggedIn, authorize } from "../middlewares/auth.middleware.js";
import AuthRoles from "../utils/authRole.js";


const router = Router()

router.get("/search", searchProduct)
router.post("/", isLoggedIn, authorize(AuthRoles.ADMIN), addProduct)
router.get("/", isLoggedIn, getProduct)
router.get("/:id", isLoggedIn, getProductById)
router.delete("/delete-product/:id", isLoggedIn, authorize(AuthRoles.ADMIN), deleteProduct)
router.get("/get-by-collection/:id", isLoggedIn, authorize(AuthRoles.ADMIN), getProductByCollectionId)
router.put("/favorites/:id",isLoggedIn, addFavorite)

export default router