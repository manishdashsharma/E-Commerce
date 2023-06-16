import Product from '../models/product.schema.js';
import asyncHandler from '../services/asyncHandler.js';
import CustomError from '../services/CustomError.js';
import formidable from 'formidable';
import mongoose from 'mongoose';
import cloudinary from "../config/cloudinary.config.js";
import config from '../config/index.js';


export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async function (error, fields, files) {
    if (error) {
      throw new CustomError(error.message || 'Something went wrong', 500);
    }

    let productId = new mongoose.Types.ObjectId().toHexString();

    if (
      !fields.name ||
      !fields.price ||
      !fields.description ||
      !fields.collectionId
    ) {
      throw new CustomError('Please fill all the fields', 400);
    }
    
    
    let imageUpload = [];
    for (const fileKey in files) {
      const file = files[fileKey];
      const upload = await cloudinary.v2.uploader.upload(file.filepath, {
        folder: config.folderName
      })
      imageUpload.push({ sucure_url: upload.secure_url , public_id: upload.public_id })
    }
    
    const product = await Product.create({
      _id: productId,
      photos: imageUpload,
      ...fields,
    });
    if (!product) {
      throw new CustomError('Product failed to be created in DB', 400);
    }
    res.status(200).json({
      success: true,
      product,
    });
  });
});

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

export const getProduct = asyncHandler(async(req, res) => {
  const product = await Product.find()

  if(!product) {
    throw new CustomError("No product found", 404)
  }

  res.status(200).json({
    success: true,
    product
  })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id: collectionId } = req.params;

  const product = await Product.findById(collectionId);

  if (!product) {
    throw new CustomError('No product found', 404);
  }

  const deleteResult = await cloudinary.v2.uploader.destroy(
    product.photos[0].public_id
  );

  await Product.findByIdAndDelete(collectionId);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

export const addFavorite = asyncHandler( async( req, res) => {
  const { id: collectionId } = req.params

  const product = await Product.findById(collectionId)
  
  if(!product){
    throw new CustomError("Product not found",404)
  }

  product.favorites = !product.favorites
  await product.save()

  res.status(200).json({
    product
  })

})

export const searchProduct = asyncHandler(async (req, res) => {
  const { name } = req.body
  
  if(!name) {
    throw new CustomError("Name required to search",404)
  }
  const products = await Product.find({ name: { $regex: name, $options: "i" } });

  res.status(200).json({
    success: true,
    products
  });
});