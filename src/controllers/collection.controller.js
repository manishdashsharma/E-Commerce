import Collection from "../models/collection.schema.js"
import asyncHandler from "../services/asyncHandler.js"
import CustomError from "../services/CustomError.js"



export const createCollection = asyncHandler( async (req,res) => {
  const { name } = req.body 
  
  if (!name){
      throw new CustomError('Collection name is required',400)
  }

  const collection = await Collection.create({
      name,
  })

  res.status(200).json({
      success: true,
      message: 'Collection created successfully',
      collection
  })
})

export const updateCollection = asyncHandler( async (req,res) =>{
  const { name } = req.body
  const { id: collectionId } = req.params;

  if (!name) {
      throw new CustomError("Collection name is required", 400);
  }
  
  let updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,{ name },
      {
          new: true,
          runValidators: true,
      }
  );

  res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      updateCollection
  })
})

export const deleteCollection = asyncHandler( async (req,res) => {
  const { id: collectionId } = req.params
  
  const collectionToDelete = await Collection.findByIdAndDelete(collectionId)

  if(!collectionId) {
      throw new CustomError('Collection not found',404)
  }
  res.status(200).json({
      success: true,
      message: 'Collection deleted successfully'
  })
})

export const getAllCollections = asyncHandler( async (req,res) => {
  const collections = await Collection.find();

  if(!collections){
      throw new CustomError('Collection not found',404)
  }

  res.status(200).json({
      success: true,
      collections
  })
})