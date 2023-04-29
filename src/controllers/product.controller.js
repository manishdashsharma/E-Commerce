import Product from "../models/product.schema.js"
import formidable from "formidable"
import { s3FileUpload, s3deleteFile } from "../servies/imageUpload.js"
import mongoose from "mongoose"
import asyncHandler from "../servies/asyncHandler.js"
import CustomError from "../servies/CustomError.js"
import config from "../config/index.js"
import fs from "fs"

/**********************************************************
 * @ADD_PRODUCT
 * @route https://localhost:5000/api/product
 * @description Controller used for creating a new product
 * @description Only admin can create the coupon
 * @descriptio Uses AWS S3 Bucket for image upload
 * @returns Product Object
 *********************************************************/

export const addProduct = asyncHandler( async(req, res) => {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async function (error, fields, files){
        if (error){
            throw new CustomError(error.message || "Something went wrong" , 500)
        }

        let productId = new mongoose.Types.ObjectId().toHexString()
        console.log(fields,files);

        if (
            !fields.name ||
            !fields.price ||
            !fields.description ||
            !fields.collectionId
        ){
            throw new CustomError("Please fill all the fields", 500)
        }

        let imageArrayResp = Promise.all(
            Object.keys(files).map( async(file, index) => {
                const element = file[fileKey]
                console.log(element)
                const data = fs.readFileSync(element.filepath)

                const upload = await s3FileUpload({
                    bucketName: config.S3_BUCKET_NAME,
                    key: `product/${productId}/photo_${index + 1}.png`,
                    body: data,
                    contentType: element.mimetype
                })

                return {
                    secure_url: upload.Location
                }
            })
        )

        let imgArray = await imageArrayResp

        const product = await Product.create({
            _id: productId,
            photos: imgArray,
            ...fields
        })

        if (!product) {
            throw new CustomError("Product failed to be created in DB", 400)
        }
        res.status(200).json({
            success: true,
            product,
        })
    })
})


export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})



export const getProductById = asyncHandler(async (req, res) => {
    const {id: productId} = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No product found", 404)
    }

    res.status(200).json({
        success: true,
        product
    })
})


export const getProductByCollectionId = asyncHandler(async(req, res) => {
    const {id: collectionId} = req.params

    const products = await Product.find({collectionId})

    if (!products) {
        throw new CustomError("No products found", 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})



export const deleteProduct = asyncHandler(async(req, res) => {
    const {id: productId} = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No product found", 404)

    }

    const deletePhotos = Promise.all(
        product.photos.map(async( elem, index) => {
            await s3deleteFile({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${product._id.toString()}/photo_${index + 1}.png`
            })
        })
    )

    await deletePhotos;

    await product.remove()

    res.status(200).json({
        success: true,
        message: "Product has been deleted successfully"
    })
})