import Coupon from '../models/coupon.schema.js'
import asyncHandler from '../services/asyncHandler.js'
import CustomError from '../services/CustomError.js'

export const createCoupon = asyncHandler( async(req, res) => {
    const { discount , code } = req.body

    if (!code || !discount){
        throw new CustomError("Code and discount are required",400)
    }

    const isCouponExist = await Coupon.findOne({code})
    if (isCouponExist){
        throw new CustomError("All ready exist",400)
    }

    const coupon = await Coupon.create({
        code,
        discount,
    })

    res.status(200).json({
        success: true,
        message: "Coupon created successfully",
        coupon
    })
})

export const updateCouponDiscount = asyncHandler( async(req, res) =>{
    const {id: couponId} = req.params
    const {discount} = req.body
    console.log(discount)
    const coupon = await Coupon.findByIdAndUpdate(
        couponId,{ discount },
        {
            new: true,
            runValidators: true
        }
    )

    if (!coupon) {
        throw new CustomError("Coupon not found", 404)
    }

    res.status(200).json({
        success: true,
        message: "Coupon updated",
        coupon
    })
})

export const deleteCoupon = asyncHandler(async(req, res) => {
    const {id: couponId} = req.params

    const coupon = await Coupon.findByIdAndDelete(couponId)

    if (!coupon) {
        throw new CustomError("Coupon not found", 404)
    }

    res.status(200).json({
        success: true,
        message: "Coupon deleted",
        
    })
})

export const getAllCoupons = asyncHandler( async (req, res) => {
    const allCoupons = await Coupon.find();

    if (!allCoupons) {
        throw new CustomError("No Coupons found", 400)
        
    }

    res.status(200).json({
        success: true,
        allCoupons
    })
    
})

export const getAllActiveCoupon = asyncHandler( async( req,res) => {
    const coupons = await Coupon.find( { active: true} )

    if(!coupons){
        throw new CustomError("No active coupons",404)
    }

    res.status(200).json({
        success: true,
        coupons
    })
})

export const disableCopuon = asyncHandler( async( req,res) =>{
    const {id:couponId} = req.params
    const isExists = await Coupon.findById(couponId)

    if(!isExists){
        throw new CustomError("Coupon not found",404)
    }

    await Coupon.findByIdAndUpdate(couponId,{
        active: false
    })

    res.status(200).json({
        success: true,
        message: "Token was disabled"
    })
})